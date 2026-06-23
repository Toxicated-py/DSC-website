import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Camera, Calendar, QrCode, Bell, Award, Clock, Code, User, FileText } from "lucide-react";



import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet } from "../lib/apiClient";

import { BrutalButton, BrutalCard, BrutalBadge } from "../components/ui/brutal";

import { fonts } from "../config/fonts";

const rolePriority = ["president", "admin", "event_manager", "teacher", "student", "member"];
const primaryRoleFrom = (roles: string[]) => rolePriority.find((role) => roles.includes(role)) || "member";
const roleLabel = (role: string) => role.replace("_", " ");
const roleColor = (role: string) => role === "president" || role === "admin" ? "bg-[#FB7185]" : role === "event_manager" ? "bg-[#7C3AED]" : role === "student" ? "bg-[#FFE800]" : "bg-[#2563EB]";

export function DashboardPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState({
    name: "Member",
    phone: "",
    role: "member",
    batchYear: "",
    memberSince: "New member",
  });
  const [contributions, setContributions] = useState<any[]>([]);
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

      const [profile, contributionProposals, contributionProjects, contributionBlogs, contributionGallery, publicEvents, publicProjects, publicPosts] = await Promise.all([
        apiGet<any>("/api/me", { auth: true }),
        supabase
          .from("event_proposals")
          .select("id,title,status,submitted_at,event_type")
          .eq("proposed_by", userData.user.id)
          .order("submitted_at", { ascending: false })
          .limit(4),
        supabase
          .from("projects")
          .select("id,title,status,submitted_at,category")
          .eq("author_id", userData.user.id)
          .order("submitted_at", { ascending: false })
          .limit(4),
        supabase
          .from("blog_posts")
          .select("id,title,status,published_at,tags")
          .eq("author_id", userData.user.id)
          .order("published_at", { ascending: false })
          .limit(4),
        supabase
          .from("gallery_submissions")
          .select("id,title,status,created_at,event_name")
          .eq("submitted_by", userData.user.id)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("events")
          .select("id,slug,title,event_type,start_time,capacity,venue")
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
        phone: profile?.phone || userData.user.user_metadata?.phone || "",
        role: primaryRoleFrom(Array.isArray(profile?.roles) && profile.roles.length ? profile.roles : [profile?.role || "member"]),
        batchYear: profile?.batch_year ? String(profile.batch_year) : "",
        memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "New member",
      });
      setContributions([
        ...(contributionProposals.data || []).map((item) => ({ ...item, kind: "Proposed Event", date: item.submitted_at, icon: <Calendar size={18} />, color: "bg-[#2563EB]" })),
        ...(contributionProjects.data || []).map((item) => ({ ...item, kind: "Project Submitted", date: item.submitted_at, icon: <Code size={18} />, color: "bg-[#FB7185]" })),
        ...(contributionBlogs.data || []).map((item) => ({ ...item, kind: "Blog Post", date: item.published_at, icon: <FileText size={18} />, color: "bg-[#FFE800]", iconText: "text-[#171717]" })),
        ...(contributionGallery.data || []).map((item) => ({ ...item, kind: "Gallery Upload", date: item.created_at, icon: <Camera size={18} />, color: "bg-[#7C3AED]" })),
      ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 6));
      setDashboardEvents(publicEvents.data || []);
      setDashboardProjects(publicProjects.data || []);
      setDashboardPosts(publicPosts.data || []);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

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
  ];
  const accountCards = [
    { label: "View Tickets", helper: "Open QR tickets for your registered events.", icon: <QrCode size={24} />, onClick: () => navigate("/tickets"), color: "bg-[#FFE800]", text: "text-[#171717]" },
    { label: "My Certificates", helper: "View, print, and download issued certificates.", icon: <Award size={24} />, onClick: () => navigate("/certificates"), color: "bg-[#2563EB]", text: "text-white" },
  ];

  return (
    <div className="pb-20 min-h-screen bg-[#F4EFEB]">
      <section className="bg-[#171717] text-white px-6 pt-16 pb-14">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <BrutalBadge color={roleColor(member.role)} text={member.role === "student" ? "text-[#171717]" : "text-white"}>{roleLabel(member.role)}</BrutalBadge>
              {member.batchYear && <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">Batch {member.batchYear}</BrutalBadge>}
              <span className="font-mono text-xs text-slate-400">Member since {member.memberSince}</span>
            </div>
            <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>{member.name}</h1>
          </div>
          <div className="flex gap-3 flex-wrap">
          <BrutalButton color="bg-white" className="text-xs px-4 py-2" onClick={() => setDashboardNotice(announcements.length ? announcements.map((item) => item.title).join(" | ") : "No new notifications right now.")}>
            <Bell size={14} className="inline mr-2" />
            Notifications ({announcements.length})
          </BrutalButton>
          <BrutalButton color="bg-[#171717]" text="text-white" className="text-xs px-4 py-2 border-white/40" onClick={() => navigate("/profile")}>
            <User size={14} className="inline mr-2" />
            Edit Profile
          </BrutalButton>
          </div>
        </div>
      </section>
      <main className="px-6 pt-12 max-w-[1400px] mx-auto">
      {dashboardNotice && (
        <div className="mb-6 border-2 border-[#171717] bg-[#FFE800] p-4 font-bold uppercase tracking-widest text-xs">
          {dashboardNotice}
        </div>
      )}

      <section className="mb-10">
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl uppercase" style={fonts.display}>My Contributions</h2>
          <p className="text-sm text-slate-500">Events proposed, projects, blogs, and gallery uploads</p>
        </div>
        <BrutalCard color="bg-white" className="p-0 overflow-hidden">
          {contributions.length === 0 ? (
            <div className="p-6">
              <p className="font-bold uppercase">No contributions yet.</p>
              <p className="mt-2 text-sm font-mono text-slate-500">Submit a project, write a blog, propose an event, or upload gallery photos.</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-[#171717]">
              {contributions.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-4 p-4 md:p-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-12 w-12 shrink-0 border-2 border-[#171717] ${item.color} ${item.iconText || "text-white"} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold uppercase truncate" style={fonts.sans}>{item.title}</h3>
                      <p className="font-mono text-xs text-slate-500">
                        {item.kind} {item.date ? `- ${new Date(item.date).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <BrutalBadge className="shrink-0 text-[9px] sm:text-[10px] px-2 sm:px-3" color={["approved", "published", "featured"].includes(item.status) ? "bg-green-500" : item.status === "rejected" ? "bg-[#FB7185]" : "bg-[#FFE800]"} text={["approved", "published", "featured", "rejected"].includes(item.status) ? "text-white" : "text-[#171717]"}>
                    {item.status || "pending"}
                  </BrutalBadge>
                </div>
              ))}
            </div>
          )}
        </BrutalCard>
      </section>

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

        {/* Right Column: Actions - Full width on mobile */}
        <div className="space-y-6 md:space-y-10">
          {/* Quick Actions - Better spacing on mobile */}
          <div>
            <h2 className="text-2xl md:text-3xl uppercase mb-4 md:mb-6" style={fonts.display}>Account</h2>
            <div className="grid gap-4 mb-8">
              {accountCards.map((card) => (
                <button
                  key={card.label}
                  onClick={card.onClick}
                  className="text-left border-2 border-[#171717] bg-white p-5 brutal-shadow brutal-shadow-hover transition-all"
                >
                  <div className={`mb-4 h-12 w-12 ${card.color} ${card.text} border-2 border-[#171717] flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xl uppercase" style={fonts.display}>{card.label}</h3>
                  <p className="mt-2 text-xs font-mono text-slate-500">{card.helper}</p>
                </button>
              ))}
            </div>

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
      </main>
    </div>
  );
}
