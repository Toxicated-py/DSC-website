import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronLeft, ChevronRight, Heart, Image, Search, Upload, X } from "lucide-react";
import { apiGet, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { submitGallery } from "../lib/contentApi";
import { DSC_LOGO_SRC } from "../config/assets";
import { fonts } from "../config/fonts";

type GalleryPhoto = {
  id: string;
  url: string;
  title: string;
  event: string;
  eventId: string;
  date: string;
  likes: number;
  liked: boolean;
};

const TYPE_COLORS = ["bg-[#2563EB]", "bg-[#7C3AED]", "bg-[#FB7185]", "bg-[#171717]"];

export function GalleryPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [eventOptions, setEventOptions] = useState<any[]>([]);
  const [likedPhotos, setLikedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submittingGallery, setSubmittingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: "", imageUrl: "", eventName: "", eventId: "" });

  useEffect(() => {
    let mounted = true;

    async function loadGallery() {
      const [data, events] = await Promise.all([
        apiGet<any[]>("/api/gallery", { auth: "optional" }).catch(() => []),
        apiGet<any[]>("/api/events").catch(() => []),
      ]);
      if (!mounted) return;
      setPhotos((data || []).map((item) => ({
        id: item.id,
        url: item.image_url,
        title: item.title,
        event: item.event_name || "Community",
        eventId: item.event_id || "",
        date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
        likes: Number(item.likes_count || 0),
        liked: Boolean(item.liked_by_me),
      })));
      setLikedPhotos((data || []).filter((item) => item.liked_by_me).map((item) => item.id));
      setEventOptions(events || []);
    }

    loadGallery();
    return () => {
      mounted = false;
    };
  }, []);

  const filters = useMemo(() => ["all", ...Array.from(new Set(photos.map((photo) => photo.event.toLowerCase())))], [photos]);
  const filteredPhotos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return photos
      .filter((photo) => selectedFilter === "all" || photo.event.toLowerCase() === selectedFilter)
      .filter((photo) => !query || [photo.title, photo.event, photo.date].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [photos, searchQuery, selectedFilter]);
  const selectedPhoto = selectedPhotoIndex === null ? null : filteredPhotos[selectedPhotoIndex];

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
        image_url: url,
        event_name: galleryForm.eventName.trim() || "Community",
        event_id: galleryForm.eventId || null,
      })));
      setGalleryForm({ title: "", imageUrl: "", eventName: "", eventId: "" });
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

  const moveLightbox = (direction: number) => {
    setSelectedPhotoIndex((current) => {
      if (current === null) return current;
      return Math.min(filteredPhotos.length - 1, Math.max(0, current + direction));
    });
  };

  return (
    <div className="min-h-screen bg-[#F4EFEB] pb-20">
      <section className="border-b-2 border-[#171717] px-4 pt-24 pb-8 md:px-8">
        <div className="mx-auto flex max-w-[980px] flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full border-2 border-[#171717] bg-white p-[2px]">
              <img src={DSC_LOGO_SRC} alt="Data Science Club logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Science Club - SMS TU</p>
              <h1 className="text-5xl uppercase leading-none text-[#171717] md:text-7xl" style={fonts.display}>Gallery</h1>
              <p className="mt-2 text-sm text-slate-600">Moments from workshops, events, and community work.</p>
            </div>
          </div>
          <button
            onClick={() => setShowSubmitForm((open) => !open)}
            className="inline-flex items-center justify-center gap-2 border-2 border-[#171717] bg-[#171717] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white brutal-shadow hover:bg-[#2563EB]"
          >
            <Upload size={14} /> Upload Photos
          </button>
        </div>
      </section>

      <section className="sticky top-0 z-30 border-b-2 border-[#171717] bg-[#F4EFEB]/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto grid max-w-[980px] gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search gallery..."
              className="w-full border-2 border-[#171717] bg-white py-3 pl-11 pr-4 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/25"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`whitespace-nowrap border-2 border-[#171717] px-4 py-3 text-xs font-bold uppercase tracking-widest ${
                  selectedFilter === filter ? "bg-[#FFE800] text-[#171717]" : "bg-white text-slate-600 hover:bg-[#171717] hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {showSubmitForm && (
        <section className="mx-auto mt-6 max-w-[980px] px-4 md:px-8">
          <form onSubmit={submitGalleryPhoto} className="border-2 border-[#171717] bg-white p-5 brutal-shadow">
            <h2 className="mb-4 text-3xl uppercase" style={fonts.display}>Submit Photos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-widest">
                Photo Title
                <input value={galleryForm.title} onChange={(event) => setGalleryForm({ ...galleryForm, title: event.target.value })} required className="mt-2 w-full border-2 border-[#171717] p-3 font-mono text-sm" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-widest">
                Event Name
                <input value={galleryForm.eventName} onChange={(event) => setGalleryForm({ ...galleryForm, eventName: event.target.value })} placeholder="Workshop, Hackathon, Community" className="mt-2 w-full border-2 border-[#171717] p-3 font-mono text-sm" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-widest md:col-span-2">
                Image URLs
                <textarea value={galleryForm.imageUrl} onChange={(event) => setGalleryForm({ ...galleryForm, imageUrl: event.target.value })} required placeholder="Add one or more image URLs, separated by commas or new lines" className="mt-2 min-h-28 w-full border-2 border-[#171717] p-3 font-mono text-sm" />
              </label>
              {eventOptions.length > 0 && (
                <label className="block text-xs font-bold uppercase tracking-widest md:col-span-2">
                  Link Event
                  <select
                    value={galleryForm.eventId}
                    onChange={(event) => {
                      const selected = eventOptions.find((item) => item.id === event.target.value);
                      setGalleryForm({ ...galleryForm, eventId: event.target.value, eventName: selected?.title || galleryForm.eventName });
                    }}
                    className="mt-2 w-full border-2 border-[#171717] p-3 font-mono text-sm"
                  >
                    <option value="">No linked event</option>
                    {eventOptions.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                  </select>
                </label>
              )}
            </div>
            <button type="submit" disabled={submittingGallery} className="mt-5 w-full border-2 border-[#171717] bg-[#2563EB] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white brutal-shadow disabled:opacity-50">
              {submittingGallery ? "Submitting..." : "Submit For Review"}
            </button>
          </form>
        </section>
      )}

      {submitStatus && <p className="mx-auto mt-5 max-w-[980px] px-4 text-sm font-bold text-[#2563EB] md:px-8">{submitStatus}</p>}

      <main className="mx-auto max-w-[720px] px-4 py-6 md:px-6">
        {filteredPhotos.length === 0 ? (
          <div className="border-2 border-dashed border-[#171717] bg-white py-20 text-center">
            <Camera size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-2xl uppercase text-slate-400" style={fonts.display}>No Photos Yet</p>
            <p className="mt-2 font-mono text-sm text-slate-400">Approved submissions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPhotos.map((photo, index) => {
              const color = TYPE_COLORS[index % TYPE_COLORS.length];
              return (
                <article key={photo.id} className="overflow-hidden border-2 border-[#171717] bg-white brutal-shadow">
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color} text-white`}>
                        <Camera size={16} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase leading-tight">{photo.event}</h2>
                        <p className="font-mono text-[10px] uppercase text-slate-400">{photo.date || "Date TBA"}</p>
                      </div>
                    </div>
                    <span className="border-2 border-[#171717] bg-[#FFE800] px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Photo</span>
                  </div>
                  <button className="block w-full bg-[#171717]" onClick={() => setSelectedPhotoIndex(index)}>
                    <img src={photo.url} alt={photo.title} className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.02]" loading="lazy" />
                  </button>
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-2xl uppercase leading-tight" style={fonts.display}>{photo.title}</h3>
                      <button onClick={() => toggleLike(photo.id)} className="inline-flex items-center gap-2 font-bold text-[#FB7185]">
                        <Heart size={18} className={likedPhotos.includes(photo.id) ? "fill-[#FB7185]" : ""} />
                        <span>{photo.likes || 0}</span>
                      </button>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">Shared from {photo.event}. Open the photo to view it larger.</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true">
          <button onClick={() => setSelectedPhotoIndex(null)} className="absolute right-4 top-4 border-2 border-white bg-white p-3 text-[#171717]">
            <X size={20} />
          </button>
          <button onClick={() => moveLightbox(-1)} disabled={selectedPhotoIndex === 0} className="absolute left-3 border-2 border-white bg-white p-3 disabled:opacity-30 md:left-8">
            <ChevronLeft size={24} />
          </button>
          <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-[78vh] max-w-full border-2 border-white object-contain" />
          <button onClick={() => moveLightbox(1)} disabled={selectedPhotoIndex === filteredPhotos.length - 1} className="absolute right-3 border-2 border-white bg-white p-3 disabled:opacity-30 md:right-8">
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-4 right-4 border-2 border-[#171717] bg-white p-4 md:left-8 md:right-8">
            <h3 className="text-2xl uppercase" style={fonts.display}>{selectedPhoto.title}</h3>
            <p className="font-mono text-xs text-slate-600">{selectedPhoto.event} {selectedPhoto.date && `- ${selectedPhoto.date}`}</p>
          </div>
        </div>
      )}
    </div>
  );
}
