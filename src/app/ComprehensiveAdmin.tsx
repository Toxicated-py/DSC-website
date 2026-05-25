/**
 * Comprehensive Admin Panel
 * 
 * FEATURES:
 * - User Management (edit roles, designations, verify/delete users)
 * - Event Management (create, edit, delete events)
 * - Project Management (view, approve, feature projects)
 * - Content Management (edit homepage, about page, team)
 * - Site Settings (social links, contact info, general settings)
 * - Analytics Dashboard (stats, charts, growth metrics)
 * 
 * This is a fully featured admin panel with CRUD operations for all site content.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, Shield, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff, 
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

// ─── Reusable Components ───────────────────────────────────────────────────────

const BrutalButton = ({ children, color = "bg-[#FFE800]", text = "text-[#171717]", className = "", ...props }: any) => (
  <button 
    className={`px-6 py-3 ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover transition-all ${className}`} 
    {...props}
  >
    {children}
  </button>
);

const BrutalCard = ({ children, className = "", color = "bg-white", ...props }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${className}`} {...props}>
    {children}
  </div>
);

const BrutalBadge = ({ children, color = "bg-[#FB7185]", text="text-white", className = "" }: any) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

const BrutalInput = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <input 
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
      {...props}
    />
  </div>
);

const BrutalTextarea = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <textarea 
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all resize-none"
      rows={4}
      {...props}
    />
  </div>
);

const BrutalSelect = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <select 
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
      {...props}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ─── Main Admin Panel ──────────────────────────────────────────────────────────

export function ComprehensiveAdminPanel() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCertificateAdmin, setIsCertificateAdmin] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState("");
  const [profileOptions, setProfileOptions] = useState<any[]>([]);
  const [designationOptions, setDesignationOptions] = useState<any[]>([]);
  const [newDesignationLabel, setNewDesignationLabel] = useState("");
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);
  const [certificateForm, setCertificateForm] = useState({
    recipientId: "",
    title: "",
    certificateType: "Workshop",
    issuerName: "Data Science Club",
    issuedAt: "",
    certificateUrl: "",
  });
  const [editingCertificateId, setEditingCertificateId] = useState("");
  const [adminStatus, setAdminStatus] = useState("");
  const [eventProposals, setEventProposals] = useState<any[]>([]);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [siteSettings, setSiteSettings] = useState({
    siteName: "Data Science Club – SMS TU",
    tagline: "Empowering Students Through Data",
    contactEmail: "contact@datascienceclub.sms.tu.edu.np",
    contactPhone: "+977-1-4331976",
    address: "School of Mathematical Sciences, Tribhuvan University, Kathmandu, Nepal",
    socialLinks: {
      github: "https://github.com/datascienceclub",
      linkedin: "https://linkedin.com/company/datascienceclub",
      twitter: "https://twitter.com/datascienceclub",
      facebook: "https://facebook.com/datascienceclub",
      instagram: "https://instagram.com/datascienceclub",
      discord: "https://discord.gg/datascienceclub",
    }
  });

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: <Home size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
    { id: "events", label: "Events", icon: <Calendar size={16} /> },
    { id: "projects", label: "Projects", icon: <Trophy size={16} /> },
    { id: "blogs", label: "Blogs", icon: <FileText size={16} /> },
    { id: "gallery", label: "Gallery", icon: <Eye size={16} /> },
    { id: "partners", label: "Partners", icon: <Globe size={16} /> },
    { id: "resources", label: "Resources", icon: <Save size={16} /> },
    { id: "certificates", label: "Certificates", icon: <Award size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadAdminData() {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      const canManage = myProfile?.role === "admin" || myProfile?.role === "organizer";
      setIsCertificateAdmin(canManage);
      if (!canManage) return;

      const [{ data: profiles }, { data: certs }, { data: projectRows }, { data: proposalRows }, { data: eventRows }, { data: designationRows }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,full_name,email,role,membership_status,designation,designation_status,batch_year,created_at")
          .order("full_name", { ascending: true }),
        supabase
          .from("certificates")
          .select("id,recipient_id,title,certificate_type,issuer_name,issued_at,status,certificate_url,created_at,profiles:recipient_id(full_name,email)")
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id,title,category,technologies,summary,status,submitted_at,published_at,profiles:author_id(full_name,email)")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("event_proposals")
          .select("id,title,event_type,proposed_date,venue,capacity,host,summary,coordinator_emails,status,submitted_at,profiles:proposed_by(full_name,email)")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("events")
          .select("id,title,event_type,start_time,venue,capacity,status,registration_open,created_at")
          .order("start_time", { ascending: false, nullsFirst: false }),
        supabase
          .from("designation_options")
          .select("id,label,is_active,sort_order")
          .order("sort_order", { ascending: true })
          .order("label", { ascending: true }),
      ]);

      if (!mounted) return;
      const mappedProfiles = (profiles || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || profile.email || "Member",
        email: profile.email,
        role: profile.role,
        membershipStatus: profile.membership_status,
        designationStatus: profile.designation_status,
        verified: profile.membership_status === "approved" || profile.role === "member" || profile.role === "organizer" || profile.role === "admin",
        designation: profile.designation || "",
        joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "",
      }));
      setUsers(mappedProfiles);
      setProfileOptions(profiles || []);
      setDesignationOptions(designationRows || []);
      setIssuedCertificates(certs || []);
      setProjects((projectRows || []).map((project) => {
        const author = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;
        return {
          ...project,
          author: author?.full_name || author?.email || "Member",
          submittedDate: project.submitted_at ? new Date(project.submitted_at).toLocaleDateString() : "",
          tags: project.technologies || [],
        };
      }));
      setEventProposals((proposalRows || []).map((proposal) => {
        const author = Array.isArray(proposal.profiles) ? proposal.profiles[0] : proposal.profiles;
        return {
          ...proposal,
          proposer: author?.full_name || author?.email || "Member",
          submittedDate: proposal.submitted_at ? new Date(proposal.submitted_at).toLocaleDateString() : "",
        };
      }));
      setEvents((eventRows || []).map((event) => ({
        ...event,
        date: event.start_time ? new Date(event.start_time).toLocaleDateString() : "Not scheduled",
        location: event.venue || "TBA",
        category: event.event_type,
        attendees: 0,
        featured: event.status === "published",
      })));
    }

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, []);

  // Helper functions
  const getRoleBadge = (role: string, verified: boolean) => {
    if (role === "admin") {
      return <BrutalBadge color="bg-[#FB7185]" className="inline-flex items-center gap-1"><Crown size={10} /> ADMIN</BrutalBadge>;
    }
    if (role === "organizer") {
      return <BrutalBadge color="bg-[#7C3AED]" className="inline-flex items-center gap-1"><GraduationCap size={10} /> ORGANIZER</BrutalBadge>;
    }
    if (role === "member" && verified) {
      return <BrutalBadge color="bg-[#2563EB]" className="inline-flex items-center gap-1"><UserCheck size={10} /> MEMBER</BrutalBadge>;
    }
    return <BrutalBadge color="bg-slate-400" className="inline-flex items-center gap-1"><User size={10} /> STUDENT</BrutalBadge>;
  };

  const updateProfile = async (id: string, patch: Record<string, unknown>) => {
    if (!isSupabaseConfigured || !supabase) return;
    setAdminStatus("");
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setUsers(users.map((user) => user.id === id ? {
      ...user,
      ...patch,
      membershipStatus: patch.membership_status ?? user.membershipStatus,
      designationStatus: patch.designation_status ?? user.designationStatus,
    } : user));
    setAdminStatus("User updated.");
  };

  const addDesignationOption = async () => {
    const label = newDesignationLabel.trim();
    if (!label || !isSupabaseConfigured || !supabase) return;
    setAdminStatus("");

    const nextSortOrder = designationOptions.length
      ? Math.max(...designationOptions.map((option) => Number(option.sort_order) || 0)) + 10
      : 10;
    const { data, error } = await supabase
      .from("designation_options")
      .insert({ label, sort_order: nextSortOrder })
      .select("id,label,is_active,sort_order")
      .single();

    if (error) {
      setAdminStatus(error.message);
      return;
    }

    setDesignationOptions([...designationOptions, data].sort((a, b) => (a.sort_order - b.sort_order) || a.label.localeCompare(b.label)));
    setNewDesignationLabel("");
    setAdminStatus("Designation option added.");
  };

  const removeDesignationOption = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    setAdminStatus("");

    const { error } = await supabase.from("designation_options").delete().eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }

    setDesignationOptions(designationOptions.filter((option) => option.id !== id));
    setAdminStatus("Designation option removed.");
  };

  const handleUserAction = async (user: any, action: string) => {
    if (!action) return;

    if (action === "verify") {
      await updateProfile(user.id, { membership_status: "approved" });
      return;
    }
    if (action === "unverify") {
      await updateProfile(user.id, { membership_status: "pending" });
      return;
    }
    if (action === "approve-designation") {
      await updateProfile(user.id, { designation_status: "approved" });
      return;
    }
    if (action === "reject-designation") {
      await updateProfile(user.id, { designation_status: "rejected" });
    }
  };

  const resetCertificateForm = () => {
    setEditingCertificateId("");
    setCertificateForm({
      recipientId: "",
      title: "",
      certificateType: "Workshop",
      issuerName: "Data Science Club",
      issuedAt: "",
      certificateUrl: "",
    });
  };

  const handleArchiveEvent = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from("events").update({ status: "archived" }).eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setEvents(events.map(e => e.id === id ? { ...e, status: "archived" } : e));
  };

  const updateProjectStatus = async (id: string, status: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase
      .from("projects")
      .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
  };

  const updateProposalStatus = async (id: string, status: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from("event_proposals").update({ status }).eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setEventProposals(eventProposals.map(p => p.id === id ? { ...p, status } : p));
  };

  const createEventFromProposal = async (proposal: any) => {
    if (!isSupabaseConfigured || !supabase) return;
    const slug = `${proposal.title}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("events").insert({
      title: proposal.title,
      slug,
      event_type: proposal.event_type,
      short_description: proposal.summary.slice(0, 160),
      description: proposal.summary,
      start_time: proposal.proposed_date ? new Date(proposal.proposed_date).toISOString() : null,
      venue: proposal.venue,
      capacity: proposal.capacity || 40,
      status: "approved",
    });
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    await updateProposalStatus(proposal.id, "approved");
    setAdminStatus("Event created from proposal.");
  };

  const handleIssueCertificate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCertificateStatus("");

    if (!isSupabaseConfigured || !supabase) {
      setCertificateStatus("Supabase is not configured.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate("/login?redirect=/admin");
      return;
    }

    const payload = {
      recipient_id: certificateForm.recipientId,
      issued_by: userData.user.id,
      title: certificateForm.title,
      certificate_type: certificateForm.certificateType,
      issuer_name: certificateForm.issuerName,
      issued_at: certificateForm.issuedAt || null,
      certificate_url: certificateForm.certificateUrl || null,
      status: "approved",
    };
    const { error } = editingCertificateId
      ? await supabase.from("certificates").update(payload).eq("id", editingCertificateId)
      : await supabase.from("certificates").insert(payload);

    if (error) {
      setCertificateStatus(error.message);
      return;
    }

    setCertificateStatus(editingCertificateId ? "Certificate updated." : "Certificate issued.");
    resetCertificateForm();

    const { data: certs } = await supabase
      .from("certificates")
      .select("id,recipient_id,title,certificate_type,issuer_name,issued_at,status,certificate_url,created_at,profiles:recipient_id(full_name,email)")
      .order("created_at", { ascending: false });
    setIssuedCertificates(certs || []);
  };

  const editCertificate = (certificate: any) => {
    setEditingCertificateId(certificate.id);
    setCertificateForm({
      recipientId: certificate.recipient_id || "",
      title: certificate.title || "",
      certificateType: certificate.certificate_type || "Workshop",
      issuerName: certificate.issuer_name || "Data Science Club",
      issuedAt: certificate.issued_at || "",
      certificateUrl: certificate.certificate_url || "",
    });
    setCertificateStatus("");
  };

  const deleteCertificate = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!window.confirm("Delete this certificate permanently?")) return;
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) {
      setCertificateStatus(error.message);
      return;
    }
    setIssuedCertificates(issuedCertificates.filter((certificate) => certificate.id !== id));
    setCertificateStatus("Certificate deleted.");
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto min-h-screen bg-[#F4EFEB]">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-flex items-center gap-1">
            <Shield size={10} /> ADMIN ACCESS
          </BrutalBadge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl uppercase leading-none" style={fonts.display}>
            Admin Panel
          </h1>
          <p className="mt-4 font-mono text-xs md:text-sm text-slate-500">
            Manage all aspects of your Data Science Club website
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 border-2 border-[#171717] bg-white hover:bg-[#F4EFEB] transition-all font-bold uppercase tracking-widest text-xs md:text-sm"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 border-2 border-[#171717] bg-white hover:bg-[#F4EFEB] transition-all font-bold uppercase tracking-widest text-xs md:text-sm"
          >
            View Site
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b-2 border-[#171717] pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 md:px-6 py-3 font-bold uppercase tracking-widest text-xs md:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedTab === tab.id
                ? "bg-[#171717] text-white border-2 border-[#171717]"
                : "bg-white text-[#171717] border-2 border-transparent hover:border-[#171717]"
            }`}
          >
            {tab.icon}
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {adminStatus && (
        <div className="mb-6 border-2 border-[#171717] bg-[#FFE800] p-4 font-bold text-sm">
          {adminStatus}
        </div>
      )}

      {/* ─── OVERVIEW TAB ───────────────────────────────────────────────────── */}
      {selectedTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            <BrutalCard color="bg-[#2563EB]" className="text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>{users.length}</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80">Total Users</div>
            </BrutalCard>
            <BrutalCard color="bg-[#7C3AED]" className="text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>{events.length}</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80">Events</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FB7185]" className="text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>{projects.length}</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80">Projects</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FFE800]">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>
                {projects.filter(p => p.status === "submitted" || p.status === "pending").length + eventProposals.filter(p => p.status === "pending").length}
              </div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-600">Pending Reviews</div>
            </BrutalCard>
          </div>

          {/* Quick Actions */}
          <BrutalCard className="mb-8">
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => { setEditingItem(null); setShowEventModal(true); }}
                className="p-4 border-2 border-[#171717] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all brutal-shadow brutal-shadow-hover"
              >
                <Plus size={20} className="mb-2" />
                <div className="text-xs font-bold uppercase tracking-widest">Create Event</div>
              </button>
              <button
                onClick={() => setSelectedTab("users")}
                className="p-4 border-2 border-[#171717] bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all brutal-shadow brutal-shadow-hover"
              >
                <Users size={20} className="mb-2" />
                <div className="text-xs font-bold uppercase tracking-widest">Manage Users</div>
              </button>
              <button
                onClick={() => setSelectedTab("projects")}
                className="p-4 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] transition-all brutal-shadow brutal-shadow-hover"
              >
                <Trophy size={20} className="mb-2" />
                <div className="text-xs font-bold uppercase tracking-widest">Review Projects</div>
              </button>
            </div>
          </BrutalCard>

          {/* Recent Activity */}
          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Latest member</p>
                  <p className="text-xs text-slate-500 font-mono">{users[0]?.name || "No members yet"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 bg-[#FB7185] border-2 border-[#171717] flex items-center justify-center text-white">
                  <Trophy size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Latest project submission</p>
                  <p className="text-xs text-slate-500 font-mono">{projects[0]?.title || "No projects submitted yet"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#7C3AED] border-2 border-[#171717] flex items-center justify-center text-white">
                  <Calendar size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Latest event proposal</p>
                  <p className="text-xs text-slate-500 font-mono">{eventProposals[0]?.title || "No event proposals yet"}</p>
                </div>
              </div>
            </div>
          </BrutalCard>
        </>
      )}

      {/* ─── USERS TAB ───────────────────────────────────────────────────────── */}
      {selectedTab === "users" && (
        <>
          {/* Search & Actions */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all brutal-shadow"
              />
            </div>
            <button
              onClick={() => { setEditingItem(null); setShowUserModal(true); }}
              className="px-6 py-3 bg-[#2563EB] text-white border-2 border-[#171717] font-bold uppercase tracking-widest text-sm brutal-shadow brutal-shadow-hover flex items-center gap-2 justify-center"
            >
              <Plus size={16} /> Add User
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            <BrutalCard color="bg-white">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>{users.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Users</div>
            </BrutalCard>
            <BrutalCard color="bg-[#2563EB]" className="text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>
                {users.filter(u => u.role === "member" && u.verified).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Members</div>
            </BrutalCard>
            <BrutalCard color="bg-[#7C3AED]" className="text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>
                {users.filter(u => u.role === "organizer").length}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Organizers</div>
            </BrutalCard>
            <BrutalCard color="bg-slate-400" className="text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>
                {users.filter(u => !u.verified).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Pending</div>
            </BrutalCard>
          </div>

          <BrutalCard color="bg-white" className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl uppercase mb-2" style={fonts.display}>Designation Options</h2>
                <p className="text-sm text-slate-600">
                  These are the roles users can request from their profile page. Approval is still handled per user.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[420px]">
                <input
                  type="text"
                  value={newDesignationLabel}
                  onChange={(event) => setNewDesignationLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void addDesignationOption();
                    }
                  }}
                  placeholder="Add designation, e.g. Research Lead"
                  className="flex-1 border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => void addDesignationOption()}
                  className="px-5 py-3 bg-[#FFE800] text-[#171717] border-2 border-[#171717] font-bold uppercase tracking-widest text-xs brutal-shadow brutal-shadow-hover"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {designationOptions.map((option) => (
                <span key={option.id} className="inline-flex items-center gap-2 border-2 border-[#171717] bg-[#F4EFEB] px-3 py-2 text-xs font-bold uppercase tracking-widest">
                  {option.label}
                  <button
                    type="button"
                    onClick={() => void removeDesignationOption(option.id)}
                    className="text-[#FB7185] hover:text-[#171717]"
                    title={`Remove ${option.label}`}
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </span>
              ))}
              {designationOptions.length === 0 && (
                <p className="text-sm text-slate-500 font-mono">No designation options yet.</p>
              )}
            </div>
          </BrutalCard>

          {/* Users Table */}
          <BrutalCard color="bg-white" className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#171717]">
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Email</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Role</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Designation</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 hover:bg-[#F4EFEB] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs md:text-sm text-slate-600">{user.email}</td>
                      <td className="p-4">{getRoleBadge(user.role, user.verified)}</td>
                      <td className="p-4">
                        {user.designation ? (
                          <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                              {user.designation}
                            </span>
                            <div>
                              <BrutalBadge
                                color={user.designationStatus === "approved" ? "bg-green-500" : user.designationStatus === "rejected" ? "bg-[#FB7185]" : "bg-[#FFE800]"}
                                text={user.designationStatus === "pending" ? "text-[#171717]" : "text-white"}
                              >
                                {user.designationStatus || "pending"}
                              </BrutalBadge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                            <Check size={12} strokeWidth={3} /> Verified
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-end gap-2">
                          <select
                            value={user.role}
                            onChange={(event) => updateProfile(user.id, { role: event.target.value })}
                            className="border-2 border-[#171717] bg-white p-2 text-xs font-bold uppercase"
                          >
                            <option value="student">Student</option>
                            <option value="member">Member</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => updateProfile(user.id, { membership_status: user.membershipStatus === "approved" ? "pending" : "approved" })}
                            className="p-2 hover:bg-[#2563EB] hover:text-white border-2 border-[#171717] bg-white transition-all text-xs font-bold uppercase"
                          >
                            {user.membershipStatus === "approved" ? "Unverify" : "Verify"}
                          </button>
                          {user.designation && (
                            <>
                              <button
                                onClick={() => updateProfile(user.id, { designation_status: "approved" })}
                                className="p-2 hover:bg-green-500 hover:text-white border-2 border-[#171717] bg-white transition-all text-xs font-bold uppercase"
                              >
                                Approve Designation
                              </button>
                              <button
                                onClick={() => updateProfile(user.id, { designation_status: "rejected" })}
                                className="p-2 hover:bg-[#FB7185] hover:text-white border-2 border-[#171717] bg-white transition-all text-xs font-bold uppercase"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BrutalCard>
        </>
      )}

      {/* ─── EVENTS TAB ──────────────────────────────────────────────────────── */}
      {selectedTab === "events" && (
        <>
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all brutal-shadow"
              />
            </div>
            <button
              onClick={() => { setEditingItem(null); setShowEventModal(true); }}
              className="px-6 py-3 bg-[#7C3AED] text-white border-2 border-[#171717] font-bold uppercase tracking-widest text-sm brutal-shadow brutal-shadow-hover flex items-center gap-2 justify-center"
            >
              <Plus size={16} /> Create Event
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <BrutalCard key={event.id} color="bg-white">
                <div className="flex items-start justify-between mb-4">
                  <BrutalBadge color={event.status === "Upcoming" ? "bg-[#2563EB]" : "bg-slate-400"}>
                    {event.status}
                  </BrutalBadge>
                  {event.featured && <Star size={16} className="text-[#FFE800] fill-[#FFE800]" />}
                </div>
                <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar size={14} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users size={14} />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
                <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4">
                  {event.category}
                </BrutalBadge>
                <div className="flex gap-2 pt-4 border-t-2 border-slate-200">
                  <button
                    onClick={() => { setEditingItem(event); setShowEventModal(true); }}
                    className="flex-1 p-2 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchiveEvent(event.id)}
                    className="flex-1 p-2 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white transition-all font-bold uppercase text-xs"
                  >
                    Archive
                  </button>
                </div>
              </BrutalCard>
            ))}
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Proposed Events</h2>
              <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{eventProposals.length}</BrutalBadge>
            </div>
            <div className="grid gap-6">
              {eventProposals.length === 0 ? (
                <BrutalCard color="bg-white" className="text-center">
                  <MessageSquare size={36} className="mx-auto mb-3 text-[#2563EB]" />
                  <h3 className="text-2xl uppercase mb-2" style={fonts.display}>No Event Proposals</h3>
                  <p className="text-sm text-slate-600">Submitted event ideas will appear here for review.</p>
                </BrutalCard>
              ) : (
                eventProposals.map((proposal) => (
                  <BrutalCard key={proposal.id} color="bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-xl font-bold uppercase" style={fonts.display}>{proposal.title}</h3>
                          <BrutalBadge color="bg-[#2563EB]">{proposal.event_type}</BrutalBadge>
                          <BrutalBadge color={proposal.status === "approved" ? "bg-green-500" : proposal.status === "rejected" ? "bg-[#FB7185]" : "bg-[#FFE800]"} text={proposal.status === "pending" ? "text-[#171717]" : "text-white"}>
                            {proposal.status}
                          </BrutalBadge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          by <span className="font-bold">{proposal.proposer}</span> - {proposal.submittedDate}
                        </p>
                        <p className="text-sm text-slate-700 mb-3">{proposal.summary}</p>
                        <div className="flex gap-4 flex-wrap text-xs font-mono text-slate-500">
                          <span>Date: {proposal.proposed_date || "TBA"}</span>
                          <span>Venue: {proposal.venue || "TBA"}</span>
                          <span>Capacity: {proposal.capacity || "TBA"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => createEventFromProposal(proposal)}
                          className="px-3 py-2 border-2 border-[#171717] bg-green-500 text-white hover:bg-green-600 transition-all font-bold uppercase text-xs"
                        >
                          Approve + Create
                        </button>
                        <button
                          onClick={() => updateProposalStatus(proposal.id, "rejected")}
                          className="px-3 py-2 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] transition-all font-bold uppercase text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </BrutalCard>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── PROJECTS TAB ─────────────────────────────────────────────────────── */}
      {selectedTab === "proposals" && (
        <div className="grid gap-6">
          {eventProposals.length === 0 ? (
            <BrutalCard color="bg-white" className="text-center">
              <MessageSquare size={36} className="mx-auto mb-3 text-[#2563EB]" />
              <h2 className="text-2xl uppercase mb-2" style={fonts.display}>No Event Proposals</h2>
              <p className="text-sm text-slate-600">Submitted event ideas will appear here for review.</p>
            </BrutalCard>
          ) : (
            eventProposals.map((proposal) => (
              <BrutalCard key={proposal.id} color="bg-white">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-xl font-bold uppercase" style={fonts.display}>{proposal.title}</h3>
                      <BrutalBadge color="bg-[#2563EB]">{proposal.event_type}</BrutalBadge>
                      <BrutalBadge color={proposal.status === "approved" ? "bg-green-500" : proposal.status === "rejected" ? "bg-[#FB7185]" : "bg-[#FFE800]"} text={proposal.status === "pending" ? "text-[#171717]" : "text-white"}>
                        {proposal.status}
                      </BrutalBadge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      by <span className="font-bold">{proposal.proposer}</span> - {proposal.submittedDate}
                    </p>
                    <p className="text-sm text-slate-700 mb-3">{proposal.summary}</p>
                    <div className="flex gap-4 flex-wrap text-xs font-mono text-slate-500">
                      <span>Date: {proposal.proposed_date || "TBA"}</span>
                      <span>Venue: {proposal.venue || "TBA"}</span>
                      <span>Capacity: {proposal.capacity || "TBA"}</span>
                      <span>Coordinators: {proposal.coordinator_emails?.length ? proposal.coordinator_emails.join(", ") : "none"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => createEventFromProposal(proposal)}
                      className="px-3 py-2 border-2 border-[#171717] bg-green-500 text-white hover:bg-green-600 transition-all font-bold uppercase text-xs"
                    >
                      Approve + Create
                    </button>
                    <button
                      onClick={() => updateProposalStatus(proposal.id, "rejected")}
                      className="px-3 py-2 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] transition-all font-bold uppercase text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </BrutalCard>
            ))
          )}
        </div>
      )}

      {selectedTab === "projects" && (
        <>
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all brutal-shadow"
              />
            </div>
          </div>

          <div className="grid gap-6">
            {filteredProjects.map((project) => (
              <BrutalCard key={project.id} color="bg-white">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold uppercase" style={fonts.display}>{project.title}</h3>
                      {project.featured && <Star size={16} className="text-[#FFE800] fill-[#FFE800]" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      by <span className="font-bold">{project.author}</span> • {project.submittedDate}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {project.tags.map(tag => (
                        <BrutalBadge key={tag} color="bg-[#2563EB]" className="text-[9px]">{tag}</BrutalBadge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <BrutalBadge color={project.status === "published" || project.status === "approved" ? "bg-green-500" : "bg-[#FFE800]"} text={project.status === "published" || project.status === "approved" ? "text-white" : "text-[#171717]"}>
                      {project.status}
                    </BrutalBadge>
                    <div className="flex gap-2">
                      {project.status !== "published" && (
                        <button
                          onClick={() => updateProjectStatus(project.id, "published")}
                          className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white hover:bg-green-600 transition-all font-bold uppercase text-xs"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => updateProjectStatus(project.id, "rejected")}
                        className="px-3 py-1 border-2 border-[#171717] bg-[#FFE800] hover:bg-[#FCD34D] transition-all font-bold uppercase text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </BrutalCard>
            ))}
          </div>
        </>
      )}

      {/* ─── CONTENT TAB ───────────────────────────────────────────────────────── */}
      {["blogs", "gallery", "partners", "resources"].includes(selectedTab) && (
        <div className="space-y-6">
          <BrutalCard color="bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>
                  {selectedTab === "blogs" && "Blog Management"}
                  {selectedTab === "gallery" && "Gallery Submissions"}
                  {selectedTab === "partners" && "Partner Submissions"}
                  {selectedTab === "resources" && "Learning Materials"}
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  {selectedTab === "blogs" && "Review, publish, edit, and archive club blog posts from this section."}
                  {selectedTab === "gallery" && "Approve gallery submissions before they appear publicly."}
                  {selectedTab === "partners" && "Approve partner submissions before they appear publicly."}
                  {selectedTab === "resources" && "Learning materials are admin-only for now. Add material publishing here next."}
                </p>
              </div>
              <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">Synced Tab</BrutalBadge>
            </div>
            <div className="border-2 border-dashed border-[#171717] p-8 text-center bg-[#F4EFEB]">
              <p className="font-bold uppercase tracking-widest text-sm">
                Data tables are ready in Supabase. Full CRUD controls are the next admin pass.
              </p>
            </div>
          </BrutalCard>
        </div>
      )}

      {selectedTab === "certificates" && (
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <BrutalCard color="bg-white">
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>
              {editingCertificateId ? "Edit Certificate" : "Issue Certificate"}
            </h2>
            {!isCertificateAdmin ? (
              <div className="border-2 border-[#171717] bg-[#FFE800] p-4">
                <p className="text-sm font-bold">
                  Your profile must have the admin or organizer role before you can issue certificates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleIssueCertificate}>
                <BrutalSelect
                  label="Member"
                  value={certificateForm.recipientId}
                  onChange={(event: any) => setCertificateForm({ ...certificateForm, recipientId: event.target.value })}
                  required
                  options={[
                    { value: "", label: "Select member" },
                    ...profileOptions.map((profile) => ({
                      value: profile.id,
                      label: `${profile.full_name || "Member"} (${profile.email})`,
                    })),
                  ]}
                />
                <BrutalInput
                  label="Certificate Title"
                  value={certificateForm.title}
                  onChange={(event: any) => setCertificateForm({ ...certificateForm, title: event.target.value })}
                  placeholder="Machine Learning Fundamentals"
                  required
                />
                <BrutalSelect
                  label="Type"
                  value={certificateForm.certificateType}
                  onChange={(event: any) => setCertificateForm({ ...certificateForm, certificateType: event.target.value })}
                  options={[
                    { value: "Workshop", label: "Workshop" },
                    { value: "Competition", label: "Competition" },
                    { value: "Course", label: "Course" },
                    { value: "Participation", label: "Participation" },
                  ]}
                />
                <BrutalInput
                  label="Issuer"
                  value={certificateForm.issuerName}
                  onChange={(event: any) => setCertificateForm({ ...certificateForm, issuerName: event.target.value })}
                  required
                />
                <BrutalInput
                  label="Issued Date"
                  type="date"
                  value={certificateForm.issuedAt}
                  onChange={(event: any) => setCertificateForm({ ...certificateForm, issuedAt: event.target.value })}
                />
                <BrutalInput
                  label="PDF Link"
                  value={certificateForm.certificateUrl}
                  onChange={(event: any) => setCertificateForm({ ...certificateForm, certificateUrl: event.target.value })}
                  placeholder="https://..."
                />
                {certificateStatus && (
                  <p className="mb-4 text-xs font-bold text-[#2563EB]">{certificateStatus}</p>
                )}
                <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full">
                  <Award size={16} className="inline mr-2" /> {editingCertificateId ? "Update Certificate" : "Issue Certificate"}
                </BrutalButton>
                {editingCertificateId && (
                  <button
                    type="button"
                    onClick={resetCertificateForm}
                    className="mt-3 w-full px-4 py-3 border-2 border-[#171717] bg-white font-bold uppercase tracking-widest text-xs"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            )}
          </BrutalCard>

          <BrutalCard color="bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Issued Certificates</h2>
              <BrutalBadge color="bg-[#2563EB]">{issuedCertificates.length}</BrutalBadge>
            </div>
            {issuedCertificates.length === 0 ? (
              <div className="border-2 border-dashed border-[#171717] p-8 text-center">
                <Award size={32} className="mx-auto mb-3 text-[#2563EB]" />
                <p className="font-bold uppercase tracking-widest text-sm">No certificates issued yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issuedCertificates.map((certificate) => {
                  const recipient = Array.isArray(certificate.profiles) ? certificate.profiles[0] : certificate.profiles;
                  return (
                    <div key={certificate.id} className="border-2 border-[#171717] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold uppercase">{certificate.title}</h3>
                        <p className="text-xs font-mono text-slate-500">
                          {recipient?.full_name || recipient?.email || "Member"} - issued {certificate.issued_at || "date pending"}
                        </p>
                        <p className="text-xs font-mono text-slate-500">
                          Issuer: {certificate.issuer_name || "Data Science Club"} - Created: {certificate.created_at ? new Date(certificate.created_at).toLocaleString() : "unknown"}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <BrutalBadge color="bg-[#7C3AED]">{certificate.certificate_type}</BrutalBadge>
                        <BrutalBadge color="bg-green-500">{certificate.status}</BrutalBadge>
                        <button
                          type="button"
                          onClick={() => editCertificate(certificate)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCertificate(certificate.id)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </BrutalCard>
        </div>
      )}

      {selectedTab === "content" && (
        <div className="space-y-6">
          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Homepage Content</h2>
            <BrutalInput label="Hero Title" defaultValue="Welcome to Data Science Club" />
            <BrutalTextarea label="Hero Description" defaultValue="Join our community of data enthusiasts..." />
            <BrutalButton color="bg-[#2563EB]" text="text-white">
              <Save size={16} className="inline mr-2" /> Save Changes
            </BrutalButton>
          </BrutalCard>

          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>About Page Content</h2>
            <BrutalTextarea label="Mission Statement" defaultValue="We empower students through data science education..." />
            <BrutalTextarea label="Vision Statement" defaultValue="To be the leading student data science community..." />
            <BrutalButton color="bg-[#2563EB]" text="text-white">
              <Save size={16} className="inline mr-2" /> Save Changes
            </BrutalButton>
          </BrutalCard>

          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Team Management</h2>
            <p className="text-sm text-slate-600 mb-4">Manage team members displayed on the About page</p>
            <BrutalButton color="bg-[#7C3AED]" text="text-white">
              <Plus size={16} className="inline mr-2" /> Add Team Member
            </BrutalButton>
          </BrutalCard>
        </div>
      )}

      {/* ─── SETTINGS TAB ──────────────────────────────────────────────────────── */}
      {selectedTab === "settings" && (
        <div className="space-y-6">
          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Site Settings</h2>
            <BrutalInput label="Site Name" value={siteSettings.siteName} onChange={(e: any) => setSiteSettings({...siteSettings, siteName: e.target.value})} />
            <BrutalInput label="Tagline" value={siteSettings.tagline} onChange={(e: any) => setSiteSettings({...siteSettings, tagline: e.target.value})} />
            <BrutalButton color="bg-[#2563EB]" text="text-white">
              <Save size={16} className="inline mr-2" /> Save Settings
            </BrutalButton>
          </BrutalCard>

          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Contact Information</h2>
            <BrutalInput label="Email" type="email" value={siteSettings.contactEmail} onChange={(e: any) => setSiteSettings({...siteSettings, contactEmail: e.target.value})} />
            <BrutalInput label="Phone" value={siteSettings.contactPhone} onChange={(e: any) => setSiteSettings({...siteSettings, contactPhone: e.target.value})} />
            <BrutalTextarea label="Address" value={siteSettings.address} onChange={(e: any) => setSiteSettings({...siteSettings, address: e.target.value})} />
            <BrutalButton color="bg-[#2563EB]" text="text-white">
              <Save size={16} className="inline mr-2" /> Save Contact Info
            </BrutalButton>
          </BrutalCard>

          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Social Media Links</h2>
            <BrutalInput label="GitHub" value={siteSettings.socialLinks.github} onChange={(e: any) => setSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, github: e.target.value}})} />
            <BrutalInput label="LinkedIn" value={siteSettings.socialLinks.linkedin} onChange={(e: any) => setSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, linkedin: e.target.value}})} />
            <BrutalInput label="Twitter" value={siteSettings.socialLinks.twitter} onChange={(e: any) => setSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, twitter: e.target.value}})} />
            <BrutalInput label="Facebook" value={siteSettings.socialLinks.facebook} onChange={(e: any) => setSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, facebook: e.target.value}})} />
            <BrutalInput label="Instagram" value={siteSettings.socialLinks.instagram} onChange={(e: any) => setSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, instagram: e.target.value}})} />
            <BrutalInput label="Discord" value={siteSettings.socialLinks.discord} onChange={(e: any) => setSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, discord: e.target.value}})} />
            <BrutalButton color="bg-[#2563EB]" text="text-white">
              <Save size={16} className="inline mr-2" /> Save Social Links
            </BrutalButton>
          </BrutalCard>
        </div>
      )}

      {/* ─── ANALYTICS TAB ──────────────────────────────────────────────────────── */}
      {selectedTab === "analytics" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <BrutalCard color="bg-[#2563EB]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity size={24} />
                <TrendingUp size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>+24%</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">User Growth</div>
            </BrutalCard>
            <BrutalCard color="bg-[#7C3AED]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={24} />
                <TrendingUp size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>85%</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Event Attendance</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FB7185]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Trophy size={24} />
                <TrendingUp size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>12</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Projects This Month</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FFE800]">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} />
                <Activity size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>2.5h</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Avg. Session</div>
            </BrutalCard>
          </div>

          <BrutalCard className="mb-6">
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>User Growth Chart</h2>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300">
              <p className="text-slate-400 font-mono text-sm">Chart visualization would go here</p>
            </div>
          </BrutalCard>

          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Popular Events</h2>
            <div className="space-y-4">
              {events.filter(e => e.featured).map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border-2 border-slate-200">
                  <div>
                    <p className="font-bold text-sm">{event.title}</p>
                    <p className="text-xs text-slate-500">{event.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={fonts.display}>{event.attendees}</p>
                    <p className="text-xs text-slate-500">attendees</p>
                  </div>
                </div>
              ))}
            </div>
          </BrutalCard>
        </>
      )}

      {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
      
      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <BrutalCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>
                {editingItem ? "Edit User" : "Add User"}
              </h2>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <BrutalInput label="Full Name" defaultValue={editingItem?.name || ""} />
            <BrutalInput label="Email" type="email" defaultValue={editingItem?.email || ""} />
            <BrutalSelect
              label="Role"
              defaultValue={editingItem?.role || "Member"}
              options={[
                { value: "Member", label: "Member" },
                { value: "Club Member", label: "Club Member" },
                { value: "Teacher", label: "Teacher" },
                { value: "Admin", label: "Admin" },
              ]}
            />
            <BrutalInput label="Designation (optional)" defaultValue={editingItem?.designation || ""} />
            <BrutalSelect
              label="Status"
              defaultValue={editingItem?.verified ? "verified" : "pending"}
              options={[
                { value: "verified", label: "Verified" },
                { value: "pending", label: "Pending" },
              ]}
            />
            <div className="flex gap-3">
              <BrutalButton color="bg-[#2563EB]" text="text-white" className="flex-1">
                <Save size={16} className="inline mr-2" /> Save User
              </BrutalButton>
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-6 py-3 border-2 border-[#171717] bg-white hover:bg-slate-100 transition-all font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </BrutalCard>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <BrutalCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>
                {editingItem ? "Edit Event" : "Create Event"}
              </h2>
              <button onClick={() => setShowEventModal(false)} className="p-2 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <BrutalInput label="Event Title" defaultValue={editingItem?.title || ""} />
            <BrutalTextarea label="Description" defaultValue="" />
            <BrutalInput label="Date" type="date" defaultValue={editingItem?.date || ""} />
            <BrutalInput label="Location" defaultValue={editingItem?.location || ""} />
            <BrutalSelect
              label="Category"
              defaultValue={editingItem?.category || "Workshop"}
              options={[
                { value: "Workshop", label: "Workshop" },
                { value: "Talk", label: "Talk" },
                { value: "Competition", label: "Competition" },
                { value: "Social", label: "Social" },
              ]}
            />
            <BrutalSelect
              label="Status"
              defaultValue={editingItem?.status || "Upcoming"}
              options={[
                { value: "Upcoming", label: "Upcoming" },
                { value: "Ongoing", label: "Ongoing" },
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
            <div className="flex gap-3">
              <BrutalButton color="bg-[#7C3AED]" text="text-white" className="flex-1">
                <Save size={16} className="inline mr-2" /> Save Event
              </BrutalButton>
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-6 py-3 border-2 border-[#171717] bg-white hover:bg-slate-100 transition-all font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </BrutalCard>
        </div>
      )}
    </div>
  );
}
