import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, Image, Search, X } from "lucide-react";
import { apiGet, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { submitGallery } from "../lib/contentApi";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput } from "../components/ui/brutal";
import { fonts } from "../config/fonts";
export function GalleryPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [eventOptions, setEventOptions] = useState<any[]>([]);
  const [likedPhotos, setLikedPhotos] = useState<string[]>([]);
  const [submittedPhotos, setSubmittedPhotos] = useState<any[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submittingGallery, setSubmittingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    imageUrl: "",
    eventName: "",
    eventId: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadGallery() {
      const [data, events] = await Promise.all([
        apiGet<any[]>("/api/gallery", { auth: "optional" }).catch(() => []),
        apiGet<any[]>("/api/events").catch(() => []),
      ]);
      if (!mounted) return;
      setSubmittedPhotos((data || []).map((item) => ({
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

  const photos = submittedPhotos;
  const filters = ["all", ...Array.from(new Set(photos.map((photo) => photo.event.toLowerCase())))];
  const filteredPhotos = (selectedFilter === "all"
    ? photos
    : photos.filter(p => p.event.toLowerCase() === selectedFilter))
    .filter((photo) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return [photo.title, photo.event, photo.date].some((value) => String(value || "").toLowerCase().includes(query));
    });
  const selectedPhoto = selectedPhotoIndex === null ? null : filteredPhotos[selectedPhotoIndex];

  const toggleLike = async (photoId: string) => {
    try {
      const result = await apiPost<{ liked: boolean; likes_count: number }>(`/api/gallery/${photoId}/like`, {}, { auth: true });
      setLikedPhotos((current) => result.liked ? Array.from(new Set([...current, photoId])) : current.filter((id) => id !== photoId));
      setSubmittedPhotos((current) => current.map((photo) => photo.id === photoId ? {
        ...photo,
        likes: result.likes_count,
        liked: result.liked,
      } : photo));
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
      const urls = galleryForm.imageUrl
        .split(/[,\n]/)
        .map((url) => url.trim())
        .filter(Boolean);
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

  return (
    <div className="pt-16 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-flex items-center gap-1">
          <Image size={10} /> MEMORIES
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Gallery
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Capturing moments from our workshops, events, and community gatherings
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search gallery..."
            className="w-full pl-12 pr-4 py-3 border-2 border-[#171717] font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30"
          />
        </div>
      <div className="flex justify-center md:justify-end gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-6 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
              selectedFilter === filter
                ? "bg-[#2563EB] text-white"
                : "bg-white text-[#171717] hover:bg-[#F4EFEB]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#171717] bg-white">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>No photos yet</p>
          <p className="text-sm font-mono text-slate-400 mt-2">Approved gallery submissions will appear here.</p>
        </div>
      ) : (
      <div className="grid md:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <BrutalCard key={photo.id} className="p-0 overflow-hidden group cursor-pointer" onClick={() => setSelectedPhotoIndex(filteredPhotos.findIndex((item) => item.id === photo.id))}>
            <div className="aspect-video overflow-hidden relative">
              <img loading="lazy"
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <BrutalBadge className="opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW
                </BrutalBadge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BrutalBadge color="bg-[#2563EB]" className="text-[8px]">{photo.event}</BrutalBadge>
                <span className="text-xs text-slate-400 font-mono">{photo.date}</span>
              </div>
              <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>{photo.title}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleLike(photo.id);
                  }}
                  className="inline-flex items-center gap-1 font-bold"
                >
                  <Heart size={12} className={likedPhotos.includes(photo.id) ? "fill-[#FB7185] text-[#FB7185]" : "text-[#FB7185]"} />
                  <span>{photo.likes || 0} likes</span>
                </button>
              </div>
            </div>
          </BrutalCard>
        ))}
      </div>
      )}

      {/* Upload CTA */}
      <BrutalCard color="bg-[#FFE800]" className="mt-12 text-center">
        <Image size={32} className="mx-auto mb-4" />
        <h3 className="text-2xl uppercase mb-2" style={fonts.display}>Have Photos to Share?</h3>
        <p className="text-slate-700 mb-4">
          Help us build our community gallery by sharing your event photos!
        </p>
        <BrutalButton color="bg-[#171717]" text="text-white" onClick={() => setShowSubmitForm(!showSubmitForm)}>
          Upload Photos
        </BrutalButton>
        {showSubmitForm && (
          <form onSubmit={submitGalleryPhoto} className="mt-6 max-w-2xl mx-auto text-left">
            <BrutalInput
              label="Photo Title"
              value={galleryForm.title}
              onChange={(event: any) => setGalleryForm({ ...galleryForm, title: event.target.value })}
              required
            />
            <BrutalInput
              label="Image URLs"
              value={galleryForm.imageUrl}
              onChange={(event: any) => setGalleryForm({ ...galleryForm, imageUrl: event.target.value })}
              placeholder="Add one or more image URLs, separated by commas or new lines"
              required
            />
            <BrutalInput
              label="Event Name"
              value={galleryForm.eventName}
              onChange={(event: any) => setGalleryForm({ ...galleryForm, eventName: event.target.value })}
              placeholder="Workshop, Hackathon, Community"
            />
            {eventOptions.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Link Event</label>
                <select
                  value={galleryForm.eventId}
                  onChange={(event: any) => {
                    const selected = eventOptions.find((item) => item.id === event.target.value);
                    setGalleryForm({
                      ...galleryForm,
                      eventId: event.target.value,
                      eventName: selected?.title || galleryForm.eventName,
                    });
                  }}
                  className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
                >
                  <option value="">No linked event</option>
                  {eventOptions.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
            )}
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full" disabled={submittingGallery}>
              {submittingGallery ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
          </form>
        )}
        {submitStatus && <p className="mt-4 text-sm font-bold">{submitStatus}</p>}
      </BrutalCard>
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 p-4 md:p-8 flex items-center justify-center" role="dialog" aria-modal="true">
          <button onClick={() => setSelectedPhotoIndex(null)} className="absolute top-4 right-4 bg-white border-2 border-[#171717] p-3">
            <X size={20} />
          </button>
          <button
            onClick={() => setSelectedPhotoIndex((current) => current === null ? current : Math.max(0, current - 1))}
            className="absolute left-3 md:left-8 bg-white border-2 border-[#171717] p-3 disabled:opacity-30"
            disabled={selectedPhotoIndex === 0}
          >
            <ChevronLeft size={24} />
          </button>
          <img loading="lazy" src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-[78vh] max-w-full object-contain border-2 border-white" />
          <button
            onClick={() => setSelectedPhotoIndex((current) => current === null ? current : Math.min(filteredPhotos.length - 1, current + 1))}
            className="absolute right-3 md:right-8 bg-white border-2 border-[#171717] p-3 disabled:opacity-30"
            disabled={selectedPhotoIndex === filteredPhotos.length - 1}
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 bg-white border-2 border-[#171717] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl uppercase" style={fonts.display}>{selectedPhoto.title}</h3>
                <p className="font-mono text-xs text-slate-600">{selectedPhoto.event} {selectedPhoto.date && `- ${selectedPhoto.date}`}</p>
              </div>
              <button onClick={() => toggleLike(selectedPhoto.id)} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                <Heart size={16} className={likedPhotos.includes(selectedPhoto.id) ? "fill-[#FB7185] text-[#FB7185]" : "text-[#FB7185]"} />
                Like
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// âââ 6. USER PROFILE PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
