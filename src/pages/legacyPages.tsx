import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Database, Users, ArrowRight, ArrowLeft, Search, Camera, Check, Calendar, MapPin, Tag, QrCode, Trophy, TrendingUp, Bell, Zap, Target, Star, Award, Clock, BookOpen, Code, GitBranch, Home, Mail, UserCheck, GraduationCap, User, FileText } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { getPersistenceLabel, publishBlogPost, submitEventProposal, submitProject } from "../lib/contentApi";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalField, BrutalTextArea } from "../components/ui/brutal";
const fonts = {
  display: { fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0" },
  sans: { fontFamily: "'Inter', sans-serif" },
  serif: { fontFamily: "'Newsreader', serif" },
};

function requireLoginForAction(navigate: ReturnType<typeof useNavigate>, returnTo: string) {
  if (!isSupabaseConfigured || !supabase || localStorage.getItem("dsc-auth-state") !== "logged-in") {
    localStorage.setItem("dsc-auth-state", "logged-out");
    navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
    return false;
  }
  return true;
}



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

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reserveStatus, setReserveStatus] = useState("");
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [canManageEvent, setCanManageEvent] = useState(false);
  const [myRegistration, setMyRegistration] = useState<any>(null);
  const [managerStatus, setManagerStatus] = useState("");
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [reservingSpot, setReservingSpot] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadEventDetails() {
      if (!id) {
        setLoadingEvent(false);
        return;
      }

      const event = await apiGet<any>(`/api/events/${id}`).catch(() => null);
      if (!mounted) return;
      if (!event) {
        setLoadingEvent(false);
        return;
      }

      setEventInfo(event);
      setLoadingEvent(false);

      const workspace = await apiGet<any>(`/api/events/${id}/workspace`, { auth: "optional" }).catch(() => null);
      if (!mounted || !workspace?.event) return;

      setEventInfo(workspace.event);
      setCanManageEvent(Boolean(workspace.can_manage));
      setMyRegistration(workspace.my_registration || null);
      setAttendees(workspace.attendees || []);
    }

    loadEventDetails();

    return () => {
      mounted = false;
    };
  }, [id]);

  const checkInAttendee = async (registrationId: string) => {
    if (!id) return;
    setManagerStatus("");
    const checkedInAt = new Date().toISOString();
    try {
      await apiPatch(`/api/events/${id}/registrations/${registrationId}/check-in`, {}, { auth: true });
    } catch (error: any) {
      setManagerStatus(error.message || "Could not check in attendee.");
      return;
    }
    setAttendees(attendees.map((attendee) => attendee.id === registrationId ? {
      ...attendee,
      status: "checked_in",
      checked_in_at: checkedInAt,
    } : attendee));
  };

  const reserveSpot = async () => {
    if (reservingSpot) return;
    setReserveStatus("");
    if (!requireLoginForAction(navigate, `/events/${id}`)) return;
    if (!id) {
      setReserveStatus("Invalid event.");
      return;
    }
    try {
      setReservingSpot(true);
      const result = await apiPost<any>(`/api/events/${id}/reserve`, {}, { auth: true });
      setMyRegistration(result.registration || null);
      if (result.message === "Already registered.") {
        setReserveStatus("You already reserved this event.");
      } else {
        setReserveStatus("Spot reserved. Your ticket is ready.");
        setEventInfo((current: any) => {
          if (!current) return current;
          const nextCount = Number(result.registered_count ?? result.registeredCount ?? Number(current.registeredCount || current.registered_count || 0) + 1);
          return { ...current, registeredCount: nextCount, registered_count: nextCount };
        });
      }
    } catch (error: any) {
      if (error?.status === 401) {
        navigate(`/login?redirect=/events/${id}`);
        return;
      }
      setReserveStatus(userFriendlyErrorMessage(error, "Could not reserve a spot. Please try again."));
    } finally {
      setReservingSpot(false);
    }
  };

  const displayEvent = eventInfo;

  if (loadingEvent) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-slate-500">Loading event...</p>
        </BrutalCard>
      </div>
    );
  }

  if (!displayEvent) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
        <button onClick={() => navigate("/events")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
          <ArrowLeft size={16} /> Back to Events
        </button>
        <BrutalCard color="bg-white">
          <h1 className="text-4xl uppercase mb-3" style={fonts.display}>Event not found</h1>
          <p className="text-sm text-slate-600">This event may have been archived, moved, or is not public yet.</p>
        </BrutalCard>
      </div>
    );
  }

  const startDate = displayEvent.start_time ? new Date(displayEvent.start_time) : null;
  const eventEnded = Boolean(displayEvent.end_time && new Date(displayEvent.end_time).getTime() < Date.now());
  const registrationDeadline = displayEvent.registration_deadline ? new Date(displayEvent.registration_deadline) : null;
  const registrationClosedByDeadline = Boolean(registrationDeadline && registrationDeadline.getTime() < Date.now());
  const isReserved = Boolean(myRegistration?.id);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <BrutalCard color="bg-[#2563EB]" className="text-white mb-12 border-4">
        <div className="flex justify-between items-start mb-10">
           <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{displayEvent.event_type || "WORKSHOP"}</BrutalBadge>
           <div className="text-right">
             <div className="text-5xl" style={fonts.display}>{startDate ? startDate.getDate() : "24"}</div>
             <div className="font-bold tracking-widest">{startDate ? startDate.toLocaleString("en", { month: "short" }).toUpperCase() : "FEB"}</div>
           </div>
        </div>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-6" style={fonts.display}>{displayEvent.title}</h1>
        <div className="flex flex-wrap gap-6 font-mono text-sm opacity-90">
          <span className="flex items-center gap-2"><MapPin size={16}/> {displayEvent.venue || "TBA"}</span>
          <span className="flex items-center gap-2"><Calendar size={16}/> {startDate ? startDate.toLocaleString() : "Date TBA"}</span>
          <span className="flex items-center gap-2"><Users size={16}/> {displayEvent.registeredCount || 0}/{displayEvent.capacity || 0} Spots Filled</span>
        </div>
      </BrutalCard>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 prose prose-lg text-[#171717]">
          <h2 className="uppercase font-bold tracking-widest text-xl mb-4">About The Event</h2>
          <p>{displayEvent.description || displayEvent.short_description || "Event details will be updated soon."}</p>
        </div>
        <div>
          <BrutalCard className="sticky top-32">
            <h3 className="uppercase font-bold tracking-widest text-lg mb-6">Registration</h3>
            <p className="text-sm font-mono text-slate-500 mb-6">
              {registrationDeadline ? `Registration deadline: ${registrationDeadline.toLocaleString()}` : "Registration deadline not set."}
            </p>
            {reserveStatus && <p className="mb-4 text-xs font-bold text-[#FB7185]">{reserveStatus}</p>}
            {isReserved ? (
              <div className="space-y-3">
                <BrutalButton disabled className="w-full cursor-not-allowed opacity-80" color="bg-green-500" text="text-white">
                  <Check size={16} /> Reserved
                </BrutalButton>
                <BrutalButton onClick={() => navigate(`/ticket/${myRegistration.id}`, { state: { from: `/events/${id}` } })} className="w-full" color="bg-[#FFE800]" text="text-[#171717]">
                  <QrCode size={16} /> View Ticket
                </BrutalButton>
              </div>
            ) : (
              <BrutalButton onClick={reserveSpot} className="w-full" color="bg-[#FB7185]" text="text-white" disabled={registrationClosedByDeadline || reservingSpot}>
                {registrationClosedByDeadline ? "Registration Closed" : reservingSpot ? "Reserving..." : "Reserve Spot"}
              </BrutalButton>
            )}
            {canManageEvent && (
              <div className="mt-4 pt-4 border-t-2 border-[#171717] space-y-3">
                <BrutalButton onClick={() => navigate(`/scanner?event=${id}`)} className="w-full text-xs" color="bg-[#171717]" text="text-white">
                  <QrCode size={14} className="inline mr-2" /> Scan Tickets
                </BrutalButton>
              </div>
            )}
          </BrutalCard>
        </div>
      </div>

      {canManageEvent && (
        <BrutalCard color="bg-white" className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl uppercase" style={fonts.display}>Organizer Workspace</h2>
            <BrutalBadge color={eventEnded ? "bg-slate-400" : "bg-green-500"}>{eventEnded ? "Ended" : "Active"}</BrutalBadge>
          </div>
          {managerStatus && <p className="mb-4 text-xs font-bold text-[#2563EB]">{managerStatus}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#171717]">
                  <th className="text-left p-3 uppercase text-xs">Attendee</th>
                  <th className="text-left p-3 uppercase text-xs">Ticket</th>
                  <th className="text-left p-3 uppercase text-xs">Status</th>
                  <th className="text-right p-3 uppercase text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => {
                  const profile = Array.isArray(attendee.profiles) ? attendee.profiles[0] : attendee.profiles;
                  return (
                    <tr key={attendee.id} className="border-b border-slate-200">
                      <td className="p-3 font-bold">{profile?.full_name || profile?.email || "Member"}</td>
                      <td className="p-3 font-mono text-xs">{attendee.ticket_code}</td>
                      <td className="p-3">{attendee.checked_in_at ? "Checked in" : attendee.status}</td>
                      <td className="p-3 text-right">
                        {!attendee.checked_in_at && (
                          <button onClick={() => checkInAttendee(attendee.id)} className="px-3 py-2 border-2 border-[#171717] bg-green-500 text-white text-xs font-bold uppercase">
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {attendees.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-slate-500 font-mono" colSpan={4}>No registrations yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </BrutalCard>
      )}
    </div>
  );
}

export function EventProposalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("dsc-event-proposal-draft");
    return saved ? JSON.parse(saved) : {
      title: "",
      type: "WORKSHOP",
      proposedDate: "",
      proposedTime: "",
      venue: "",
      capacity: "40",
      host: "",
      coordinators: "",
      summary: "",
      prerequisites: "",
      outcomes: "",
    };
  });
  const [status, setStatus] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem("dsc-event-proposal-draft", JSON.stringify(next));
  };

  const submitProposal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingProposal) return;
    if (!requireLoginForAction(navigate, "/events/propose")) return;
    if (!form.title.trim() || !form.summary.trim() || !form.host.trim()) {
      setStatus("Title, host, and summary are required before submitting.");
      return;
    }
    const coordinatorEmails = form.coordinators
      .split(/[,\n]/)
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean);
    const invalidCoordinator = coordinatorEmails.find((email: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidCoordinator) {
      setStatus(`Invalid coordinator email: ${invalidCoordinator}`);
      return;
    }
    try {
      setSubmittingProposal(true);
      const result = await submitEventProposal({
        title: form.title,
        event_type: form.type,
        proposed_date: form.proposedDate || null,
        proposed_time: form.proposedTime || null,
        venue: form.venue,
        capacity: Number(form.capacity) || null,
        host: form.host,
        coordinator_emails: coordinatorEmails,
        summary: form.summary,
        prerequisites: form.prerequisites,
        outcomes: form.outcomes,
        status: "pending",
      });
      localStorage.removeItem("dsc-event-proposal-draft");
      setStatus(`Event proposal submitted. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(userFriendlyErrorMessage(error, "Could not submit proposal. Please check the fields and try again."));
    } finally {
      setSubmittingProposal(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/events")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-block">Event Proposal</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Propose Event</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Suggest a workshop, seminar, competition, or community session for Data Science Club.</p>
      </div>

      <form onSubmit={submitProposal} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Event Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Intro to Computer Vision" />
            <BrutalField label="Event Type" value={form.type} onChange={(value) => updateField("type", value)} placeholder="Workshop, seminar, competition..." />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <BrutalField label="Proposed Date" type="date" value={form.proposedDate} onChange={(value) => updateField("proposedDate", value)} />
            <BrutalField label="Time" type="time" value={form.proposedTime} onChange={(value) => updateField("proposedTime", value)} />
            <BrutalField label="Capacity" type="number" value={form.capacity} onChange={(value) => updateField("capacity", value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Venue" value={form.venue} onChange={(value) => updateField("venue", value)} placeholder="SMS Lab 3" />
            <BrutalField label="Host / Speaker" value={form.host} onChange={(value) => updateField("host", value)} placeholder="Your name or proposed speaker" />
          </div>

          <BrutalTextArea
            label="Event Coordinators"
            rows={3}
            value={form.coordinators}
            onChange={(value) => updateField("coordinators", value)}
            placeholder="Add coordinator emails, separated by commas or new lines. Non-members are allowed."
          />
          <BrutalTextArea label="Short Summary" rows={4} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="What is this event about and who should attend?" />
          <BrutalTextArea label="Prerequisites" rows={4} value={form.prerequisites} onChange={(value) => updateField("prerequisites", value)} placeholder="Python basics, laptop required, dataset links..." />
          <BrutalTextArea label="Expected Outcomes" rows={5} value={form.outcomes} onChange={(value) => updateField("outcomes", value)} placeholder="Students will build..., understand..., submit..." />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-[#FFE800]">
            <h2 className="text-3xl uppercase mb-4" style={fonts.display}>Proposal Preview</h2>
            <div className="border-2 border-[#171717] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">{form.type}</p>
              <h3 className="text-2xl uppercase leading-tight mt-2" style={fonts.display}>{form.title || "Event title"}</h3>
              <p className="text-sm text-slate-600 mt-2">{form.summary || "Your event summary preview will appear here."}</p>
              <div className="mt-4 text-xs font-mono text-slate-500">
                {form.proposedDate || "Date TBD"} {form.proposedTime && `at ${form.proposedTime}`} · {form.venue || "Venue TBD"}
              </div>
            </div>
            <p className="mt-4 text-xs font-mono text-slate-700">Draft autosaves locally after each edit.</p>
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full" disabled={submittingProposal}>
              {submittingProposal ? "Submitting..." : "Submit Proposal"}
            </BrutalButton>
            <BrutalButton
              type="button"
              color="bg-white"
              className="w-full"
              onClick={() => {
                if (!requireLoginForAction(navigate, "/events/propose")) return;
                setStatus("Draft saved in this browser.");
              }}
            >
              Save Draft
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      setLoadingProjects(true);
      if (!isSupabaseConfigured || !supabase) {
        setAllProjects([]);
        setLoadingProjects(false);
        return;
      }
      const { data } = await supabase
        .from("projects")
        .select("id,slug,title,category,technologies,summary,published_at,submitted_at,status")
        .in("status", ["approved", "published"])
        .order("published_at", { ascending: false, nullsFirst: false });
      if (!mounted) return;
      const styles = [
        { color: "bg-[#F4EFEB]", text: "text-[#171717]" },
        { color: "bg-[#2563EB]", text: "text-white" },
        { color: "bg-[#FB7185]", text: "text-white" },
        { color: "bg-[#FFE800]", text: "text-[#171717]" },
        { color: "bg-[#7C3AED]", text: "text-white" },
        { color: "bg-[#171717]", text: "text-white" },
      ];
      setAllProjects((data || []).map((project, index) => {
        const style = styles[index % styles.length];
        const date = project.published_at || project.submitted_at;
        return {
          id: project.id,
          slug: project.slug,
          title: project.title,
          tags: project.technologies?.length ? project.technologies : [project.category || "Project"],
          author: "Club Member",
          year: date ? new Date(date).getFullYear() : new Date().getFullYear(),
          color: style.color,
          text: style.text,
          desc: project.summary || "Project details will be updated soon.",
        };
      }));
      setLoadingProjects(false);
    }
    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const allTags = ["all", ...Array.from(new Set(allProjects.flatMap((project) => project.tags)))];

  const filtered = allProjects
    .filter(p => {
      const matchesTag = activeTag === "all" || p.tags.includes(activeTag);
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return b.year - a.year || b.id.localeCompare(a.id);
      if (sortOrder === "oldest") return a.year - b.year || a.id.localeCompare(b.id);
      if (sortOrder === "az") return a.title.localeCompare(b.title);
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
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Student Projects</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Showcase</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} project{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <BrutalButton
          color="bg-[#FB7185]"
          text="text-white"
          className="w-full self-stretch sm:w-auto md:self-start"
          onClick={() => navigate("/projects/submit")}
        >
          Submit Project
        </BrutalButton>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, description, or tech..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A ? Z</option>
        </select>
      </div>

      {/* Tag Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); resetPage(); }}
            className={`px-3 py-1.5 border-2 border-[#171717] font-bold uppercase tracking-widest text-[10px] transition-all ${
              activeTag === tag ? "bg-[#FB7185] text-white" : "bg-white hover:bg-[#F4EFEB]"
            }`}
          >
            {tag === "all" ? "All Tech" : tag}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingProjects ? "Loading projects" : "No projects found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingProjects ? "Please wait..." : "Published projects will appear here after admin review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map(proj => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.slug || proj.id}`)}
              className={`cursor-pointer border-2 border-[#171717] flex flex-col brutal-shadow brutal-shadow-hover transition-all group ${proj.color} ${proj.text}`}
            >
              <div className="w-full aspect-video border-b-2 border-[#171717] relative overflow-hidden flex items-center justify-center bg-black/10">
                <Database size={48} className="opacity-20" />
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/20 border border-white/30 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">{proj.year}</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold uppercase leading-tight mb-2" style={fonts.display}>{proj.title}</h3>
                <p className="text-xs font-mono opacity-70 mb-3">By {proj.author}</p>
                <p className="text-sm opacity-80 leading-relaxed mb-4 flex-1" style={fonts.sans}>{proj.desc}</p>
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-current/20">
                  {proj.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 border border-current/30 bg-white/10 text-[9px] font-bold uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProject() {
      if (!isSupabaseConfigured || !supabase || !id) {
        setProject(null);
        setLoadingProject(false);
        return;
      }
      const query = supabase
        .from("projects")
        .select("id,slug,title,category,technologies,summary,content,published_at,status")
        .in("status", ["approved", "published"]);
      const isUuid = /^[0-9a-f-]{36}$/i.test(id);
      const { data } = isUuid
        ? await query.eq("id", id).maybeSingle()
        : await query.eq("slug", id).maybeSingle();
      if (!mounted) return;
      setProject(data);
      setLoadingProject(false);
    }
    loadProject();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {loadingProject ? (
        <BrutalCard><p className="font-mono text-sm text-slate-500">Loading project...</p></BrutalCard>
      ) : !project ? (
        <BrutalCard><p className="font-bold uppercase">Project not found or not published yet.</p></BrutalCard>
      ) : (
        <>
        <div className="w-full aspect-video bg-[#2563EB] border-4 border-[#171717] brutal-shadow-lg mb-12 flex items-center justify-center p-8">
          <h1 className="text-5xl md:text-8xl text-white uppercase text-center" style={fonts.display}>{project.title}</h1>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {(project.technologies?.length ? project.technologies : [project.category || "Project"]).map((tag: string) => (
            <BrutalBadge key={tag}>{tag}</BrutalBadge>
          ))}
        </div>

        <div className="prose prose-lg max-w-none text-[#171717]">
          <p className="text-2xl font-serif italic mb-8">{project.summary || "Project details will be updated soon."}</p>
          <div className="whitespace-pre-wrap text-base leading-relaxed">{project.content || project.summary}</div>
        </div>
        </>
      )}
    </div>
  );
}

