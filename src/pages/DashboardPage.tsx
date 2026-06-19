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
