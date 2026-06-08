import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Users, ArrowRight, ArrowLeft, Database, MapPin } from "lucide-react";
import { BrutalButton, BrutalCard, BrutalBadge } from "./components/ui/brutal";
import { apiGet } from "../lib/apiClient";
import { toast } from "sonner";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

export function HomePage() {
  const [homeEvents, setHomeEvents] = useState<any[]>([
    {
      id: "",
      num: "14",
      month: "JUN 2026",
      label: "Python Data Bootcamp 2026",
      type: "WORKSHOP",
      capacity: 40,
      registeredCount: 0,
      color: "bg-[#2563EB]",
    },
  ]);
  const [homeProject, setHomeProject] = useState<any>({
    id: "",
    title: "Research Paper Recommender",
    category: "Machine Learning",
    technologies: ["NLP", "Scikit-learn", "FastAPI"],
  });
  const [homeStats, setHomeStats] = useState({
    members: 7,
    events: 4,
    projects: 3,
  });

  useEffect(() => {
    let mounted = true;

    async function loadHomePageData() {
      const summary = await apiGet<any>("/api/home-summary").catch(() => null);

      if (!mounted) return;

      const events = (summary?.upcoming_events?.length ? summary.upcoming_events : [summary?.next_event]).filter(Boolean)
        .filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index)
        .sort((a, b) => String(a.start_time || "").localeCompare(String(b.start_time || "")))
        .slice(0, 8);
      const colors = ["bg-[#2563EB]", "bg-[#FB7185]", "bg-[#171717]", "bg-[#7C3AED]"];
      setHomeEvents(events.map((event, index) => {
        const start = event.start_time ? new Date(event.start_time) : null;
        return {
          id: event.id,
          num: start ? start.toLocaleDateString(undefined, { day: "2-digit" }) : "--",
          month: start ? start.toLocaleDateString(undefined, { month: "short", year: "numeric" }).toUpperCase() : "DATE TBD",
          label: event.title,
          type: (event.event_type || "EVENT").toUpperCase(),
          capacity: event.capacity,
          registeredCount: event.registeredCount || event.registered_count || 0,
          color: colors[index % colors.length],
        };
      }));
      setHomeProject(summary?.featured_project || null);
      setHomeStats({
        members: summary?.counts?.members || 0,
        events: summary?.counts?.events ?? events.length,
        projects: summary?.counts?.projects || 0,
      });
    }

    loadHomePageData();

    return () => {
      mounted = false;
    };
  }, []);

  const nextEvent = homeEvents[0];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-16 pb-0 md:pt-20 overflow-hidden min-h-screen flex flex-col border-b-2 border-[#171717]">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-16 -left-10 w-[280px] h-[280px] sm:-top-20 sm:-left-20 sm:w-[600px] sm:h-[600px] bg-[#E0DEF4]/60 mix-blend-multiply" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 80%)" }} />
          <div className="absolute -top-8 -left-6 w-[240px] h-[240px] sm:-top-10 sm:-left-10 sm:w-[500px] sm:h-[500px] bg-[#FADEE1]/50 mix-blend-multiply" style={{ clipPath: "polygon(0 0, 80% 10%, 100% 100%, 10% 80%)" }} />
          <div className="absolute top-32 right-32 md:right-64 w-24 h-24 rounded-full border-2 border-dashed border-[#FB7185]/60" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 w-full flex-1 grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Left: title + tagline */}
          <div className="flex flex-col justify-center">
            <div className="relative inline-block select-none max-w-max">
              <h1
                className="mobile-readable-title sm:text-[9rem] md:text-[11rem] lg:text-[13rem] leading-[0.85] text-[#171717]"
                style={{ ...fonts.display, textShadow: "8px 8px 0px #2563EB, 16px 16px 0px #FB7185" }}
              >
                DATA<br />SARATHI
              </h1>
            </div>

            <div className="mt-10 md:mt-14 max-w-xl relative">
              <div className="hidden md:block absolute -top-12 right-0 text-slate-400">
                <svg width="56" height="36" viewBox="0 0 60 40" fill="none">
                  <path d="M2 38C15 20 40 10 58 10M58 10L48 2M58 10L52 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-xl md:text-2xl text-[#171717] leading-snug" style={fonts.serif}>
                Student-run. Kathmandu-made. Data-driven with <i className="text-[#FB7185]">soul.</i>
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <Link to={localStorage.getItem("dsc-auth-state") === "logged-in" ? "/dashboard" : "/register"}>
                  <BrutalButton color="bg-[#FFE800]">Join the Club</BrutalButton>
                </Link>
                <Link to="/events">
                  <BrutalButton color="bg-white">See Events</BrutalButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: floating UI cards */}
          <div className="hidden lg:flex flex-col gap-4 pt-8 pb-8">
            {/* Success / membership card */}
            <div className="bg-[#FB7185] border-2 border-[#171717] p-5 brutal-shadow rotate-1 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80" style={fonts.sans}>Membership</span>
                <div className="w-7 h-7 rounded-full bg-white border-2 border-[#171717] flex items-center justify-center">
                  <Check size={14} className="text-[#171717]" strokeWidth={3} />
                </div>
              </div>
              <p className="text-white font-bold text-lg leading-none" style={fonts.display}>COMMUNITY</p>
              <p className="text-white/70 text-xs font-mono mt-1">Members, organizers, and builders</p>
            </div>

            {/* Upcoming event card */}
            <Link
              to={nextEvent ? `/events/${nextEvent.id}` : "/events"}
              className="block bg-white border-2 border-[#171717] p-5 brutal-shadow brutal-shadow-hover -rotate-1 transition-all group"
              aria-label={nextEvent ? `Open event ${nextEvent.label}` : "Open events"}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400" style={fonts.sans}>Next Up</span>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-[#2563EB] leading-none" style={fonts.display}>{nextEvent?.num || "--"}</p>
                  <p className="text-xs font-bold uppercase text-slate-500 mt-1">{nextEvent?.month || "No event yet"}</p>
                </div>
                <BrutalBadge color="bg-[#2563EB]">{nextEvent?.type || "Event"}</BrutalBadge>
              </div>
              <p className="text-sm font-bold mt-3 text-[#171717] uppercase" style={fonts.display}>{nextEvent?.label || "Approved events will appear here"}</p>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-400 mt-1">
                <Users size={12} /> {nextEvent?.capacity ? `${nextEvent.registeredCount || 0}/${nextEvent.capacity} spots` : "Club event"}
              </div>
            </Link>

            {/* Projects teaser */}
            <Link
              to={homeProject ? `/projects/${homeProject.id}` : "/projects"}
              className="block bg-[#7C3AED] border-2 border-[#171717] p-5 brutal-shadow brutal-shadow-hover rotate-1 transition-all group cursor-pointer"
              aria-label={homeProject ? `Open project ${homeProject.title}` : "Open projects"}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70" style={fonts.sans}>Projects</span>
              <p className="text-white font-bold text-xl leading-tight mt-2" style={fonts.display}>{homeProject?.title || "PUBLISHED PROJECTS"}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {(homeProject?.technologies?.length ? homeProject.technologies : [homeProject?.category || "Admin approved"]).map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase border border-white/30">{t}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80">
                View Project <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom event stat cards */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 w-full mt-12 md:mt-16">
          <div className="border-t-2 border-[#171717] pt-1">
            <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4">
              {homeEvents.length === 0 ? (
                <div className="w-full md:col-span-4 bg-white p-6 text-center">
                  <p className="font-bold uppercase">No published events yet.</p>
                  <p className="mt-1 text-xs font-mono text-slate-500">Approved events will appear here automatically.</p>
                </div>
              ) : homeEvents.map((ev, i) => (
                <Link
                  to={`/events/${ev.id}`}
                  key={i}
                  className={`relative ${ev.color} border-r-2 border-b-2 md:border-b-0 border-[#171717] last:border-r-0 p-4 md:p-6 flex flex-col text-white hover:opacity-90 transition-opacity group min-h-[150px] min-w-[78vw] sm:min-w-[280px] md:min-w-0 snap-start`}
                >
                  {ev.hot && (
                    <span className="absolute top-3 right-3 bg-[#FFE800] text-[#171717] text-[9px] font-bold uppercase px-1.5 py-0.5 border border-[#171717]">HOT</span>
                  )}
                  <span className="text-5xl font-bold leading-none mb-1" style={fonts.display}>{ev.num}</span>
                  <span className="text-[10px] font-bold tracking-widest opacity-70 mb-1" style={fonts.sans}>{ev.month}</span>
                  <span className="text-[10px] font-bold tracking-widest opacity-70 mb-3" style={fonts.sans}>{ev.type}</span>
                  <span className="text-sm font-bold leading-tight uppercase mt-auto" style={fonts.sans}>{ev.label}</span>
                  <ArrowRight size={14} className="mt-2 opacity-60 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats section ── */}
      <section className="py-20 md:py-28 border-b-2 border-[#171717]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <BrutalBadge color="bg-[#7C3AED]">Numbers speak</BrutalBadge>
              <h2 className="text-5xl md:text-7xl uppercase mt-4" style={fonts.display}>OUR COMMUNITY</h2>
            </div>
            <Link to="/about" className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-[#2563EB] hover:text-[#171717] transition-colors group shrink-0">
              Our Full Story <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border-2 border-[#171717]">
            <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-[#171717] bg-white">
              <p className="text-4xl font-bold text-[#2563EB] mb-2" style={fonts.display}>{homeStats.members}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4" style={fonts.sans}>Active Members</p>
              <p className="text-sm text-slate-600 leading-relaxed" style={fonts.sans}>
                Members added through the connected account system will make up the active club community.
              </p>
            </div>
            <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-[#171717] bg-[#2563EB] text-white">
              <p className="text-4xl font-bold mb-2" style={fonts.display}>{homeStats.events}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-4" style={fonts.sans}>Events Run</p>
              <p className="text-sm opacity-80 leading-relaxed" style={fonts.sans}>
                Approved events added by admins will power the public events page and member dashboard.
              </p>
            </div>
            <div className="p-8 bg-[#F4EFEB]">
              <p className="text-4xl font-bold text-[#FB7185] mb-2" style={fonts.display}>{homeStats.projects}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4" style={fonts.sans}>Student Projects</p>
              <p className="text-sm text-slate-600 leading-relaxed" style={fonts.sans}>
                Published student projects will appear in the showcase after admin review.
              </p>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-10 items-center">
            <p className="text-xl md:text-2xl text-[#171717] leading-relaxed" style={fonts.serif}>
              We started as a handful of students at SMS who wanted to do{" "}
              <i className="text-[#FB7185]">more than just pass exams.</i> Today, we host hackathons, conduct workshops, and maintain an open-source culture — proudly student-run and deeply passionate about the future of AI in Nepal.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: <Users size={18}/>, title: "Student-Run", desc: "Every decision, event, and project is led by students, for students." },
                { icon: <Database size={18}/>, title: "Open-Source First", desc: "All our tooling and project repos are publicly available on GitHub." },
                { icon: <MapPin size={18}/>, title: "Kathmandu-Made", desc: "Rooted at SMS TU, Kirtipur — but thinking global." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border-2 border-[#171717] bg-white brutal-shadow">
                  <div className="w-9 h-9 bg-[#FFE800] border-2 border-[#171717] flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest" style={fonts.sans}>{item.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5" style={fonts.sans}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-[#2563EB] text-white text-center border-b-2 border-[#171717] relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h2 className="mobile-section-title md:text-8xl mb-8 uppercase" style={fonts.display}>Ready to build?</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90" style={fonts.serif}>
            Join the community of builders, researchers, and data enthusiasts at SMS TU.
          </p>
          <BrutalButton
            color="bg-[#FFE800]"
            onClick={() => toast.info("Membership applications are currently closed. We'll announce when they reopen.")}
          >
            Apply For Membership
          </BrutalButton>
        </div>
      </section>
    </>
  );
}