export function ProjectSubmissionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("dsc-project-draft");
    return saved ? JSON.parse(saved) : {
      title: "",
      category: "Machine Learning",
      team: "",
      technologies: "",
      summary: "",
      content: "# Problem\n\n# Methodology\n\n# Results\n",
    };
  });
  const [status, setStatus] = useState("");
  const [submittingProject, setSubmittingProject] = useState(false);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem("dsc-project-draft", JSON.stringify(next));
  };

  const submitProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingProject) return;
    if (!requireLoginForAction(navigate, "/projects/submit")) return;
    if (!form.title.trim() || !form.summary.trim()) {
      setStatus("Add a title and short summary before submitting.");
      return;
    }
    try {
      setSubmittingProject(true);
      const result = await submitProject({
        title: form.title,
        category: form.category,
        team: form.team,
        technologies: form.technologies.split(",").map((item: string) => item.trim()).filter(Boolean),
        summary: form.summary,
        content: form.content,
        status: "submitted",
      });
      localStorage.removeItem("dsc-project-draft");
      setStatus(`Project submitted for review. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(userFriendlyErrorMessage(error, "Could not submit project. Please check the fields and try again."));
    } finally {
      setSubmittingProject(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/projects")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Project Submission</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Submit Project</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Create a full project case study for the public gallery. Drafts save automatically in this browser.</p>
      </div>

      <form onSubmit={submitProjectForm} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Project Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Kathmandu Air Quality Predictor" />
            <BrutalField label="Category" value={form.category} onChange={(value) => updateField("category", value)} placeholder="Machine Learning" />
          </div>
          <BrutalField label="Team Members" value={form.team} onChange={(value) => updateField("team", value)} placeholder="S. Sharma, B. Thapa" />
          <BrutalField label="Technologies" value={form.technologies} onChange={(value) => updateField("technologies", value)} placeholder="Python, XGBoost, Streamlit" />
          <BrutalTextArea label="Short Summary" rows={4} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="A 2-3 sentence summary for the gallery card." />
          <BrutalTextArea label="Full Case Study Markdown" rows={14} value={form.content} onChange={(value) => updateField("content", value)} />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-[#FFE800]">
            <h2 className="text-3xl uppercase mb-4" style={fonts.display}>Preview</h2>
            <div className="border-2 border-[#171717] bg-white p-4 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FB7185]">{form.category || "Category"}</p>
              <h3 className="text-2xl uppercase leading-tight mt-2" style={fonts.display}>{form.title || "Project title"}</h3>
              <p className="text-sm text-slate-600 mt-2">{form.summary || "Your summary preview will appear here."}</p>
            </div>
            <p className="text-xs font-mono text-slate-700">Draft autosaves locally after each edit.</p>
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#FB7185]" text="text-white" className="w-full" disabled={submittingProject}>
              {submittingProject ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
            <BrutalButton
              type="button"
              color="bg-white"
              className="w-full"
              onClick={() => {
                if (!requireLoginForAction(navigate, "/projects/submit")) return;
                setStatus("Draft saved in this browser.");
              }}
            >
              Save Draft
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}

export function BlogPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    let mounted = true;
    async function loadPosts() {
      setLoadingPosts(true);
      if (!isSupabaseConfigured || !supabase) {
        setAllPosts([]);
        setLoadingPosts(false);
        return;
      }
      const { data } = await supabase
        .from("blog_posts")
        .select("id,slug,title,summary,tags,content,cover_image_url,published_at,status,profiles:author_id(full_name,email)")
        .in("status", ["approved", "published"])
        .order("published_at", { ascending: false, nullsFirst: false });
      if (!mounted) return;
      setAllPosts((data || []).map((post) => {
        const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const date = post.published_at;
        const words = `${post.summary || ""} ${post.content || ""}`.trim().split(/\s+/).filter(Boolean).length;
        return {
          id: post.id,
          slug: post.slug,
          title: post.title,
          date: date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }) : "",
          dateSort: date ? new Date(date).toISOString().slice(0, 10) : "",
          category: (post.tags?.[0] || "NEWS").toUpperCase(),
          author: author?.full_name || author?.email || "Club Member",
          readTime: `${Math.max(1, Math.ceil(words / 220))} min`,
          excerpt: post.summary || post.content?.slice(0, 180) || "Post details will be updated soon.",
          coverImageUrl: post.cover_image_url,
        };
      }));
      setLoadingPosts(false);
    }
    loadPosts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = ["all", ...Array.from(new Set(allPosts.map((post) => post.category)))];
  const categoryColors: Record<string, string> = {
    TUTORIAL: "bg-[#2563EB]",
    EVENT: "bg-[#FB7185]",
    DESIGN: "bg-[#7C3AED]",
    NEWS: "bg-[#FFE800] text-[#171717]",
    OPINION: "bg-[#171717]",
  };

  const filtered = allPosts
    .filter(p => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return b.dateSort.localeCompare(a.dateSort);
      if (sortOrder === "oldest") return a.dateSort.localeCompare(b.dateSort);
      if (sortOrder === "readtime") return parseInt(a.readTime) - parseInt(b.readTime);
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
          <BrutalBadge color="bg-[#171717]" className="mb-4 inline-block">Blog</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Club Blog</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <BrutalButton
          color="bg-[#171717]"
          text="text-white"
          className="w-full self-stretch sm:w-auto md:self-start"
          onClick={() => navigate("/blog/write")}
        >
          Write a Post
        </BrutalButton>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts by title, author, or content..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#171717]/20 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="readtime">Shortest Read</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); resetPage(); }}
            className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
              activeCategory === cat
                ? "bg-[#171717] text-white"
                : "bg-white hover:bg-[#F4EFEB]"
            }`}
          >
            {cat === "all" ? "All Posts" : cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingPosts ? "Loading posts" : "No posts found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingPosts ? "Please wait..." : "Published blog posts will appear here after review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-0 border-2 border-[#171717]">
          {paginated.map((post, i) => (
            <div
              key={post.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/blog/${post.slug || post.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/blog/${post.slug || post.id}`);
                }
              }}
              className={`p-8 cursor-pointer group hover:bg-[#171717] hover:text-white transition-all border-[#171717] ${
                i % 2 === 0 && i < paginated.length - 1 ? "border-r-2" : ""
              } ${i < paginated.length - 2 ? "border-b-2" : ""} ${
                paginated.length % 2 !== 0 && i === paginated.length - 1 ? "md:col-span-2 md:border-r-0" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 border-2 border-[#171717] text-[9px] font-bold uppercase tracking-widest group-hover:border-white/50 ${
                  categoryColors[post.category] || "bg-[#2563EB] text-white"
                }`}>
                  {post.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white/60">{post.readTime} read</span>
              </div>
              <h2
                className="text-2xl md:text-3xl uppercase leading-tight mb-3 group-hover:text-white transition-colors"
                style={fonts.display}
              >
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 group-hover:text-white/80 mb-6 transition-colors" style={fonts.sans}>
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400 group-hover:text-white/60">
                  {post.author} · {post.date}
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
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

export function BlogDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadPost() {
      setLoadingPost(true);
      if (!id || !isSupabaseConfigured || !supabase) {
        setPost(null);
        setLoadingPost(false);
        return;
      }

      const query = supabase
        .from("blog_posts")
        .select("id,slug,title,summary,tags,cover_image_url,content,published_at,status,profiles:author_id(full_name,email)")
        .in("status", ["approved", "published"]);
      const isUuid = /^[0-9a-f-]{36}$/i.test(id);
      const { data } = isUuid
        ? await query.eq("id", id).maybeSingle()
        : await query.eq("slug", id).maybeSingle();

      if (!mounted) return;
      setPost(data);
      setLoadingPost(false);
    }
    loadPost();
    return () => {
      mounted = false;
    };
  }, [id]);

  const author = post ? (Array.isArray(post.profiles) ? post.profiles[0] : post.profiles) : null;
  const words = post ? `${post.summary || ""} ${post.content || ""}`.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = `${Math.max(1, Math.ceil(words / 220))} min read`;
  const publishedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" })
    : "";
  const paragraphs = String(post?.content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1100px] mx-auto min-h-screen">
      <button onClick={() => navigate("/blog")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Blog
      </button>

      {loadingPost ? (
        <BrutalCard color="bg-white">
          <p className="font-bold uppercase tracking-widest text-sm">Loading post...</p>
        </BrutalCard>
      ) : !post ? (
        <BrutalCard color="bg-white">
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Not Found</BrutalBadge>
          <h1 className="text-4xl md:text-6xl uppercase mb-4" style={fonts.display}>Post unavailable</h1>
          <p className="text-slate-600">This post is not published yet or has been removed.</p>
        </BrutalCard>
      ) : (
        <article>
          <div className="border-b-4 border-[#171717] pb-8 mb-8">
            <div className="flex flex-wrap gap-2 mb-5">
              {(post.tags || ["Blog"]).map((tag: string) => (
                <BrutalBadge key={tag} color="bg-[#2563EB]">{tag}</BrutalBadge>
              ))}
            </div>
            <h1 className="text-5xl md:text-8xl uppercase leading-none mb-5" style={fonts.display}>{post.title}</h1>
            <p className="text-xl md:text-2xl text-slate-700 max-w-3xl" style={fonts.serif}>{post.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-slate-500">
              <span>{author?.full_name || author?.email || "Data Science Club"}</span>
              <span>{publishedDate}</span>
              <span>{readTime}</span>
            </div>
          </div>

          {post.cover_image_url && (
            <div className="mb-10 border-2 border-[#171717] brutal-shadow-lg overflow-hidden bg-[#2563EB]">
              <img src={post.cover_image_url} alt={post.title} className="w-full max-h-[480px] object-cover" />
            </div>
          )}

          <BrutalCard color="bg-white" className="max-w-none">
            <div className="space-y-6 text-lg leading-8 text-[#171717]" style={fonts.serif}>
              {paragraphs.map((block, index) => {
                if (block.startsWith("## ")) {
                  return <h2 key={index} className="pt-4 text-3xl md:text-4xl uppercase leading-tight" style={fonts.display}>{block.replace(/^##\s+/, "")}</h2>;
                }
                if (block.startsWith("# ")) {
                  return <h2 key={index} className="pt-4 text-4xl md:text-5xl uppercase leading-tight" style={fonts.display}>{block.replace(/^#\s+/, "")}</h2>;
                }
                return <p key={index} className="whitespace-pre-line">{block}</p>;
              })}
            </div>
          </BrutalCard>
        </article>
      )}
    </div>
  );
}

export function BlogEditorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("dsc-blog-draft");
    return saved ? JSON.parse(saved) : {
      title: "",
      summary: "",
      tags: "",
      coverImage: "",
      content: "## Introduction\n\nWrite your post here...\n",
    };
  });
  const [preview, setPreview] = useState(true);
  const [status, setStatus] = useState("");
  const [publishingPost, setPublishingPost] = useState(false);
  const [authorName, setAuthorName] = useState("Member");

  useEffect(() => {
    let mounted = true;
    async function loadAuthorName() {
      if (!isSupabaseConfigured || !supabase) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const fallbackName =
        userData.user.user_metadata?.full_name ||
        userData.user.email ||
        "Member";
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!mounted) return;
      setAuthorName(profile?.full_name || profile?.email || fallbackName);
    }

    loadAuthorName();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem("dsc-blog-draft", JSON.stringify(next));
  };

  const publishPostForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publishingPost) return;
    if (!requireLoginForAction(navigate, "/blog/write")) return;
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setStatus("Title, summary, and content are required before submitting.");
      return;
    }
    try {
      setPublishingPost(true);
      const result = await publishBlogPost({
        title: form.title,
        summary: form.summary,
        tags: form.tags.split(",").map((item: string) => item.trim()).filter(Boolean),
        cover_image_url: form.coverImage || null,
        content: form.content,
        status: "submitted",
      });
      localStorage.removeItem("dsc-blog-draft");
      setStatus(`Post submitted for admin review. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(userFriendlyErrorMessage(error, "Could not submit post. Please check the fields and try again."));
    } finally {
      setPublishingPost(false);
    }
  };

  const previewTags = form.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
  const previewBlocks = String(form.content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const previewWords = `${form.summary || ""} ${form.content || ""}`.trim().split(/\s+/).filter(Boolean).length;
  const previewReadTime = `${Math.max(1, Math.ceil(previewWords / 220))} min read`;
  const previewDate = new Date().toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/blog")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Blog
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#171717]" className="mb-4 inline-block">Blog Editor</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Write a Post</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Draft, preview, and publish club updates, tutorials, and event recaps.</p>
      </div>

      <form onSubmit={publishPostForm} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <BrutalField label="Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Building Data Sarathi: A Neo-Brutalist Case Study" />
          <BrutalTextArea label="Summary" rows={3} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="Short excerpt for the blog listing." />
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Tags" value={form.tags} onChange={(value) => updateField("tags", value)} placeholder="Tutorial, Event, NLP" />
            <BrutalField label="Cover Image URL" value={form.coverImage} onChange={(value) => updateField("coverImage", value)} placeholder="https://..." />
          </div>
          <BrutalTextArea label="Markdown Content" rows={18} value={form.content} onChange={(value) => updateField("content", value)} />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-3xl uppercase" style={fonts.display}>{preview ? "Final Preview" : "Preview"}</h2>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="px-3 py-2 border-2 border-[#171717] bg-white text-[#171717] text-xs font-bold uppercase tracking-widest"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <article className="space-y-5">
                <div className="border-b-4 border-[#171717] pb-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(previewTags.length ? previewTags : ["Blog"]).map((tag: string) => (
                      <BrutalBadge key={tag} color="bg-[#2563EB]">{tag}</BrutalBadge>
                    ))}
                  </div>
                  <h3 className="text-4xl md:text-5xl uppercase leading-none mb-4" style={fonts.display}>
                    {form.title || "Post Title"}
                  </h3>
                  <p className="text-lg text-slate-700" style={fonts.serif}>
                    {form.summary || "Post summary preview."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    <span>{authorName}</span>
                    <span>{previewDate}</span>
                    <span>{previewReadTime}</span>
                  </div>
                </div>

                {form.coverImage && (
                  <div className="border-2 border-[#171717] brutal-shadow overflow-hidden bg-[#2563EB]">
                    <img src={form.coverImage} alt={form.title || "Blog cover"} className="w-full max-h-56 object-cover" />
                  </div>
                )}

                <div className="space-y-4 text-base leading-7 text-[#171717]" style={fonts.serif}>
                  {(previewBlocks.length ? previewBlocks : ["Write your post here..."]).map((block: string, index: number) => {
                    if (block.startsWith("## ")) {
                      return <h4 key={index} className="pt-2 text-2xl md:text-3xl uppercase leading-tight" style={fonts.display}>{block.replace(/^##\s+/, "")}</h4>;
                    }
                    if (block.startsWith("# ")) {
                      return <h4 key={index} className="pt-2 text-3xl md:text-4xl uppercase leading-tight" style={fonts.display}>{block.replace(/^#\s+/, "")}</h4>;
                    }
                    return <p key={index} className="whitespace-pre-line">{block}</p>;
                  })}
                </div>
              </article>
            ) : (
              <p className="text-sm font-mono text-slate-700">Use preview to inspect your title, summary, tags, and markdown before publishing.</p>
            )}
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#171717]" text="text-white" className="w-full" disabled={publishingPost}>
              {publishingPost ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
            <BrutalButton
              type="button"
              color="bg-white"
              className="w-full"
              onClick={() => {
                if (!requireLoginForAction(navigate, "/blog/write")) return;
                setStatus("Draft saved in this browser.");
              }}
            >
              Save Draft
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}

// BrutalField and BrutalTextArea imported from `./components/ui/brutal`

function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Any valid email is accepted
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#2563EB]">
      <div className="w-full max-w-4xl bg-white border-4 border-[#171717] brutal-shadow-lg flex flex-col md:flex-row overflow-hidden mt-16">
        
        <div className="md:w-1/2 p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-[#171717] flex flex-col justify-center bg-[#FFE800]">
          <h2 className="text-5xl uppercase mb-6" style={fonts.display}>Members Only</h2>
          <p className="font-serif italic text-lg mb-8">Access the hub, register for exclusive events, and submit your projects.</p>
          <div className="font-mono text-sm font-bold p-4 bg-white border-2 border-[#171717]">
            Sign in with any email address.
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full border-2 border-[#171717] p-4 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all brutal-shadow-hover"
                required
              />
              {error && <p className="text-xs font-bold text-[#FB7185] mt-2">{error}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full border-2 border-[#171717] p-4 font-mono focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all brutal-shadow-hover"
                required
              />
            </div>
            <BrutalButton type="submit" color="bg-[#171717]" text="text-white" className="w-full">Authenticate</BrutalButton>
          </form>
        </div>

      </div>
    </div>
  );
}

export function TicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketId } = useParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketStatus, setTicketStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTickets() {
      setLoadingTickets(true);
      const rows = await apiGet<any[]>("/api/me/tickets", { auth: true }).catch((error) => {
        if (error?.status === 401) {
          navigate(`/login?redirect=${encodeURIComponent(ticketId ? `/ticket/${ticketId}` : "/tickets")}`);
          return [];
        }
        setTicketStatus(userFriendlyErrorMessage(error, "Could not load tickets. Please refresh and try again."));
        return [];
      });
      if (!mounted) return;
      setTickets(rows || []);
      setLoadingTickets(false);
    }

    loadTickets();

    return () => {
      mounted = false;
    };
  }, [navigate, ticketId]);

  const selectedTicket = ticketId ? tickets.find((ticket) => ticket.id === ticketId) : null;
  const upcomingTickets = tickets.filter((ticket) => {
    const eventTime = ticket.event?.end_time || ticket.event?.start_time;
    return !eventTime || new Date(eventTime).getTime() >= Date.now();
  });
  const previousTickets = tickets.filter((ticket) => {
    const eventTime = ticket.event?.end_time || ticket.event?.start_time;
    return eventTime && new Date(eventTime).getTime() < Date.now();
  });
  const renderDate = (value?: string) => value ? new Date(value).toLocaleString() : "Date TBA";

  const TicketList = ({ title, items }: { title: string; items: any[] }) => (
    <section className="space-y-4">
      <h2 className="text-3xl uppercase" style={fonts.display}>{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => navigate(`/ticket/${ticket.id}`, { state: { from: "/tickets" } })}
            className="text-left bg-white border-2 border-[#171717] p-5 brutal-shadow brutal-shadow-hover transition-all min-w-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <BrutalBadge color={ticket.status === "checked_in" ? "bg-green-500" : "bg-[#FFE800]"} text={ticket.status === "checked_in" ? "text-white" : "text-[#171717]"}>
                  {ticket.status || "registered"}
                </BrutalBadge>
                <h3 className="mt-4 text-2xl uppercase leading-tight" style={fonts.display}>{ticket.event?.title || "Event Ticket"}</h3>
              </div>
              <QrCode size={24} />
            </div>
            <div className="mt-4 space-y-2 font-mono text-xs text-slate-600">
              <p>{renderDate(ticket.event?.start_time)}</p>
              <p>{ticket.event?.venue || "Venue TBA"}</p>
              <p className="font-bold text-[#171717] break-all">{ticket.ticket_code || ticket.id}</p>
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="border-2 border-dashed border-[#171717] p-6 text-center font-mono text-sm text-slate-500">
            No tickets here yet.
          </div>
        )}
      </div>
    </section>
  );

  if (loadingTickets) {
    return (
      <div className="pt-16 pb-20 px-4 sm:px-6 flex flex-col items-center justify-center min-h-screen bg-[#F4EFEB] overflow-x-hidden">
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-slate-500">Loading tickets...</p>
        </BrutalCard>
      </div>
    );
  }

  if (ticketId && !selectedTicket) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[900px] mx-auto min-h-screen bg-[#F4EFEB]">
        <button onClick={() => navigate("/tickets")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
          <ArrowLeft size={16} /> Back to Tickets
        </button>
        <BrutalCard color="bg-white">
          <h1 className="text-4xl uppercase mb-3" style={fonts.display}>Ticket not found</h1>
          <p className="text-sm text-slate-600">This ticket is not available for your account.</p>
        </BrutalCard>
      </div>
    );
  }

  if (selectedTicket) {
    const attendeeName = selectedTicket.profile?.full_name || selectedTicket.profile?.email || "Member";
    const ticketCode = selectedTicket.ticket_code || selectedTicket.id;
    return (
      <div className="pt-16 pb-20 px-6 flex flex-col items-center justify-center min-h-screen bg-[#F4EFEB]">
        <button onClick={() => navigate((location.state as any)?.from || "/tickets")} className="mb-8 self-start max-w-md w-full mx-auto inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-[#2563EB]">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="relative w-full max-w-md bg-white border-2 border-[#171717] p-4 sm:p-6 brutal-shadow-lg sm:rotate-1">
          <div className="absolute -top-4 -right-4 bg-[#FFE800] border-2 border-[#171717] px-3 py-2 rotate-12 font-bold text-xs uppercase">
            {selectedTicket.status || "registered"}
          </div>

          <div className="text-center mb-6 border-b-2 border-[#171717] pb-6 border-dashed">
            <h2 className="text-4xl sm:text-5xl uppercase leading-none mb-2" style={fonts.display}>Event Ticket</h2>
            <p className="font-bold font-mono tracking-widest text-sm break-words">{selectedTicket.event?.title || "Reserved Event"}</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white border-2 border-[#171717] p-4">
              <QRCodeCanvas value={ticketCode} size={190} includeMargin />
            </div>
          </div>

          <div className="space-y-4 font-mono text-sm border-t-2 border-[#171717] border-dashed pt-6">
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-slate-500">Attendee</span>
              <span className="font-bold text-right break-words min-w-0">{attendeeName}</span>
            </div>
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-slate-500">Ticket</span>
              <span className="font-bold text-right break-all min-w-0">{ticketCode}</span>
            </div>
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-slate-500">Date</span>
              <span className="font-bold text-right break-words min-w-0">{renderDate(selectedTicket.event?.start_time)}</span>
            </div>
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-slate-500">Venue</span>
              <span className="font-bold text-right break-words min-w-0">{selectedTicket.event?.venue || "TBA"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1100px] mx-auto min-h-screen bg-[#F4EFEB]">
      <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
      <div className="mb-10">
        <BrutalBadge color="bg-[#2563EB]" text="text-white">Tickets</BrutalBadge>
        <h1 className="mt-4 text-6xl uppercase" style={fonts.display}>My Tickets</h1>
        <p className="font-mono text-sm text-slate-600">Open a ticket to view its QR code.</p>
        {ticketStatus && <p className="mt-4 text-xs font-bold text-[#FB7185]">{ticketStatus}</p>}
      </div>
      <div className="space-y-10">
        <TicketList title="Available Tickets" items={upcomingTickets} />
        <TicketList title="Previous Tickets" items={previousTickets} />
      </div>
    </div>
  );
}

export function ScannerPage() {
  const navigate = useNavigate();
  const eventId = new URLSearchParams(window.location.search).get("event") || "";
  const [ticketCode, setTicketCode] = useState("");
  const [scannerStatus, setScannerStatus] = useState("Checking scanner access...");
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerEvent, setScannerEvent] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Camera scanner is optional. You can enter the ticket code manually.");
  const [lastScan, setLastScan] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const scanBusyRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function checkScannerAccess() {
      if (!eventId || !/^[0-9a-f-]{36}$/i.test(eventId)) {
        setScannerStatus("Open scanner from an event page.");
        return;
      }
      const workspace = await apiGet<any>(`/api/events/${eventId}/workspace`, { auth: true }).catch((error) => {
        if (error?.status === 401) {
          navigate(`/login?redirect=/scanner?event=${eventId}`);
          return null;
        }
        setScannerStatus(error.message || "Scanner is unavailable right now.");
        return null;
      });
      if (!mounted) return;
      if (!workspace) return;
      const eventRow = workspace.event;
      if (!eventRow) {
        setScannerStatus("Event not found.");
        return;
      }
      if (eventRow.end_time && new Date(eventRow.end_time).getTime() < Date.now()) {
        setScannerStatus("Scanner closed because this event has ended.");
        return;
      }

      setScannerReady(Boolean(workspace.can_manage));
      setScannerEvent(eventRow);
      setScannerStatus(workspace.can_manage ? `Scanner active for ${eventRow.title}.` : "You are not allowed to scan for this event.");
    }

    checkScannerAccess();

    return () => {
      mounted = false;
    };
  }, [eventId, navigate]);

  useEffect(() => {
    return () => {
      scannerControlsRef.current?.stop();
    };
  }, []);

  const explainScannerUnavailable = () => {
    if (!eventId || !/^[0-9a-f-]{36}$/i.test(eventId)) {
      setScannerStatus("Open scanner from an event page.");
      setCameraStatus("Choose Scanner from a specific event so the scanner knows which tickets to check.");
      return;
    }
    setCameraStatus(scannerStatus || "Scanner is not ready yet.");
  };

  const scanTicket = async (codeOverride?: string) => {
    const code = (codeOverride || ticketCode).trim();
    if (!scannerReady || !eventId) {
      explainScannerUnavailable();
      return;
    }
    if (!code || scanBusyRef.current) return;
    scanBusyRef.current = true;
    setCheckingIn(true);
    setLastScan(null);
    try {
      const result = await apiPost<any>(`/api/events/${eventId}/scan`, { ticket_code: code }, { auth: true });
      const attendeeName = result.profile?.full_name || result.profile?.email || "Member";
      setLastScan(result);
      setScannerStatus(result.already_checked_in ? `${attendeeName} was already checked in.` : `${attendeeName} checked in successfully.`);
      setTicketCode("");
    } catch (error: any) {
      setScannerStatus(error.message || "Ticket not found for this event.");
    } finally {
      scanBusyRef.current = false;
      setCheckingIn(false);
    }
  };

  const startCameraScanner = async () => {
    if (!scannerReady) {
      explainScannerUnavailable();
      return;
    }
    if (cameraActive) {
      setCameraStatus("Scanner already running.");
      return;
    }
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    if (!window.isSecureContext && !isLocalhost) {
      setCameraStatus("Camera scanning requires HTTPS or localhost. Use manual ticket code entry or open the deployed HTTPS site.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("This browser does not support camera access. Use manual ticket code entry.");
      return;
    }
    try {
      const reader = new BrowserQRCodeReader();
      scannerControlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current || undefined,
        async (result) => {
          const value = result?.getText();
          if (!value || scanBusyRef.current) return;
          scannerControlsRef.current?.stop();
          scannerControlsRef.current = null;
          setCameraActive(false);
          setCameraStatus("QR code scanned. Checking ticket...");
          await scanTicket(value);
        }
      );
      setCameraActive(true);
      setCameraStatus("Scanner started. Hold the QR code inside the frame.");
    } catch (error: any) {
      const name = error?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraStatus("Camera permission denied. Allow camera access or use manual ticket code entry.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCameraStatus("No camera found. Use manual ticket code entry.");
      } else {
        setCameraStatus("Could not open camera. Check browser support or use manual ticket code entry.");
      }
    }
  };

  const stopCameraScanner = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setCameraActive(false);
    setCameraStatus("Camera stopped. Manual ticket code entry is still available.");
  };

  return (
    <div className="min-h-screen bg-[#171717] pt-12 pb-20 px-6 flex flex-col items-center justify-center text-white relative">
      <div className="text-center mb-8">
        <h1 className="text-5xl uppercase" style={fonts.display}>Scanner Protocol</h1>
        <p className="font-mono text-slate-400 mt-2">{scannerStatus}</p>
        {scannerEvent && (
          <p className="font-mono text-xs text-slate-500 mt-2">
            {scannerEvent.start_time ? new Date(scannerEvent.start_time).toLocaleString() : "Date TBA"} - {scannerEvent.venue || "Venue TBA"}
          </p>
        )}
      </div>
      
      <div className="relative w-full max-w-sm aspect-square bg-black border-4 border-[#2563EB] mb-12 overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]">
        {/* Viewfinder brackets */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#FFE800]" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#FFE800]" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#FFE800]" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#FFE800]" />
        
        {/* Scanning line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FB7185] shadow-[0_0_15px_#FB7185] animate-[scan_2s_ease-in-out_infinite]" />

        <video ref={videoRef} className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`} muted playsInline />
        {!cameraActive && (
          <p className="font-mono text-slate-600 text-sm flex items-center gap-2">
            <Camera size={16} /> {scannerReady ? "CAMERA READY" : "EVENT REQUIRED"}
          </p>
        )}
      </div>

      <p className="mb-4 max-w-sm text-center font-mono text-xs text-slate-400">{cameraStatus}</p>
      <div className="mb-4 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <BrutalButton onClick={cameraActive ? stopCameraScanner : startCameraScanner} color="bg-[#2563EB]" text="text-white" className="flex-1">
          <Camera size={16} /> {cameraActive ? "Stop Camera" : "Start Camera"}
        </BrutalButton>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <input
          value={ticketCode}
          onChange={(event) => setTicketCode(event.target.value)}
          placeholder="Ticket code"
          disabled={checkingIn}
          className="flex-1 border-2 border-[#FFE800] bg-black p-3 font-mono text-sm text-white focus:outline-none disabled:opacity-40"
        />
        <BrutalButton onClick={() => scanTicket()} disabled={checkingIn || !ticketCode.trim()} color="bg-[#FFE800]" className="flex-1">
          {checkingIn ? "Checking..." : "Check In"}
        </BrutalButton>
      </div>

      {lastScan && (
        <div className="mt-6 w-full max-w-sm border-2 border-[#FFE800] bg-black p-4 font-mono text-sm">
          <p className="font-bold text-[#FFE800] uppercase">{lastScan.already_checked_in ? "Already checked in" : "Scan accepted"}</p>
          <p className="mt-2">{lastScan.profile?.full_name || lastScan.profile?.email || "Member"}</p>
          <p className="mt-1 break-all text-slate-400">{lastScan.registration?.ticket_code}</p>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState({
    name: "Member",
    batchYear: "",
    memberSince: "New member",
  });
  const [counts, setCounts] = useState({
    eventProposals: 0,
    projects: 0,
    blogPosts: 0,
  });
  const [dashboardEvents, setDashboardEvents] = useState<any[]>([]);
  const [dashboardProjects, setDashboardProjects] = useState<any[]>([]);
  const [dashboardPosts, setDashboardPosts] = useState<any[]>([]);
  const [dashboardNotice, setDashboardNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const fallbackName =
        userData.user.user_metadata?.full_name ||
        userData.user.user_metadata?.name ||
        userData.user.email ||
        "Member";

      const [{ data: profile }, eventProposalCount, projectCount, blogCount, publicEvents, publicProjects, publicPosts] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,email,batch_year,created_at")
          .eq("id", userData.user.id)
          .maybeSingle(),
        supabase
          .from("event_proposals")
          .select("id", { count: "exact", head: true })
          .eq("proposed_by", userData.user.id),
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userData.user.id),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userData.user.id),
        supabase
          .from("events")
          .select("id,title,event_type,start_time,capacity")
          .in("status", ["approved", "published"])
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(1),
        supabase
          .from("projects")
          .select("id,title,category,technologies,summary,published_at")
          .in("status", ["approved", "published"])
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(1),
        supabase
          .from("blog_posts")
          .select("id,title,tags,published_at")
          .in("status", ["approved", "published"])
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(4),
      ]);

      if (!mounted) return;
      setMember({
        name: profile?.full_name || profile?.email || fallbackName,
        batchYear: profile?.batch_year ? String(profile.batch_year) : "",
        memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "New member",
      });
      setCounts({
        eventProposals: eventProposalCount.count || 0,
        projects: projectCount.count || 0,
        blogPosts: blogCount.count || 0,
      });
      setDashboardEvents(publicEvents.data || []);
      setDashboardProjects(publicProjects.data || []);
      setDashboardPosts(publicPosts.data || []);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const userStats = [
    { label: "Event Proposals", value: String(counts.eventProposals), icon: <Calendar size={20} />, color: "bg-[#2563EB]", trend: "Awaiting review" },
    { label: "Projects Submitted", value: String(counts.projects), icon: <Code size={20} />, color: "bg-[#FB7185]", trend: "Your submissions" },
    { label: "Blog Posts", value: String(counts.blogPosts), icon: <FileText size={20} />, color: "bg-[#FFE800]", trend: "Published by you" },
    { label: "Member Since", value: member.memberSince, icon: <Zap size={20} />, color: "bg-[#7C3AED]", trend: "Account created" },
  ];

  const nextEvent = dashboardEvents[0];
  const announcements = dashboardPosts.map((post) => ({
    id: post.id,
    title: post.title,
    date: post.published_at ? new Date(post.published_at).toLocaleDateString() : "",
    type: (post.tags?.[0] || "POST").toUpperCase(),
    important: false,
  }));

  const quickActions = [
    { label: "Register for Event", icon: <Calendar size={18} />, onClick: () => navigate("/events"), color: "bg-[#2563EB]" },
    { label: "Submit Project", icon: <Code size={18} />, onClick: () => navigate("/projects"), color: "bg-[#FB7185]" },
    { label: "My Certificates", icon: <Award size={18} />, onClick: () => navigate("/certificates"), color: "bg-[#7C3AED]" },
    { label: "View Tickets", icon: <QrCode size={18} />, onClick: () => navigate("/tickets"), color: "bg-[#FFE800]" },
  ];

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-block">Member Dashboard</BrutalBadge>
          <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>
            Welcome back,<br />{member.name.split(" ")[0] || "Member"}!
          </h1>
          <p className="mt-4 font-mono text-sm text-slate-500">Member since: {member.memberSince}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <BrutalButton color="bg-white" className="text-xs px-4 py-2" onClick={() => setDashboardNotice(announcements.length ? announcements.map((item) => item.title).join(" | ") : "No new notifications right now.")}>
            <Bell size={14} className="inline mr-2" />
            Notifications ({announcements.length})
          </BrutalButton>
          <BrutalButton color="bg-[#171717]" text="text-white" className="text-xs px-4 py-2" onClick={() => navigate("/profile")}>
            Edit Profile
          </BrutalButton>
        </div>
      </div>
      {dashboardNotice && (
        <div className="mb-6 border-2 border-[#171717] bg-[#FFE800] p-4 font-bold uppercase tracking-widest text-xs">
          {dashboardNotice}
        </div>
      )}

      {/* Top Section: Membership Card - Full Width on Mobile */}
      <div className="mb-10">
        <BrutalCard color="bg-[#FB7185]" className="text-white relative">
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border-2 border-[#171717] flex items-center justify-center">
              <Check size={20} className="text-[#171717]" strokeWidth={3} />
            </div>
          </div>
          <div className="pr-16 md:pr-20">
            <div className="text-xs font-bold uppercase tracking-widest mb-3 md:mb-4 opacity-90">MEMBERSHIP</div>
            <h2 className="text-3xl md:text-5xl uppercase mb-2 md:mb-3" style={fonts.display}>You're In</h2>
            <p className="text-sm md:text-base opacity-90 font-mono">
              {member.batchYear ? `Batch ${member.batchYear}` : "Batch not set"} - Data Science Club
            </p>
          </div>
        </BrutalCard>
      </div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        {userStats.map((stat, i) => (
          <BrutalCard key={i} color="bg-white" className="hover:scale-105 transition-transform cursor-pointer">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} border-2 border-[#171717] flex items-center justify-center mb-3 md:mb-4 ${stat.color === "bg-[#FFE800]" ? "text-[#171717]" : "text-white"}`}>
              {stat.icon}
            </div>
            <div className="text-2xl md:text-4xl font-bold mb-1 break-words leading-tight" style={fonts.display}>{stat.value}</div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2" style={fonts.sans}>
              {stat.label}
            </div>
            <div className="text-[9px] md:text-[10px] font-mono text-[#2563EB]">{stat.trend}</div>
          </BrutalCard>
        ))}
      </div>

      {/* Main Content Grid - Stacks on mobile, side-by-side on desktop */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-6 md:gap-10 mb-10">
        {/* Left Column: Next Up & Announcements */}
        <div className="space-y-6 md:space-y-10">
          {/* Next Up - Event Card */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Next Up</h2>
            </div>
            <BrutalCard color="bg-white" className="p-0 overflow-hidden">
              {nextEvent ? (
              <div className="p-5 md:p-6 cursor-pointer" onClick={() => navigate(`/events/${nextEvent.slug || nextEvent.id}`)}>
                <div className="flex items-start justify-between gap-4 mb-5 md:mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">NEXT UP</div>
                    <div className="text-5xl md:text-6xl font-bold text-[#2563EB] mb-1" style={fonts.display}>
                      {new Date(nextEvent.start_time).toLocaleDateString(undefined, { day: "2-digit" })}
                    </div>
                    <div className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-400">
                      {new Date(nextEvent.start_time).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <BrutalBadge color="bg-[#2563EB]" className="text-xs md:text-sm px-3 md:px-4 py-2">
                    {(nextEvent.event_type || "EVENT").toUpperCase()}
                  </BrutalBadge>
                </div>
                <h3 className="text-xl md:text-2xl font-bold uppercase mb-3 md:mb-4" style={fonts.display}>{nextEvent.title}</h3>
                <div className="flex items-center gap-2 text-xs md:text-sm font-mono text-slate-600">
                  <Users size={14} className="text-[#2563EB]" />
                  <span className="font-bold">{nextEvent.capacity || "Open"}</span>
                  <BrutalBadge color="bg-[#2563EB]" className="text-[10px]">spots</BrutalBadge>
                  <span className="text-slate-400">available</span>
                </div>
              </div>
              ) : (
                <div className="p-5 md:p-6">
                  <p className="font-bold uppercase">No upcoming events yet.</p>
                  <p className="mt-2 text-sm font-mono text-slate-500">Approved events will appear here.</p>
                </div>
              )}
            </BrutalCard>
          </div>

          {/* Announcements Feed */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Announcements</h2>
              <BrutalBadge color="bg-[#FB7185]">Live Feed</BrutalBadge>
            </div>
            <div className="space-y-3 md:space-y-4">
              {announcements.length === 0 ? (
                <BrutalCard color="bg-white">
                  <p className="font-bold uppercase">No announcements yet.</p>
                  <p className="mt-2 text-sm font-mono text-slate-500">Published blog posts will appear here.</p>
                </BrutalCard>
              ) : announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className={`border-2 border-[#171717] p-4 md:p-5 bg-white brutal-shadow hover:brutal-shadow-hover transition-all cursor-pointer ${announcement.important ? "border-l-4 md:border-l-8 border-l-[#FB7185]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3 md:gap-4 mb-2">
                    <h3 className="text-sm md:text-lg font-bold leading-tight" style={fonts.sans}>
                      {announcement.title}
                    </h3>
                    <BrutalBadge 
                      color={announcement.type === "EVENT" ? "bg-[#2563EB]" : "bg-[#171717]"} 
                      className="shrink-0 text-[9px] md:text-[10px]"
                    >
                      {announcement.type}
                    </BrutalBadge>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-slate-500 font-mono">
                    <Clock size={12} />
                    {announcement.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Actions - Full width on mobile */}
        <div className="space-y-6 md:space-y-10">
          {/* Your Activity */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Your Activity</h2>
              <Trophy size={20} className="text-[#FFE800]" />
            </div>
            <BrutalCard color="bg-white" className="p-0 overflow-hidden">
              <div className="divide-y-2 divide-[#171717]">
                <div className="flex items-center justify-between p-3 md:p-4 bg-[#F4EFEB]">
                  <div>
                    <div className="text-xs md:text-sm font-bold" style={fonts.sans}>Event Proposals</div>
                    <div className="text-[9px] md:text-[10px] font-mono text-slate-500">Submitted by you</div>
                  </div>
                  <div className="text-base md:text-lg font-bold" style={fonts.display}>{counts.eventProposals}</div>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-white">
                  <div>
                    <div className="text-xs md:text-sm font-bold" style={fonts.sans}>Projects Submitted</div>
                    <div className="text-[9px] md:text-[10px] font-mono text-slate-500">Waiting for review or published</div>
                  </div>
                  <div className="text-base md:text-lg font-bold" style={fonts.display}>{counts.projects}</div>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-white">
                  <div>
                    <div className="text-xs md:text-sm font-bold" style={fonts.sans}>Blog Posts</div>
                    <div className="text-[9px] md:text-[10px] font-mono text-slate-500">Drafts and submissions by you</div>
                  </div>
                  <div className="text-base md:text-lg font-bold" style={fonts.display}>{counts.blogPosts}</div>
                </div>
              </div>
            </BrutalCard>
          </div>

          {/* Quick Actions - Better spacing on mobile */}
          <div>
            <h2 className="text-2xl md:text-3xl uppercase mb-4 md:mb-6" style={fonts.display}>Quick Actions</h2>
            <div className="space-y-3 md:space-y-4">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`w-full ${action.color} ${action.color === "bg-[#FFE800]" ? "text-[#171717]" : "text-white"} border-2 border-[#171717] p-3 md:p-4 font-bold uppercase tracking-widest text-xs md:text-sm brutal-shadow brutal-shadow-hover transition-all flex items-center justify-center md:justify-start gap-2 md:gap-3`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom CTA - Better responsive text */}
      <BrutalCard color="bg-[#2563EB]" className="text-white text-center border-4">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-3xl md:text-4xl lg:text-5xl uppercase mb-3 md:mb-4" style={fonts.display}>Find your next event</h3>
          <p className="text-sm md:text-lg opacity-90 mb-4 md:mb-6" style={fonts.serif}>
            Browse approved events, reserve your spot, or propose something new for the club.
          </p>
          <BrutalButton color="bg-[#FFE800]" onClick={() => navigate("/events")} className="w-full sm:w-auto">
            Explore Events
          </BrutalButton>
        </div>
      </BrutalCard>
    </div>
  );
}
