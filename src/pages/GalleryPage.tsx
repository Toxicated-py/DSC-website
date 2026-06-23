import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronLeft, ChevronRight, Heart, MessageCircle, MoreHorizontal, Send, Upload, X, ZoomIn } from "lucide-react";
import { apiGet, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { submitGallery } from "../lib/contentApi";
import { fonts } from "../config/fonts";

type GalleryPhoto = {
  id: string;
  url: string;
  title: string;
  caption: string;
  tags: string[];
  event: string;
  eventId: string;
  type: string;
  date: string;
  submittedBy: string;
  likes: number;
  liked: boolean;
};

type GalleryPost = {
  id: string;
  event: string;
  type: string;
  date: string;
  postedBy: string;
  caption: string;
  tags: string[];
  photos: GalleryPhoto[];
};

type LocalComment = {
  id: number;
  author: string;
  role: string;
  avatar: string;
  text: string;
  time: string;
};

const TYPE_COLORS: Record<string, string> = {
  workshop: "bg-[#2563EB]",
  competition: "bg-[#171717]",
  talk: "bg-[#7C3AED]",
  social: "bg-[#FB7185]",
};

const normalizeType = (value: string) => {
  const type = String(value || "").toLowerCase();
  if (type.includes("competition") || type.includes("hackathon")) return "competition";
  if (type.includes("talk") || type.includes("seminar")) return "talk";
  if (type.includes("workshop")) return "workshop";
  return "social";
};

const parseTags = (value: string) => value.split(",").map((tag) => tag.trim()).filter(Boolean);

export function GalleryPage() {
  const navigate = useNavigate();
  const [activeIndexes, setActiveIndexes] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [eventOptions, setEventOptions] = useState<any[]>([]);
  const [likedPhotos, setLikedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [commentsOpen, setCommentsOpen] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, LocalComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<{ postId: string; index: number } | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submittingGallery, setSubmittingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: "", caption: "", tags: "", imageUrl: "", eventName: "", eventId: "" });

  useEffect(() => {
    let mounted = true;

    async function loadGallery() {
      const [data, events] = await Promise.all([
        apiGet<any[]>("/api/gallery", { auth: "optional" }).catch(() => []),
        apiGet<any[]>("/api/events").catch(() => []),
      ]);
      if (!mounted) return;
      const eventById = new Map((events || []).map((event) => [event.id, event]));
      setPhotos((data || []).map((item) => {
        const event = eventById.get(item.event_id);
        return {
          id: item.id,
          url: item.image_url,
          title: item.title,
          caption: item.caption || "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          event: item.event_name || event?.title || "Community",
          eventId: item.event_id || "",
          type: normalizeType(event?.event_type || item.event_type || item.event_name),
          date: item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "",
          submittedBy: item.submitted_by_name || "Club Member",
          likes: Number(item.likes_count || 0),
          liked: Boolean(item.liked_by_me),
        };
      }));
      setLikedPhotos((data || []).filter((item) => item.liked_by_me).map((item) => item.id));
      setEventOptions(events || []);
    }

    loadGallery();
    return () => {
      mounted = false;
    };
  }, []);

  const posts = useMemo(() => {
    const grouped = new Map<string, GalleryPhoto[]>();
    for (const photo of photos) {
      const key = photo.eventId || photo.event;
      grouped.set(key, [...(grouped.get(key) || []), photo]);
    }
    return Array.from(grouped.entries()).map(([id, group]) => ({
      id,
      event: group[0].event,
      type: group[0].type,
      date: group[0].date,
      postedBy: group[0].submittedBy,
      caption: group.map((photo) => photo.caption || photo.title).filter(Boolean).join(" · "),
      tags: Array.from(new Set(group.flatMap((photo) => photo.tags))),
      photos: group,
    }));
  }, [photos]);
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) => [
      post.postedBy,
      post.caption,
      post.tags.join(" "),
    ].some((value) => value.toLowerCase().includes(query)));
  }, [posts, searchQuery]);
  const lightboxPost = lightbox ? posts.find((post) => post.id === lightbox.postId) : null;

  const activePhoto = (post: GalleryPost) => post.photos[activeIndexes[post.id] || 0] || post.photos[0];
  const movePost = (post: GalleryPost, direction: number) => {
    setActiveIndexes((current) => {
      const next = ((current[post.id] || 0) + direction + post.photos.length) % post.photos.length;
      return { ...current, [post.id]: next };
    });
  };

  const toggleLike = async (photoId: string) => {
    try {
      const result = await apiPost<{ liked: boolean; likes_count: number }>(`/api/gallery/${photoId}/like`, {}, { auth: true });
      setLikedPhotos((current) => result.liked ? Array.from(new Set([...current, photoId])) : current.filter((id) => id !== photoId));
      setPhotos((current) => current.map((photo) => photo.id === photoId ? { ...photo, likes: result.likes_count, liked: result.liked } : photo));
    } catch (error: any) {
      if (error?.status === 401) {
        navigate("/login?redirect=/gallery");
        return;
      }
      setSubmitStatus(userFriendlyErrorMessage(error, "Could not update like. Please try again."));
    }
  };

  const submitComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setComments((current) => ({
      ...current,
      [postId]: [...(current[postId] || []), { id: Date.now(), author: "You", role: "Member", avatar: "YO", text, time: "Just now" }],
    }));
    setCommentInputs((current) => ({ ...current, [postId]: "" }));
    setCommentsOpen((current) => ({ ...current, [postId]: true }));
  };

  const deleteComment = (postId: string, commentId: number) => {
    setComments((current) => ({
      ...current,
      [postId]: (current[postId] || []).filter((comment) => comment.id !== commentId),
    }));
  };

  const submitGalleryPhoto = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingGallery) return;
    setSubmitStatus("");
    setSubmittingGallery(true);
    try {
      const urls = galleryForm.imageUrl.split(/[,\n]/).map((url) => url.trim()).filter(Boolean);
      if (!urls.length) {
        setSubmitStatus("Add at least one image URL.");
        return;
      }
      await Promise.all(urls.map((url, index) => submitGallery({
        title: urls.length === 1 ? galleryForm.title.trim() : `${galleryForm.title.trim()} ${index + 1}`.trim(),
        caption: galleryForm.caption.trim() || null,
        tags: parseTags(galleryForm.tags),
        image_url: url,
        event_name: galleryForm.eventName.trim() || "Community",
        event_id: galleryForm.eventId || null,
      })));
      setGalleryForm({ title: "", caption: "", tags: "", imageUrl: "", eventName: "", eventId: "" });
      setSubmitStatus("Photo submitted for admin approval.");
      setShowSubmitForm(false);
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes("log in")) {
        navigate("/login?redirect=/gallery");
        return;
      }
      setSubmitStatus(userFriendlyErrorMessage(error, "Could not submit photo. Please check the image link and try again."));
    } finally {
      setSubmittingGallery(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFEB] pb-20">
      <header className="mx-auto max-w-[860px] px-5 pt-24 pb-10">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Sarathi · SMS TU</p>
            <h1 className="text-6xl uppercase leading-none text-[#171717] md:text-8xl" style={fonts.display}>Gallery</h1>
            <p className="mt-2 text-lg text-slate-600">Moments from our events &amp; community</p>
          </div>
          <button onClick={() => setShowSubmitForm((open) => !open)} className="inline-flex items-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg hover:bg-[#2563EB]">
            <Upload size={15} /> Upload
          </button>
        </div>
      </header>

      {showSubmitForm && (
        <section className="mx-auto mt-6 max-w-[720px] px-4">
          <form onSubmit={submitGalleryPhoto} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-3xl uppercase" style={fonts.display}>Upload Photos</h2>
            <div className="grid gap-4">
              <input value={galleryForm.title} onChange={(event) => setGalleryForm({ ...galleryForm, title: event.target.value })} required placeholder="Photo title" className="rounded-xl border border-slate-200 p-3 font-mono text-sm" />
              <textarea value={galleryForm.caption} onChange={(event) => setGalleryForm({ ...galleryForm, caption: event.target.value })} placeholder="Caption" className="min-h-24 rounded-xl border border-slate-200 p-3 font-mono text-sm" />
              <input value={galleryForm.tags} onChange={(event) => setGalleryForm({ ...galleryForm, tags: event.target.value })} placeholder="Tags, comma separated" className="rounded-xl border border-slate-200 p-3 font-mono text-sm" />
              <textarea value={galleryForm.imageUrl} onChange={(event) => setGalleryForm({ ...galleryForm, imageUrl: event.target.value })} required placeholder="Image URLs, separated by commas or new lines" className="min-h-24 rounded-xl border border-slate-200 p-3 font-mono text-sm" />
              <input value={galleryForm.eventName} onChange={(event) => setGalleryForm({ ...galleryForm, eventName: event.target.value })} placeholder="Event name" className="rounded-xl border border-slate-200 p-3 font-mono text-sm" />
              {eventOptions.length > 0 && (
                <select
                  value={galleryForm.eventId}
                  onChange={(event) => {
                    const selected = eventOptions.find((item) => item.id === event.target.value);
                    setGalleryForm({ ...galleryForm, eventId: event.target.value, eventName: selected?.title || galleryForm.eventName });
                  }}
                  className="rounded-xl border border-slate-200 p-3 font-mono text-sm"
                >
                  <option value="">No linked event</option>
                  {eventOptions.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                </select>
              )}
            </div>
            <button type="submit" disabled={submittingGallery} className="mt-4 w-full rounded-xl bg-[#2563EB] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50">
              {submittingGallery ? "Submitting..." : "Submit For Review"}
            </button>
          </form>
        </section>
      )}

      {submitStatus && <p className="mx-auto mt-4 max-w-[720px] px-4 text-sm font-bold text-[#2563EB]">{submitStatus}</p>}

      <main className="mx-auto max-w-[720px] px-4 py-8">
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search publisher, caption, or tags" className="mb-6 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm shadow-lg outline-none focus:ring-4 focus:ring-[#2563EB]/20" />
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-xl">
            <Camera size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-2xl uppercase text-slate-400" style={fonts.display}>No Posts Yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => {
              const photo = activePhoto(post);
              const postComments = comments[post.id] || [];
              return (
                <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-md ${TYPE_COLORS[post.type] || TYPE_COLORS.social} text-white`}>
                        <Camera size={18} />
                      </div>
                      <div>
                        <h2 className="font-bold text-[#171717]">{post.event}</h2>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${TYPE_COLORS[post.type] || TYPE_COLORS.social}`} />
                          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{post.type} · {post.date || "Date TBA"}</span>
                        </div>
                      </div>
                    </div>
                    <MoreHorizontal size={20} className="text-slate-400" />
                  </div>

                  <div className="relative bg-[#171717]">
                    <button onClick={() => setLightbox({ postId: post.id, index: activeIndexes[post.id] || 0 })} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white">
                      <ZoomIn size={16} />
                    </button>
                    {post.photos.length > 1 && <span className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 font-mono text-xs font-bold text-white">{(activeIndexes[post.id] || 0) + 1} / {post.photos.length}</span>}
                    <img src={photo.url} alt={photo.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    {post.photos.length > 1 && (
                      <>
                        <button onClick={() => movePost(post, -1)} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#171717] shadow-lg">
                          <ChevronLeft size={22} />
                        </button>
                        <button onClick={() => movePost(post, 1)} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#171717] shadow-lg">
                          <ChevronRight size={22} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                          {post.photos.map((_, index) => (
                            <button key={index} onClick={() => setActiveIndexes((current) => ({ ...current, [post.id]: index }))} className={`h-2 rounded-full bg-white ${index === (activeIndexes[post.id] || 0) ? "w-6" : "w-2 opacity-50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="px-5 py-4">
                    <div className="mb-3 flex items-center gap-5">
                      <button onClick={() => toggleLike(photo.id)} className="inline-flex items-center gap-2 text-slate-500">
                        <Heart size={24} className={likedPhotos.includes(photo.id) ? "fill-[#FB7185] text-[#FB7185]" : ""} />
                        <span className="font-semibold">{photo.likes || 0}</span>
                      </button>
                      <button onClick={() => setCommentsOpen((current) => ({ ...current, [post.id]: !current[post.id] }))} className="inline-flex items-center gap-2 text-[#2563EB]">
                        <MessageCircle size={24} />
                        <span className="font-semibold">{postComments.length}</span>
                      </button>
                    </div>
                    <p className="text-[15px] leading-7 text-[#171717]">
                      <span className="mr-2 font-bold">@{post.postedBy}</span>
                      {post.caption}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">#{tag}</span>)}
                      </div>
                    )}

                    {(commentsOpen[post.id] || postComments.length > 0) && (
                      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                        {postComments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">{comment.avatar}</div>
                            <div className="flex-1 rounded-lg bg-slate-50 px-4 py-3">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold">{comment.author}</span>
                                <span className="rounded bg-[#FFE800] px-2 py-0.5 text-[10px] font-bold uppercase">{comment.role}</span>
                                <span className="font-mono text-[10px] text-slate-400">{comment.time}</span>
                                {comment.author === "You" && (
                                  <button onClick={() => deleteComment(post.id, comment.id)} className="ml-auto text-[10px] font-bold uppercase tracking-widest text-[#FB7185] hover:text-[#171717]">
                                    Delete
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-slate-700">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#171717] bg-[#FFE800] text-xs font-bold">YO</div>
                      <div className="flex flex-1 items-center rounded-full bg-slate-100 pl-4 pr-1">
                        <input value={commentInputs[post.id] || ""} onChange={(event) => setCommentInputs((current) => ({ ...current, [post.id]: event.target.value }))} onKeyDown={(event) => event.key === "Enter" && submitComment(post.id)} placeholder="Add a comment..." className="flex-1 bg-transparent py-3 text-sm outline-none" />
                        <button onClick={() => submitComment(post.id)} disabled={!commentInputs[post.id]?.trim()} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white disabled:opacity-30">
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {lightbox && lightboxPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
            <X size={22} />
          </button>
          <img onClick={(event) => event.stopPropagation()} src={lightboxPost.photos[lightbox.index]?.url} alt={lightboxPost.event} className="max-h-[82vh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
