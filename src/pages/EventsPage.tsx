import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Database, Users, ArrowRight, ArrowLeft, Search, Camera, Check, Calendar, MapPin, Tag, QrCode, Trophy, TrendingUp, Bell, Zap, Target, Star, Award, Clock, BookOpen, Code, GitBranch, Home, Mail, UserCheck, GraduationCap, User, FileText } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { getPersistenceLabel, publishBlogPost, submitEventProposal, submitProject } from "../lib/contentApi";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalField, BrutalTextArea } from "../components/ui/brutal";
import { requireLoginForAction } from "../utils/authNavigation";
const fonts = {
  display: { fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0" },
  sans: { fontFamily: "'Inter', sans-serif" },
  serif: { fontFamily: "'Newsreader', serif" },
};

export function EventsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let mounted = true;
    async function loadEvents() {
      setLoadingEvents(true);
      try {
        const data = await apiGet<any[]>("/api/events").catch(() => []);
        if (!mounted) return;
        const uniqueEvents = (data || [])
          .filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index)
          .sort((a, b) => String(a.start_time || "").localeCompare(String(b.start_time || "")));
        const colors = ["bg-[#2563EB]", "bg-[#FB7185]", "bg-[#171717]", "bg-[#7C3AED]"];
        const today = new Date();
        setAllEvents(uniqueEvents.map((event, index) => {
          const start = event.start_time ? new Date(event.start_time) : new Date(event.created_at || Date.now());
          const total = Number(event.capacity || 0);
          const filled = Number(event.registeredCount || event.registered_count || 0);
          return {
            id: event.id,
            slug: event.slug,
            title: event.title,
            date: start.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
            dateSort: start.toISOString().slice(0, 10),
            type: (event.event_type || "EVENT").toUpperCase(),
            total,
            filled,
            color: colors[index % colors.length],
            status: start >= today ? "upcoming" : "past",
          };
        }));
      } finally {
        if (mounted) setLoadingEvents(false);
      }
    }
    loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = allEvents
    .filter(ev => {
      const matchesTab = activeTab === "all" || ev.status === activeTab;
      const matchesType = typeFilter === "all" || ev.type === typeFilter;
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "date-asc") return a.dateSort.localeCompare(b.dateSort);
      if (sortOrder === "date-desc") return b.dateSort.localeCompare(a.dateSort);
      if (sortOrder === "popular") return b.filled - a.filled;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-[#171717] pb-8 mb-10 gap-6">
        <div>
          <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-block">Events Sandbox</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Events</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} event{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <BrutalButton
          color="bg-[#2563EB]"
          text="text-white"
          className="w-full self-stretch text-sm sm:w-auto md:self-start"
          onClick={() => navigate("/events/propose")}
        >
          <Calendar size={14} className="inline mr-2" />
          Propose Event
        </BrutalButton>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
          className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["upcoming", "past", "all"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); resetPage(); }}
              className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === tab ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {["all", "WORKSHOP", "SEMINAR", "COMPETITION", "COMMUNITY"].map(type => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); resetPage(); }}
              className={`px-3 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-[10px] transition-all ${
                typeFilter === type ? "bg-[#2563EB] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
          <select
            value={sortOrder}
            onChange={e => { setSortOrder(e.target.value); resetPage(); }}
            className="px-3 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-[10px] bg-white focus:outline-none cursor-pointer"
          >
            <option value="date-asc">Date ?</option>
            <option value="date-desc">Date ?</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingEvents ? "Loading events" : "No events found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingEvents ? "Please wait..." : "Approved events will appear here after admin review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map(ev => {
            const pct = ev.total ? Math.round((ev.filled / ev.total) * 100) : 0;
            return (
              <div
                key={ev.id}
                onClick={() => navigate(`/events/${ev.slug || ev.id}`)}
                className={`relative cursor-pointer ${ev.color} border-2 border-[#171717] p-6 flex flex-col text-white brutal-shadow-lg brutal-shadow-hover transition-all group`}
              >
                {(ev as any).hot && (
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full border-2 border-[#171717] flex items-center justify-center text-[#171717] bg-[#FFE800] text-xs font-bold rotate-12">HOT</div>
                )}
                {ev.status === "past" && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 border border-white/30 text-[9px] font-bold uppercase tracking-widest">PAST</div>
                )}
                <div className="text-6xl font-bold leading-none mb-1" style={fonts.display}>{ev.date.split(" ")[0]}</div>
                <div className="text-sm font-bold tracking-widest mb-5 opacity-80">{ev.date.split(" ").slice(1).join(" ")}</div>
                <h3 className="text-xl font-bold leading-tight mb-4 flex-1" style={fonts.sans}>{ev.title}</h3>
                <div className="flex items-center justify-between mb-3">
                  <BrutalBadge color="bg-white" text="text-[#171717]">{ev.type}</BrutalBadge>
                  <span className="text-xs font-mono opacity-80">{ev.filled}/{ev.total}</span>
                </div>
                <div className="w-full bg-white/20 h-1.5">
                  <div className="bg-white h-1.5 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 text-[10px] font-mono opacity-60">{pct}% filled</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            ? Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-[#171717] font-bold text-sm transition-all ${
                currentPage === page ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            Next ?
          </button>
        </div>
      )}
    </div>
  );
}
