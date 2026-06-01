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
import { useNavigate, useParams } from "react-router-dom";
import { 
  Check, Shield, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff, 
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  deleteCertificate as deleteCertificateRecord,
  getCertificatesByEvent,
  issueCheckedInBulk,
  issueSingleCertificate,
  revokeCertificate,
  updateCertificate,
  uploadSignatureImage,
} from "../services/certificateService";
import { CertificateRenderer } from "./components/CertificateRenderer";

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

const defaultSiteSettings = {
  siteName: "Data Science Club - SMS TU",
  tagline: "Empowering Students Through Data",
  contactEmail: "contact@datascienceclub.sms.tu.edu.np",
  contactPhone: "+977-1-4331976",
  address: "School of Mathematical Sciences, SMS, TU, Kathmandu, Nepal",
  socialLinks: {
    github: "https://github.com/datascienceclub",
    linkedin: "https://linkedin.com/company/datascienceclub",
    twitter: "https://twitter.com/datascienceclub",
    facebook: "https://facebook.com/datascienceclub",
    instagram: "https://instagram.com/datascienceclub",
    discord: "https://discord.gg/datascienceclub",
  },
};

const createCertificateCode = () => {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 12).toUpperCase();
};

const isCertificateSchemaError = (message = "") =>
  ["verification_code", "recipient_name_snapshot", "event_title_snapshot", "template_style", "revoked_at", "signature_data"].some((field) =>
    message.includes(field)
  );

const formatCertificateError = (message: string) =>
  isCertificateSchemaError(message)
    ? "Certificate verification is not installed in Supabase yet. Run the latest certificate migration, then try again."
    : message.toLowerCase().includes("row-level security")
      ? "Certificate issuing is blocked by Supabase permissions. Run the latest certificate event-manager policy migration, then try again."
    : message;

const certificateTemplateOptions = [
  { value: "modern", label: "Modern", accent: "bg-[#2563EB]", surface: "bg-[#F4EFEB]", text: "text-[#171717]" },
  { value: "classic", label: "Classic", accent: "bg-[#FFE800]", surface: "bg-white", text: "text-[#171717]" },
];

const certificateCredentialSelect = "id,member_id,event_id,certificate_title,certificate_type,issuer_name,issued_date,status,verification_code,recipient_name_snapshot,event_title_snapshot,template,signature_data,external_pdf_url,description,created_at,profiles:member_id(full_name,email),events:event_id(title)";
const certificateLegacySelect = "id,recipient_id,event_id,title,certificate_type,issuer_name,issued_at,status,certificate_url,description,created_at,profiles:recipient_id(full_name,email),events:event_id(title)";

export function ComprehensiveAdminPanel() {
  const navigate = useNavigate();
  const { adminTab } = useParams();
  const [selectedTab, setSelectedTab] = useState(adminTab || "overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isCertificateAdmin, setIsCertificateAdmin] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState("");
  const [profileOptions, setProfileOptions] = useState<any[]>([]);
  const [designationOptions, setDesignationOptions] = useState<any[]>([]);
  const [newDesignationLabel, setNewDesignationLabel] = useState("");
  const [issuedCertificates, setIssuedCertificates] = useState<any[]>([]);
  const [certificateForm, setCertificateForm] = useState({
    recipientId: "",
    eventId: "",
    title: "",
    certificateType: "Workshop",
    issuerName: "Data Science Club",
    issuedAt: "",
    certificateUrl: "",
    templateStyle: "modern",
    eventTitleSnapshot: "",
    recipientNameSnapshot: "",
    description: "For actively participating in this program and demonstrating commitment and enthusiasm.",
    signatures: [
      { name: "INSTRUCTOR_NAME", title: "INSTRUCTOR", signature_image_url: "" },
      { name: "DIRECTOR_NAME", title: "DIRECTOR", signature_image_url: "" },
      { name: "CLUB_PRESIDENT_NAME", title: "PRESIDENT", signature_image_url: "" },
    ],
  });
  const [editingCertificateId, setEditingCertificateId] = useState("");
  const [issuingBulkCertificates, setIssuingBulkCertificates] = useState(false);
  const [adminStatus, setAdminStatus] = useState("");
  const [eventProposals, setEventProposals] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [gallerySubmissions, setGallerySubmissions] = useState<any[]>([]);
  const [partnerSubmissions, setPartnerSubmissions] = useState<any[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<any[]>([]);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "General",
    description: "",
    resourceUrl: "",
  });
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    websiteUrl: "",
    logoUrl: "",
    category: "",
    description: "",
    status: "published",
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    eventType: "WORKSHOP",
    description: "",
    shortDescription: "",
    startTime: "",
    endTime: "",
    venue: "",
    capacity: "40",
    status: "approved",
    registrationOpen: true,
    coordinatorEmails: "",
  });
  const [projectForm, setProjectForm] = useState({
    title: "",
    category: "Machine Learning",
    team: "",
    technologies: "",
    summary: "",
    content: "",
    thumbnailUrl: "",
    status: "submitted",
  });
  const [blogForm, setBlogForm] = useState({
    title: "",
    summary: "",
    tags: "",
    content: "",
    coverImageUrl: "",
    status: "draft",
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editingBlogId, setEditingBlogId] = useState("");
  const [editingPartnerId, setEditingPartnerId] = useState("");
  const [reviewPreview, setReviewPreview] = useState<any>(null);
  const [certificateModal, setCertificateModal] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);

  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);
  const [settingsStatus, setSettingsStatus] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

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
  const adminOnlyTabs = ["users", "gallery", "partners", "resources", "settings", "analytics"];
  const isFullAdmin = adminProfile?.role === "admin";
  const visibleTabs = isFullAdmin ? tabs : tabs.filter((tab) => !adminOnlyTabs.includes(tab.id));
  const openAdminTab = (tabId: string, replace = false) => {
    setSelectedTab(tabId);
    navigate(tabId === "overview" ? "/admin" : `/admin/${tabId}`, { replace });
  };

  useEffect(() => {
    const nextTab = adminTab || "overview";
    if (tabs.some((tab) => tab.id === nextTab)) {
      setSelectedTab(nextTab);
    } else {
      openAdminTab("overview", true);
    }
  }, [adminTab]);

  useEffect(() => {
    if (!adminProfile) return;
    if (!visibleTabs.some((tab) => tab.id === selectedTab)) {
      openAdminTab("overview", true);
    }
  }, [adminProfile, selectedTab, visibleTabs]);

  useEffect(() => {
    let mounted = true;

    async function loadAdminData() {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id,role,email")
        .eq("id", userData.user.id)
        .maybeSingle();

      setAdminProfile(myProfile);
      const isAdmin = myProfile?.role === "admin";
      const isOrganizer = myProfile?.role === "organizer";
      const canManage = isAdmin || isOrganizer;
      setIsCertificateAdmin(canManage);
      if (!canManage) return;

      let projectQuery = supabase
        .from("projects")
        .select("id,title,category,team,technologies,summary,content,thumbnail_url,status,submitted_at,published_at,author_id,profiles:author_id(full_name,email)")
        .order("submitted_at", { ascending: false });
      let blogQuery = supabase
        .from("blog_posts")
        .select("id,title,summary,tags,content,cover_image_url,status,published_at,author_id,profiles:author_id(full_name,email)")
        .order("published_at", { ascending: false });
      let eventQuery = supabase
        .from("events")
        .select("id,title,event_type,start_time,end_time,venue,capacity,status,registration_open,created_by,created_at")
        .order("start_time", { ascending: false, nullsFirst: false });

      if (!isAdmin && isOrganizer) {
        projectQuery = projectQuery.eq("author_id", userData.user.id);
        blogQuery = blogQuery.eq("author_id", userData.user.id);
        eventQuery = eventQuery.eq("created_by", userData.user.id);
      }

      const [{ data: profiles }, { data: certs, error: certsError }, { data: projectRows }, { data: proposalRows }, { data: eventRows }, { data: designationRows }, { data: blogRows }, { data: galleryRows }, { data: partnerRows }, { data: resourceRows }, { data: registrationRows }, { data: settingsRow }] = await Promise.all([
        isAdmin
          ? supabase
              .from("profiles")
              .select("id,full_name,email,role,membership_status,designation,designation_status,batch_year,created_at")
              .order("full_name", { ascending: true })
          : supabase
              .from("profiles")
              .select("id,full_name,email,role,membership_status,designation,designation_status,batch_year,created_at")
              .eq("id", userData.user.id),
        supabase
          .from("certificates")
          .select(certificateCredentialSelect)
          .order("created_at", { ascending: false }),
        projectQuery,
        supabase
          .from("event_proposals")
          .select("id,proposed_by,title,event_type,proposed_date,venue,capacity,host,summary,coordinator_emails,status,submitted_at,profiles:proposed_by(full_name,email)")
          .order("submitted_at", { ascending: false }),
        eventQuery,
        supabase
          .from("designation_options")
          .select("id,label,is_active,sort_order")
          .order("sort_order", { ascending: true })
          .order("label", { ascending: true }),
        blogQuery,
        supabase
          .from("gallery_submissions")
          .select("id,title,image_url,event_name,status,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("partner_submissions")
          .select("id,name,website_url,logo_url,category,description,status,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("learning_materials")
          .select("id,title,description,resource_url,category,status,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("event_registrations")
          .select("id,event_id,user_id,status,registered_at,checked_in_at,profiles:user_id(id,full_name,email)"),
        supabase
          .from("site_settings")
          .select("value")
          .eq("key", "site")
          .maybeSingle(),
      ]);

      if (!mounted) return;
      let certificateRows = certs || [];
      if (certsError) {
        setCertificateStatus(formatCertificateError(certsError.message));
        const { data: legacyCerts } = await supabase
          .from("certificates")
          .select(certificateLegacySelect)
          .order("created_at", { ascending: false });
        if (!mounted) return;
        certificateRows = legacyCerts || [];
      }
      const mappedProfiles = (profiles || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || profile.email || "Member",
        email: profile.email,
        role: profile.role,
        membershipStatus: profile.membership_status,
        designationStatus: profile.designation_status,
        verified: profile.membership_status === "approved" || profile.role === "member" || profile.role === "organizer" || profile.role === "admin",
        designation: profile.designation || "",
        createdAt: profile.created_at,
        joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "",
      }));
      setUsers(mappedProfiles);
      setProfileOptions(profiles || []);
      setDesignationOptions(designationRows || []);
      setIssuedCertificates(certificateRows);
      setProjects((projectRows || []).map((project) => {
        const author = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;
        return {
          ...project,
          author: author?.full_name || author?.email || "Member",
          submittedDate: project.submitted_at ? new Date(project.submitted_at).toLocaleDateString() : "",
          tags: project.technologies || [],
        };
      }));
      setBlogPosts((blogRows || []).map((post) => {
        const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        return {
          ...post,
          author: author?.full_name || author?.email || "Member",
          tags: post.tags || [],
          publishedDate: post.published_at ? new Date(post.published_at).toLocaleDateString() : "",
        };
      }));
      setGallerySubmissions(galleryRows || []);
      setPartnerSubmissions(partnerRows || []);
      setLearningMaterials(resourceRows || []);
      setEventRegistrations(registrationRows || []);
      if (settingsRow?.value) {
        const savedSettings = settingsRow.value as typeof defaultSiteSettings;
        setSiteSettings({
          ...defaultSiteSettings,
          ...savedSettings,
          socialLinks: {
            ...defaultSiteSettings.socialLinks,
            ...(savedSettings.socialLinks || {}),
          },
        });
      }
      setEventProposals((proposalRows || []).map((proposal) => {
        const author = Array.isArray(proposal.profiles) ? proposal.profiles[0] : proposal.profiles;
        return {
          ...proposal,
          proposer: author?.full_name || author?.email || "Member",
          submittedDate: proposal.submitted_at ? new Date(proposal.submitted_at).toLocaleDateString() : "",
        };
      }));
      setEvents((eventRows || []).map((event) => {
        const eventRegistrations = (registrationRows || []).filter((registration) => registration.event_id === event.id);
        return {
          ...event,
          date: event.start_time ? new Date(event.start_time).toLocaleDateString() : "Not scheduled",
          location: event.venue || "TBA",
          category: event.event_type,
          attendees: eventRegistrations.filter((registration) => registration.status === "registered" || registration.status === "checked_in").length,
          checkedIn: eventRegistrations.filter((registration) => registration.status === "checked_in" || registration.checked_in_at).length,
          featured: event.status === "published" || event.status === "approved",
        };
      }));
    }

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, []);

  const saveSiteSettings = async () => {
    setSettingsStatus("");
    if (!isSupabaseConfigured || !supabase) {
      setSettingsStatus("Settings cannot be saved until Supabase is configured.");
      return;
    }

    setSavingSettings(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "site",
        value: siteSettings,
        updated_by: userData.user?.id || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });

    setSavingSettings(false);
    setSettingsStatus(error ? error.message : "Settings saved.");
  };

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
      eventId: "",
      title: "",
      certificateType: "Workshop",
      issuerName: "Data Science Club",
      issuedAt: "",
      certificateUrl: "",
      templateStyle: "modern",
      eventTitleSnapshot: "",
      recipientNameSnapshot: "",
      description: "For actively participating in this program and demonstrating commitment and enthusiasm.",
      signatures: [
        { name: "INSTRUCTOR_NAME", title: "INSTRUCTOR", signature_image_url: "" },
        { name: "DIRECTOR_NAME", title: "DIRECTOR", signature_image_url: "" },
        { name: "CLUB_PRESIDENT_NAME", title: "PRESIDENT", signature_image_url: "" },
      ],
    });
  };

  const refreshCertificateRegistry = async (eventId = certificateForm.eventId) => {
    if (!eventId) return;
    try {
      const rows = await getCertificatesByEvent(eventId);
      setIssuedCertificates(rows);
    } catch (error: any) {
      setCertificateStatus(error.message || "Could not load certificates for this event.");
    }
  };

  const applyCertificateEvent = (eventId: string) => {
    const selectedEvent = events.find((event) => event.id === eventId);
    const eventCertificateType = selectedEvent?.category === "COMPETITION"
      ? "Competition"
      : selectedEvent?.category === "SEMINAR"
        ? "Participation"
        : "Workshop";
    setCertificateForm({
      ...certificateForm,
      eventId,
      title: selectedEvent && !editingCertificateId
        ? `${selectedEvent.title} Certificate of Participation`
        : certificateForm.title,
      certificateType: selectedEvent ? eventCertificateType : certificateForm.certificateType,
      templateStyle: selectedEvent?.category === "SEMINAR" ? "classic" : "modern",
      issuedAt: certificateForm.issuedAt || new Date().toISOString().slice(0, 10),
      eventTitleSnapshot: selectedEvent?.title || certificateForm.eventTitleSnapshot,
    });
    if (eventId) {
      void refreshCertificateRegistry(eventId);
    }
  };

  const updateCertificateSignature = (index: number, field: "name" | "title" | "signature_image_url", value: string) => {
    setCertificateForm({
      ...certificateForm,
      signatures: certificateForm.signatures.map((signature, signatureIndex) =>
        signatureIndex === index ? { ...signature, [field]: value } : signature
      ),
    });
  };

  const addCertificateSignature = () => {
    if (certificateForm.signatures.length >= 3) {
      setCertificateStatus("You can add up to 3 signature blocks.");
      return;
    }
    setCertificateForm({
      ...certificateForm,
      signatures: [...certificateForm.signatures, { name: "", title: "", signature_image_url: "" }],
    });
  };

  const removeCertificateSignature = (index: number) => {
    setCertificateForm({
      ...certificateForm,
      signatures: certificateForm.signatures.filter((_, signatureIndex) => signatureIndex !== index),
    });
  };

  const uploadCertificateSignature = async (index: number, file?: File) => {
    if (!file) return;
    try {
      setCertificateStatus("Uploading signature...");
      const publicUrl = await uploadSignatureImage(file);
      updateCertificateSignature(index, "signature_image_url", publicUrl);
      setCertificateStatus("Signature uploaded.");
    } catch (error: any) {
      setCertificateStatus(error.message || "Could not upload signature.");
    }
  };

  const resetEventForm = () => {
    setEditingItem(null);
    setEventForm({
      title: "",
      eventType: "WORKSHOP",
      description: "",
      shortDescription: "",
      startTime: "",
      endTime: "",
      venue: "",
      capacity: "40",
      status: "approved",
      registrationOpen: true,
      coordinatorEmails: "",
    });
  };

  const resetProjectForm = () => {
    setEditingProjectId("");
    setProjectForm({
      title: "",
      category: "Machine Learning",
      team: "",
      technologies: "",
      summary: "",
      content: "",
      thumbnailUrl: "",
      status: "submitted",
    });
  };

  const resetBlogForm = () => {
    setEditingBlogId("");
    setBlogForm({
      title: "",
      summary: "",
      tags: "",
      content: "",
      coverImageUrl: "",
      status: "draft",
    });
  };

  const openEventModal = async (event?: any) => {
    setAdminStatus("");
    setEditingItem(event || null);
    setEventForm({
      title: event?.title || "",
      eventType: event?.event_type || event?.category || "WORKSHOP",
      description: event?.description || "",
      shortDescription: event?.short_description || "",
      startTime: event?.start_time ? event.start_time.slice(0, 16) : "",
      endTime: event?.end_time ? event.end_time.slice(0, 16) : "",
      venue: event?.venue || event?.location || "",
      capacity: event?.capacity ? String(event.capacity) : "40",
      status: event?.status || "approved",
      registrationOpen: event?.registration_open ?? true,
      coordinatorEmails: "",
    });

    if (event?.id && isSupabaseConfigured && supabase) {
      const { data } = await supabase.from("event_staff").select("email").eq("event_id", event.id);
      setEventForm((current) => ({
        ...current,
        coordinatorEmails: (data || []).map((staff) => staff.email).join(", "),
      }));
    }
    setShowEventModal(true);
  };

  const saveEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setShowEventModal(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const slug = `${eventForm.title}-${editingItem?.id || Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const payload = {
      title: eventForm.title,
      slug,
      event_type: eventForm.eventType,
      description: eventForm.description,
      short_description: eventForm.shortDescription || eventForm.description.slice(0, 160),
      start_time: eventForm.startTime ? new Date(eventForm.startTime).toISOString() : null,
      end_time: eventForm.endTime ? new Date(eventForm.endTime).toISOString() : null,
      venue: eventForm.venue,
      capacity: Number(eventForm.capacity) || 40,
      status: eventForm.status,
      registration_open: eventForm.registrationOpen,
      created_by: editingItem?.created_by || userData.user?.id || null,
    };

    const { data: savedEvent, error } = editingItem?.id
      ? await supabase.from("events").update(payload).eq("id", editingItem.id).select("id,title,event_type,start_time,end_time,venue,capacity,status,registration_open,created_by,created_at").single()
      : await supabase.from("events").insert(payload).select("id,title,event_type,start_time,end_time,venue,capacity,status,registration_open,created_by,created_at").single();

    if (error) {
      setAdminStatus(error.message);
      return;
    }

    const coordinatorEmails = eventForm.coordinatorEmails
      .split(/[,\n]/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (coordinatorEmails.length) {
      await supabase.from("event_staff").upsert(
        coordinatorEmails.map((email) => ({
          event_id: savedEvent.id,
          email,
          staff_role: "coordinator",
          can_scan: true,
          created_by: userData.user?.id || null,
        })),
        { onConflict: "event_id,email" }
      );
    }

    const mapped = {
      ...savedEvent,
      date: savedEvent.start_time ? new Date(savedEvent.start_time).toLocaleDateString() : "Not scheduled",
      location: savedEvent.venue || "TBA",
      category: savedEvent.event_type,
      attendees: 0,
      featured: savedEvent.status === "published",
    };
    setEvents(editingItem?.id ? events.map((row) => row.id === savedEvent.id ? mapped : row) : [mapped, ...events]);
    setAdminStatus(editingItem?.id ? "Event updated." : "Event created.");
    resetEventForm();
    setShowEventModal(false);
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

  const updateEventStatus = async (id: string, status: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from("events").update({ status }).eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setEvents(events.map((event) => event.id === id ? { ...event, status, featured: status === "published" } : event));
    setAdminStatus(status === "archived" ? "Event archived." : "Event restored.");
  };

  const toggleEventRegistration = async (event: any) => {
    if (!isSupabaseConfigured || !supabase) return;
    const next = !event.registration_open;
    const { error } = await supabase.from("events").update({ registration_open: next }).eq("id", event.id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setEvents(events.map((row) => row.id === event.id ? { ...row, registration_open: next } : row));
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

  const openProjectModal = (project: any) => {
    setAdminStatus("");
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title || "",
      category: project.category || "Machine Learning",
      team: project.team || "",
      technologies: (project.technologies || project.tags || []).join(", "),
      summary: project.summary || "",
      content: project.content || "",
      thumbnailUrl: project.thumbnail_url || "",
      status: project.status || "submitted",
    });
    setShowProjectModal(true);
  };

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProjectId || !isSupabaseConfigured || !supabase) return;
    const technologies = projectForm.technologies
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const payload = {
      title: projectForm.title,
      category: projectForm.category,
      team: projectForm.team || null,
      technologies,
      summary: projectForm.summary,
      content: projectForm.content,
      thumbnail_url: projectForm.thumbnailUrl || null,
      status: projectForm.status,
      published_at: projectForm.status === "published" ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", editingProjectId)
      .select("id,title,category,team,technologies,summary,content,thumbnail_url,status,submitted_at,published_at,author_id,profiles:author_id(full_name,email)")
      .single();
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    const author = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    const mapped = {
      ...data,
      author: author?.full_name || author?.email || "Member",
      submittedDate: data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : "",
      tags: data.technologies || [],
    };
    setProjects(projects.map((project) => project.id === editingProjectId ? mapped : project));
    resetProjectForm();
    setShowProjectModal(false);
    setAdminStatus("Project updated.");
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
    if (proposal.status !== "pending") {
      setAdminStatus("This proposal has already been reviewed.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const proposedStart = proposal.proposed_date ? new Date(proposal.proposed_date).toISOString() : null;
    const duplicateQuery = supabase
      .from("events")
      .select("id")
      .eq("title", proposal.title)
      .maybeSingle();
    const { data: existingEvent } = proposedStart
      ? await duplicateQuery.eq("start_time", proposedStart)
      : await duplicateQuery.is("start_time", null);
    if (existingEvent?.id) {
      await updateProposalStatus(proposal.id, "approved");
      setAdminStatus("Proposal was already created as an event. Marked approved.");
      return;
    }
    const slug = `${proposal.title}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data: eventRow, error } = await supabase.from("events").insert({
      title: proposal.title,
      slug,
      event_type: proposal.event_type,
      short_description: proposal.summary.slice(0, 160),
      description: proposal.summary,
      start_time: proposedStart,
      venue: proposal.venue,
      capacity: proposal.capacity || 40,
      status: "approved",
      created_by: proposal.proposed_by || userData.user?.id || null,
    }).select("id").single();
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    const proposer = Array.isArray(proposal.profiles) ? proposal.profiles[0] : proposal.profiles;
    const staffRows = [
      proposal.proposed_by || proposer?.email
        ? {
            event_id: eventRow.id,
            user_id: proposal.proposed_by || null,
            email: proposer?.email || adminProfile?.email || "",
            staff_role: "organizer",
            can_scan: true,
            created_by: userData.user?.id || null,
          }
        : null,
      ...(proposal.coordinator_emails || []).map((email: string) => ({
        event_id: eventRow.id,
        user_id: null,
        email,
        staff_role: "coordinator",
        can_scan: true,
        created_by: userData.user?.id || null,
      })),
    ].filter((row: any) => row?.email);
    if (staffRows.length) {
      await supabase.from("event_staff").upsert(staffRows, { onConflict: "event_id,email" });
    }
    await updateProposalStatus(proposal.id, "approved");
    const { data: createdEvent } = await supabase
      .from("events")
      .select("id,title,event_type,start_time,end_time,venue,capacity,status,registration_open,created_by,created_at")
      .eq("id", eventRow.id)
      .single();
    if (createdEvent) {
      setEvents([{
        ...createdEvent,
        date: createdEvent.start_time ? new Date(createdEvent.start_time).toLocaleDateString() : "Not scheduled",
        location: createdEvent.venue || "TBA",
        category: createdEvent.event_type,
        attendees: 0,
        featured: createdEvent.status === "published",
      }, ...events]);
    }
    setAdminStatus("Event created from proposal.");
  };

  const updateBlogStatus = async (id: string, status: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from("blog_posts").update({ status }).eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setBlogPosts(blogPosts.map((post) => post.id === id ? { ...post, status } : post));
  };

  const openBlogModal = (post?: any) => {
    setAdminStatus("");
    setEditingBlogId(post?.id || "");
    setBlogForm({
      title: post?.title || "",
      summary: post?.summary || "",
      tags: (post?.tags || []).join(", "),
      content: post?.content || "",
      coverImageUrl: post?.cover_image_url || "",
      status: post?.status || "published",
    });
    setShowBlogModal(true);
  };

  const saveBlogPost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    const tags = blogForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const payload = {
      title: blogForm.title,
      summary: blogForm.summary,
      tags,
      content: blogForm.content,
      cover_image_url: blogForm.coverImageUrl || null,
      status: blogForm.status,
      published_at: blogForm.status === "published" ? new Date().toISOString() : new Date().toISOString(),
    };
    const { data, error } = editingBlogId
      ? await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingBlogId)
          .select("id,title,summary,tags,content,cover_image_url,status,published_at,author_id,profiles:author_id(full_name,email)")
          .single()
      : await supabase
          .from("blog_posts")
          .insert({ ...payload, author_id: userData.user?.id || null })
          .select("id,title,summary,tags,content,cover_image_url,status,published_at,author_id,profiles:author_id(full_name,email)")
          .single();
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    const author = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    const mapped = {
      ...data,
      author: author?.full_name || author?.email || "Member",
      tags: data.tags || [],
      publishedDate: data.published_at ? new Date(data.published_at).toLocaleDateString() : "",
    };
    setBlogPosts(editingBlogId ? blogPosts.map((post) => post.id === editingBlogId ? mapped : post) : [mapped, ...blogPosts]);
    resetBlogForm();
    setShowBlogModal(false);
    setAdminStatus(editingBlogId ? "Blog post updated." : "Blog post created.");
  };

  const updateSubmissionStatus = async (table: "gallery_submissions" | "partner_submissions", id: string, status: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from(table)
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: userData.user?.id || null })
      .eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    if (table === "gallery_submissions") {
      setGallerySubmissions(gallerySubmissions.map((item) => item.id === id ? { ...item, status } : item));
    } else {
      setPartnerSubmissions(partnerSubmissions.map((item) => item.id === id ? { ...item, status } : item));
    }
  };

  const resetPartnerForm = () => {
    setEditingPartnerId("");
    setPartnerForm({
      name: "",
      websiteUrl: "",
      logoUrl: "",
      category: "",
      description: "",
      status: "published",
    });
  };

  const openPartnerModal = (partner?: any) => {
    setAdminStatus("");
    setEditingPartnerId(partner?.id || "");
    setPartnerForm({
      name: partner?.name || "",
      websiteUrl: partner?.website_url || "",
      logoUrl: partner?.logo_url || "",
      category: partner?.category || "",
      description: partner?.description || "",
      status: partner?.status || "published",
    });
    setShowPartnerModal(true);
  };

  const savePartner = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    const payload = {
      name: partnerForm.name.trim(),
      website_url: partnerForm.websiteUrl.trim() || null,
      logo_url: partnerForm.logoUrl.trim() || null,
      category: partnerForm.category.trim() || "Partner",
      description: partnerForm.description.trim(),
      status: partnerForm.status,
      submitted_by: userData.user?.id || null,
      reviewed_by: userData.user?.id || null,
      reviewed_at: new Date().toISOString(),
    };
    const { data, error } = editingPartnerId
      ? await supabase.from("partner_submissions").update(payload).eq("id", editingPartnerId).select("id,name,website_url,logo_url,category,description,status,created_at").single()
      : await supabase.from("partner_submissions").insert(payload).select("id,name,website_url,logo_url,category,description,status,created_at").single();
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setPartnerSubmissions(editingPartnerId
      ? partnerSubmissions.map((partner) => partner.id === editingPartnerId ? data : partner)
      : [data, ...partnerSubmissions]);
    resetPartnerForm();
    setShowPartnerModal(false);
    setAdminStatus(editingPartnerId ? "Partner updated." : "Partner added.");
  };

  const deletePartner = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!window.confirm("Delete this partner?")) return;
    const { error } = await supabase.from("partner_submissions").delete().eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setPartnerSubmissions(partnerSubmissions.filter((partner) => partner.id !== id));
    setAdminStatus("Partner deleted.");
  };

  const openReviewPreview = (title: string, rows: Array<{ label: string; value: any }>, imageUrl?: string, preview?: any) => {
    setReviewPreview({
      title,
      imageUrl,
      preview,
      rows: rows.map((row) => ({
        label: row.label,
        value: Array.isArray(row.value) ? row.value.join(", ") : (row.value || "Not provided"),
      })),
    });
  };

  const addLearningMaterial = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("learning_materials")
      .insert({
        title: resourceForm.title,
        category: resourceForm.category,
        description: resourceForm.description,
        resource_url: resourceForm.resourceUrl,
        status: "published",
        created_by: userData.user?.id || null,
      })
      .select("id,title,description,resource_url,category,status,created_at")
      .single();
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setLearningMaterials([data, ...learningMaterials]);
    setResourceForm({ title: "", category: "General", description: "", resourceUrl: "" });
    setAdminStatus("Learning material published.");
  };

  const deleteLearningMaterial = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!window.confirm("Delete this learning material?")) return;
    const { error } = await supabase.from("learning_materials").delete().eq("id", id);
    if (error) {
      setAdminStatus(error.message);
      return;
    }
    setLearningMaterials(learningMaterials.filter((material) => material.id !== id));
  };

  const handleIssueCertificate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCertificateStatus("");

    if (!certificateForm.eventId) {
      setCertificateStatus("Select an event before issuing a certificate.");
      return;
    }
    if (!certificateForm.recipientId && !editingCertificateId) {
      setCertificateStatus("Select a checked-in attendee before issuing a certificate.");
      return;
    }
    if (!certificateForm.title.trim() || !certificateForm.issuerName.trim()) {
      setCertificateStatus("Certificate title and issuer are required.");
      return;
    }
    if (!certificateForm.issuedAt) {
      setCertificateStatus("Issued date is required.");
      return;
    }

    const selectedRegistration = eventRegistrations.find((registration) =>
      registration.event_id === certificateForm.eventId &&
      registration.user_id === certificateForm.recipientId
    );
    if (!editingCertificateId && !selectedRegistration) {
      setCertificateStatus("This member is not registered for the selected event.");
      return;
    }
    if (!editingCertificateId && !(selectedRegistration?.status === "checked_in" || selectedRegistration?.checked_in_at)) {
      setCertificateStatus("Only checked-in attendees can receive event certificates.");
      return;
    }

    const signatureData = certificateForm.signatures
      .map((signature) => ({
        name: signature.name.trim(),
        title: signature.title.trim(),
        signature_image_url: signature.signature_image_url || "",
      }))
      .filter((signature) => signature.name || signature.title);

    try {
      if (editingCertificateId) {
        await updateCertificate(editingCertificateId, {
          certificate_title: certificateForm.title,
          certificate_type: certificateForm.certificateType,
          template: certificateForm.templateStyle,
          description: certificateForm.description,
          issuer_name: certificateForm.issuerName,
          issued_date: certificateForm.issuedAt,
          external_pdf_url: certificateForm.certificateUrl || null,
          signature_data: signatureData,
          event_title_snapshot: certificateForm.eventTitleSnapshot.trim() || undefined,
          recipient_name_snapshot: certificateForm.recipientNameSnapshot.trim() || undefined,
        });
        setCertificateStatus("Certificate updated.");
      } else {
        await issueSingleCertificate({
          member_id: certificateForm.recipientId,
          event_id: certificateForm.eventId,
          certificate_title: certificateForm.title,
          certificate_type: certificateForm.certificateType,
          template: certificateForm.templateStyle,
          description: certificateForm.description,
          issuer_name: certificateForm.issuerName,
          issued_date: certificateForm.issuedAt,
          external_pdf_url: certificateForm.certificateUrl || null,
          signature_data: signatureData,
          event_title_snapshot: certificateForm.eventTitleSnapshot.trim() || undefined,
          recipient_name_snapshot: certificateForm.recipientNameSnapshot.trim() || undefined,
        });
        setCertificateStatus("Certificate issued.");
      }

      const refreshed = await getCertificatesByEvent(certificateForm.eventId);
      setIssuedCertificates(refreshed);
      resetCertificateForm();
    } catch (error: any) {
      setCertificateStatus(formatCertificateError(error.message || "Could not issue certificate."));
    }
  };

  const issueEventCertificates = async () => {
    setCertificateStatus("");
    if (!certificateForm.eventId) {
      setCertificateStatus("Select an event before issuing bulk certificates.");
      return;
    }
    if (!certificateForm.title.trim() || !certificateForm.issuerName.trim()) {
      setCertificateStatus("Certificate title and issuer are required.");
      return;
    }
    if (!certificateForm.issuedAt) {
      setCertificateStatus("Issued date is required.");
      return;
    }

    const attendeesForEvent = eventRegistrations.filter((registration) =>
      registration.event_id === certificateForm.eventId &&
      (registration.status === "checked_in" || registration.checked_in_at)
    );
    if (!attendeesForEvent.length) {
      setCertificateStatus("No checked-in attendees found for this event.");
      return;
    }

    if (!window.confirm(`Issue certificates to ${eligibleCertificateAttendees.length} checked-in attendee${eligibleCertificateAttendees.length === 1 ? "" : "s"}?`)) {
      return;
    }

    setIssuingBulkCertificates(true);
    const signatureData = certificateForm.signatures
      .map((signature) => ({
        name: signature.name.trim(),
        title: signature.title.trim(),
        signature_image_url: signature.signature_image_url || "",
      }))
      .filter((signature) => signature.name || signature.title);

    try {
      const summary = await issueCheckedInBulk(certificateForm.eventId, {
        certificate_title: certificateForm.title,
        certificate_type: certificateForm.certificateType,
        template: certificateForm.templateStyle,
        description: certificateForm.description,
        issuer_name: certificateForm.issuerName,
        issued_date: certificateForm.issuedAt,
        external_pdf_url: certificateForm.certificateUrl || null,
        signature_data: signatureData,
      });
      const refreshed = await getCertificatesByEvent(certificateForm.eventId);
      setIssuedCertificates(refreshed);
      const failedDetails = summary.failed.length
        ? ` Failed: ${summary.failed.map((failure) => formatCertificateError(failure)).join("; ")}`
        : "";
      setCertificateStatus(`${summary.success.length} issued, ${summary.skipped.length} skipped (duplicates), ${summary.failed.length} failed.${failedDetails}`);
    } catch (error: any) {
      setCertificateStatus(formatCertificateError(error.message || "Could not issue bulk certificates."));
    } finally {
      setIssuingBulkCertificates(false);
    }
  };

  const editCertificate = (certificate: any) => {
    setEditingCertificateId(certificate.id);
    setCertificateForm({
      recipientId: certificate.member_id || certificate.recipient_id || "",
      eventId: certificate.event_id || "",
      title: certificate.certificate_title || certificate.title || "",
      certificateType: certificate.certificate_type || "Workshop",
      issuerName: certificate.issuer_name || "Data Science Club",
      issuedAt: certificate.issued_date || certificate.issued_at || "",
      certificateUrl: certificate.external_pdf_url || certificate.certificate_url || "",
      templateStyle: certificate.template || certificate.template_style || "modern",
      eventTitleSnapshot: certificate.event_title_snapshot || (Array.isArray(certificate.events) ? certificate.events[0]?.title : certificate.events?.title) || "",
      recipientNameSnapshot: certificate.recipient_name_snapshot || "",
      description: certificate.description || "For actively participating in this program and demonstrating commitment and enthusiasm.",
      signatures: Array.isArray(certificate.signature_data) && certificate.signature_data.length
        ? certificate.signature_data.map((signature: any) => ({
            name: signature.name || "",
            title: signature.title || "",
            signature_image_url: signature.signature_image_url || "",
          }))
        : [
            { name: "INSTRUCTOR_NAME", title: "INSTRUCTOR", signature_image_url: "" },
            { name: "DIRECTOR_NAME", title: "DIRECTOR", signature_image_url: "" },
            { name: "CLUB_PRESIDENT_NAME", title: "PRESIDENT", signature_image_url: "" },
          ],
    });
    setCertificateStatus("");
  };

  const deleteCertificate = async (id: string) => {
    if (!window.confirm("Delete this certificate permanently?")) return;
    try {
      await deleteCertificateRecord(id);
      setIssuedCertificates(issuedCertificates.filter((certificate) => certificate.id !== id));
      setCertificateStatus("Certificate deleted.");
    } catch (error: any) {
      setCertificateStatus(error.message || "Could not delete certificate.");
    }
  };

  const setCertificateRevoked = async (certificate: any, revoked: boolean) => {
    setCertificateStatus("");
    if (!window.confirm(revoked ? "Revoke this certificate?" : "Restore this certificate?")) return;
    try {
      if (revoked) {
        await revokeCertificate(certificate.id);
      } else {
        if (supabase) await supabase.from("certificates").update({ status: "valid" }).eq("id", certificate.id);
      }
      setIssuedCertificates(issuedCertificates.map((row) => row.id === certificate.id ? { ...row, status: revoked ? "revoked" : "valid" } : row));
      setCertificateStatus(revoked ? "Certificate revoked." : "Certificate restored.");
    } catch (error: any) {
      setCertificateStatus(error.message || "Could not update certificate status.");
    }
  };

  const copyCertificateLink = async (certificate: any) => {
    if (!certificate.verification_code) {
      setCertificateStatus("Run the certificate migration before verification links are available.");
      return;
    }
    const url = `${window.location.origin}/verify/${certificate.verification_code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCertificateStatus("Verification link copied.");
    } catch {
      setCertificateStatus(`Copy this verification link: ${url}`);
    }
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
  const activeEvents = filteredEvents.filter((event) => event.status !== "archived" && event.status !== "rejected");
  const archivedEvents = filteredEvents.filter((event) => event.status === "archived" || event.status === "rejected");
  const pendingEventProposals = eventProposals.filter((proposal) => proposal.status === "pending" || proposal.status === "submitted");
  const rejectedEventProposals = eventProposals.filter((proposal) => proposal.status === "rejected");
  const activeProjects = filteredProjects.filter((project) => project.status === "published" || project.status === "approved");
  const pendingProjects = filteredProjects.filter((project) => project.status === "pending" || project.status === "submitted" || project.status === "draft");
  const rejectedProjects = filteredProjects.filter((project) => project.status === "rejected" || project.status === "archived");
  const activeBlogs = blogPosts.filter((post) => post.status === "published" || post.status === "approved");
  const pendingBlogs = blogPosts.filter((post) => post.status === "pending" || post.status === "submitted" || post.status === "draft");
  const archivedBlogs = blogPosts.filter((post) => post.status === "archived" || post.status === "rejected");
  const pendingGallery = gallerySubmissions.filter((item) => item.status === "pending" || item.status === "submitted");
  const approvedGallery = gallerySubmissions.filter((item) => item.status === "approved" || item.status === "published");
  const rejectedGallery = gallerySubmissions.filter((item) => item.status === "rejected" || item.status === "archived");
  const activePartners = partnerSubmissions.filter((partner) => partner.status === "approved" || partner.status === "published");
  const archivedPartners = partnerSubmissions.filter((partner) => partner.status === "archived" || partner.status === "rejected");
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const registrationsCount = eventRegistrations.filter((registration) => registration.status !== "cancelled").length;
  const checkedInCount = eventRegistrations.filter((registration) => registration.status === "checked_in" || registration.checked_in_at).length;
  const attendanceRate = registrationsCount ? Math.round((checkedInCount / registrationsCount) * 100) : 0;
  const projectsThisMonth = projects.filter((project) => {
    const date = project.published_at || project.submitted_at;
    return date && new Date(date).toISOString().slice(0, 7) === thisMonth;
  }).length;
  const postsThisMonth = blogPosts.filter((post) => post.published_at && new Date(post.published_at).toISOString().slice(0, 7) === thisMonth).length;
  const monthLabels = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString(undefined, { month: "short" }),
    };
  });
  const memberGrowth = monthLabels.map((month) => ({
    ...month,
    count: users.filter((user) => user.createdAt && new Date(user.createdAt).toISOString().slice(0, 7) === month.key).length,
  }));
  const maxGrowth = Math.max(1, ...memberGrowth.map((month) => month.count));
  const popularEvents = [...events]
    .filter((event) => event.status === "approved" || event.status === "published")
    .sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
    .slice(0, 5);
  const selectedCertificateEvent = events.find((event) => event.id === certificateForm.eventId);
  const certificateEventRegistrations = eventRegistrations.filter((registration) =>
    registration.event_id === certificateForm.eventId
  );
  const issuedRecipientIdsForEvent = new Set(
    issuedCertificates
      .filter((certificate) =>
        certificate.event_id === certificateForm.eventId &&
        (certificate.member_id || certificate.recipient_id) &&
        certificate.status !== "revoked" &&
        certificate.status !== "archived"
      )
      .map((certificate) => certificate.member_id || certificate.recipient_id)
  );
  const certificateEventAttendees = eventRegistrations.filter((registration) =>
    registration.event_id === certificateForm.eventId &&
    (registration.status === "checked_in" || registration.checked_in_at)
  );
  const eligibleCertificateAttendees = certificateEventAttendees.filter((registration) =>
    registration.user_id && !issuedRecipientIdsForEvent.has(registration.user_id)
  );
  const alreadyIssuedCertificateAttendees = certificateEventRegistrations.filter((registration) =>
    registration.user_id && issuedRecipientIdsForEvent.has(registration.user_id)
  );
  const uncheckedCertificateAttendees = certificateEventRegistrations.filter((registration) =>
    !(registration.status === "checked_in" || registration.checked_in_at)
  );
  const certificateMemberOptions = certificateForm.eventId
    ? certificateEventRegistrations.filter((registration) => registration.user_id).map((registration) => {
        const profile = Array.isArray(registration.profiles) ? registration.profiles[0] : registration.profiles;
        const isCheckedIn = registration.status === "checked_in" || registration.checked_in_at;
        const isIssued = registration.user_id && issuedRecipientIdsForEvent.has(registration.user_id);
        const statusLabel = isIssued ? "issued" : isCheckedIn ? "ready" : "not checked in";
        return {
          value: registration.user_id,
          label: `${profile?.full_name || profile?.email || "Member"} (${statusLabel})`,
        };
      })
    : [];
  const isSelectedRecipientAlreadyIssued = Boolean(
    certificateForm.recipientId && issuedRecipientIdsForEvent.has(certificateForm.recipientId)
  );
  const isSelectedRecipientCheckedIn = Boolean(
    certificateEventAttendees.some((registration) => registration.user_id === certificateForm.recipientId)
  );
  const certificatePreviewRecipient = certificateForm.recipientId
    ? profileOptions.find((profile) => profile.id === certificateForm.recipientId)
    : (certificateEventAttendees.length
        ? (Array.isArray(certificateEventAttendees[0].profiles) ? certificateEventAttendees[0].profiles[0] : certificateEventAttendees[0].profiles)
        : null);
  const certificatePreviewName = certificateForm.recipientNameSnapshot || certificatePreviewRecipient?.full_name || certificatePreviewRecipient?.email || "Participant Name";
  const certificatePreviewRecord = {
    id: editingCertificateId || "preview",
    member_id: certificateForm.recipientId || "preview",
    event_id: certificateForm.eventId || "preview",
    certificate_title: certificateForm.title || "Certificate of Participation",
    certificate_type: certificateForm.certificateType || "Participation",
    template: certificateForm.templateStyle || "modern",
    description: certificateForm.description || "For actively participating in this program and demonstrating commitment and enthusiasm.",
    issuer_name: certificateForm.issuerName || "Data Science Club",
    issued_date: certificateForm.issuedAt || new Date().toISOString().slice(0, 10),
    external_pdf_url: certificateForm.certificateUrl || null,
    signature_data: certificateForm.signatures,
    verification_code: "CLUB-YYYY-00000",
    event_title_snapshot: certificateForm.eventTitleSnapshot || selectedCertificateEvent?.title || "Selected Event",
    recipient_name_snapshot: certificatePreviewName,
    status: "valid" as const,
    created_at: new Date().toISOString(),
  };
  const normalizeCertificateForRenderer = (certificate: any) => ({
    id: certificate.id,
    member_id: certificate.member_id || certificate.recipient_id || "",
    event_id: certificate.event_id || "",
    certificate_title: certificate.certificate_title || certificate.title || "Certificate",
    certificate_type: certificate.certificate_type || "Participation",
    template: certificate.template || certificate.template_style || "modern",
    description: certificate.description || "For actively participating in this program and demonstrating commitment and enthusiasm.",
    issuer_name: certificate.issuer_name || "Data Science Club",
    issued_date: certificate.issued_date || certificate.issued_at || "",
    external_pdf_url: certificate.external_pdf_url || certificate.certificate_url || null,
    signature_data: Array.isArray(certificate.signature_data) ? certificate.signature_data : [],
    verification_code: certificate.verification_code || "CLUB-YYYY-00000",
    event_title_snapshot: certificate.event_title_snapshot || certificate.events?.title || "Event",
    recipient_name_snapshot: certificate.recipient_name_snapshot || "Participant",
    status: certificate.status === "revoked" || certificate.status === "archived" ? "revoked" as const : "valid" as const,
    created_at: certificate.created_at || new Date().toISOString(),
  });
  const activeCredentialCount = issuedCertificates.filter((certificate) => certificate.status !== "revoked" && certificate.status !== "archived").length;
  const revokedCredentialCount = issuedCertificates.filter((certificate) => certificate.status === "revoked" || certificate.status === "archived").length;

  return (
    <div className="pt-32 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto min-h-screen bg-[#F4EFEB]">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-flex items-center gap-1">
            <Shield size={10} /> {isFullAdmin ? "ADMIN ACCESS" : "ORGANIZER ACCESS"}
          </BrutalBadge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl uppercase leading-none" style={fonts.display}>
            {isFullAdmin ? "Admin Panel" : "Organizer Panel"}
          </h1>
          <p className="mt-4 font-mono text-xs md:text-sm text-slate-500">
            {isFullAdmin ? "Manage all aspects of your Data Science Club website" : "Manage your events, projects, blogs, certificates, and check-ins"}
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
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
                onClick={() => openAdminTab(tab.id)}
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
              {isFullAdmin && (
                <button
                  onClick={() => void openEventModal()}
                  className="p-4 border-2 border-[#171717] bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all brutal-shadow brutal-shadow-hover"
                >
                  <Plus size={20} className="mb-2" />
                  <div className="text-xs font-bold uppercase tracking-widest">Create Event</div>
                </button>
              )}
              {isFullAdmin && (
                <button
                  onClick={() => openAdminTab("users")}
                  className="p-4 border-2 border-[#171717] bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all brutal-shadow brutal-shadow-hover"
                >
                  <Users size={20} className="mb-2" />
                  <div className="text-xs font-bold uppercase tracking-widest">Manage Users</div>
                </button>
              )}
              <button
                onClick={() => openAdminTab("projects")}
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
      {selectedTab === "users" && isFullAdmin && (
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
            {isFullAdmin && (
              <button
                onClick={() => void openEventModal()}
                className="px-6 py-3 bg-[#7C3AED] text-white border-2 border-[#171717] font-bold uppercase tracking-widest text-sm brutal-shadow brutal-shadow-hover flex items-center gap-2 justify-center"
              >
                <Plus size={16} /> Create Event
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => (
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
                    onClick={() => void openEventModal(event)}
                    className="flex-1 p-2 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleEventRegistration(event)}
                    className="flex-1 p-2 border-2 border-[#171717] bg-white hover:bg-[#FFE800] transition-all font-bold uppercase text-xs"
                  >
                    {event.registration_open ? "Close Reg" : "Open Reg"}
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

          {isFullAdmin && <div className="mt-10">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Pending Event Proposals</h2>
              <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{pendingEventProposals.length}</BrutalBadge>
            </div>
            <div className="grid gap-6">
              {pendingEventProposals.length === 0 ? (
                <BrutalCard color="bg-white" className="text-center">
                  <MessageSquare size={36} className="mx-auto mb-3 text-[#2563EB]" />
                  <h3 className="text-2xl uppercase mb-2" style={fonts.display}>No Pending Proposals</h3>
                  <p className="text-sm text-slate-600">New event ideas will appear here for review.</p>
                </BrutalCard>
              ) : (
                pendingEventProposals.map((proposal) => (
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
                          onClick={() => openReviewPreview("Event Proposal", [
                            { label: "Title", value: proposal.title },
                            { label: "Type", value: proposal.event_type },
                            { label: "Proposer", value: proposal.proposer },
                            { label: "Submitted", value: proposal.submittedDate },
                            { label: "Date", value: proposal.proposed_date },
                            { label: "Venue", value: proposal.venue },
                            { label: "Capacity", value: proposal.capacity },
                            { label: "Coordinators", value: proposal.coordinator_emails },
                            { label: "Summary", value: proposal.summary },
                          ], undefined, {
                            kind: "event",
                            title: proposal.title,
                            category: proposal.event_type,
                            summary: proposal.summary,
                            date: proposal.proposed_date || "Date TBD",
                            location: proposal.venue || "Venue TBD",
                            capacity: proposal.capacity || "Capacity TBD",
                          })}
                          className="px-3 py-2 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          View
                        </button>
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
            <div className="mt-8">
              <h3 className="text-xl uppercase mb-4" style={fonts.display}>Rejected Proposals</h3>
              <div className="grid gap-3">
                {rejectedEventProposals.map((proposal) => (
                  <div key={proposal.id} className="border-2 border-[#171717] bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold uppercase">{proposal.title}</p>
                      <p className="text-xs font-mono text-slate-500">{proposal.proposer} - {proposal.submittedDate}</p>
                    </div>
                    <BrutalBadge color="bg-[#FB7185]">Rejected</BrutalBadge>
                  </div>
                ))}
                {rejectedEventProposals.length === 0 && (
                  <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No rejected proposals.</p></BrutalCard>
                )}
              </div>
            </div>
            {archivedEvents.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl uppercase mb-4" style={fonts.display}>Archived Events</h3>
                <div className="grid gap-3">
                  {archivedEvents.map((event) => (
                    <div key={event.id} className="border-2 border-[#171717] bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold uppercase">{event.title}</p>
                        <p className="text-xs font-mono text-slate-500">{event.date} - {event.location}</p>
                      </div>
                    <button onClick={() => void openEventModal(event)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs">Edit</button>
                    <button onClick={() => updateEventStatus(event.id, "approved")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white hover:bg-green-600 font-bold uppercase text-xs">Unarchive</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>}
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

          <h2 className="text-2xl uppercase mb-4" style={fonts.display}>Pending Projects</h2>
          <div className="grid gap-6 mb-10">
            {pendingProjects.map((project) => (
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
                      <button
                        onClick={() => openReviewPreview("Project Submission", [
                          { label: "Title", value: project.title },
                          { label: "Author", value: project.author },
                          { label: "Submitted", value: project.submittedDate },
                          { label: "Category", value: project.category },
                          { label: "Team", value: project.team },
                          { label: "Technologies", value: project.tags },
                          { label: "Summary", value: project.summary },
                          { label: "Content", value: project.content },
                          { label: "Status", value: project.status },
                        ], project.thumbnail_url, {
                          kind: "project",
                          title: project.title,
                          category: project.category,
                          summary: project.summary,
                          author: project.author,
                          tags: project.tags,
                          imageUrl: project.thumbnail_url,
                        })}
                        className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openProjectModal(project)}
                        className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                      >
                        Edit
                      </button>
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
            {pendingProjects.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No pending projects.</p></BrutalCard>}
          </div>

          <h2 className="text-2xl uppercase mb-4" style={fonts.display}>Published Projects</h2>
          <div className="grid gap-6 mb-10">
            {activeProjects.map((project) => (
              <BrutalCard key={project.id} color="bg-white">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{project.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">by <span className="font-bold">{project.author}</span> - {project.submittedDate}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <BrutalBadge color="bg-green-500">{project.status}</BrutalBadge>
                    <button onClick={() => openProjectModal(project)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs">Edit</button>
                    <button onClick={() => updateProjectStatus(project.id, "archived")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white transition-all font-bold uppercase text-xs">Archive</button>
                  </div>
                </div>
              </BrutalCard>
            ))}
            {activeProjects.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No published projects.</p></BrutalCard>}
          </div>

          <h2 className="text-2xl uppercase mb-4" style={fonts.display}>Rejected / Archived Projects</h2>
          <div className="grid gap-6">
            {rejectedProjects.map((project) => (
              <BrutalCard key={project.id} color="bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-1" style={fonts.display}>{project.title}</h3>
                    <p className="text-sm text-slate-600">by <span className="font-bold">{project.author}</span></p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <BrutalBadge color="bg-[#FB7185]">{project.status}</BrutalBadge>
                    <button onClick={() => openProjectModal(project)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs">Edit</button>
                    <button onClick={() => updateProjectStatus(project.id, "published")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white hover:bg-green-600 transition-all font-bold uppercase text-xs">Unarchive</button>
                  </div>
                </div>
              </BrutalCard>
            ))}
            {rejectedProjects.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No rejected or archived projects.</p></BrutalCard>}
          </div>
        </>
      )}

      {/* ─── CONTENT TAB ───────────────────────────────────────────────────────── */}
      {["blogs", "gallery", "partners", "resources"].includes(selectedTab) && (isFullAdmin || selectedTab === "blogs") && (
        <div className="space-y-6">
          {selectedTab === "blogs" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Pending Blog Posts</h2>
                <button onClick={() => openBlogModal()} className="px-5 py-3 bg-[#171717] text-white border-2 border-[#171717] font-bold uppercase tracking-widest text-xs brutal-shadow brutal-shadow-hover">
                  Create Blog
                </button>
              </div>
              <div className="grid gap-4">
                {pendingBlogs.map((post) => (
                  <BrutalCard key={post.id} color="bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold uppercase text-lg">{post.title}</h3>
                        <p className="text-xs font-mono text-slate-500">By {post.author} - {post.publishedDate || "date pending"}</p>
                        <p className="text-sm text-slate-600 mt-2">{post.summary}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <BrutalBadge color={post.status === "published" ? "bg-green-500" : "bg-[#FFE800]"} text={post.status === "published" ? "text-white" : "text-[#171717]"}>
                          {post.status}
                        </BrutalBadge>
                        <button
                          onClick={() => openReviewPreview("Blog Post", [
                            { label: "Title", value: post.title },
                            { label: "Author", value: post.author },
                            { label: "Published Date", value: post.publishedDate },
                            { label: "Tags", value: post.tags },
                            { label: "Summary", value: post.summary },
                            { label: "Content", value: post.content },
                            { label: "Status", value: post.status },
                          ], post.cover_image_url, {
                            kind: "blog",
                            title: post.title,
                            summary: post.summary,
                            author: post.author,
                            tags: post.tags,
                            imageUrl: post.cover_image_url,
                            content: post.content,
                          })}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs"
                        >
                          View
                        </button>
                        <button onClick={() => openBlogModal(post)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs">Edit</button>
                        {post.status !== "published" && (
                          <button onClick={() => updateBlogStatus(post.id, "published")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Publish</button>
                        )}
                        <button onClick={() => updateBlogStatus(post.id, "archived")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Archive</button>
                      </div>
                    </div>
                  </BrutalCard>
                ))}
                {pendingBlogs.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No pending blog posts.</p></BrutalCard>}
              </div>
              <h2 className="text-2xl md:text-3xl uppercase mt-10" style={fonts.display}>Published Blog Posts</h2>
              <div className="grid gap-4">
                {activeBlogs.map((post) => (
                  <BrutalCard key={post.id} color="bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold uppercase text-lg">{post.title}</h3>
                        <p className="text-xs font-mono text-slate-500">By {post.author} - {post.publishedDate || "date pending"}</p>
                        <p className="text-sm text-slate-600 mt-2">{post.summary}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <BrutalBadge color="bg-green-500">{post.status}</BrutalBadge>
                        <button onClick={() => openBlogModal(post)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs">Edit</button>
                        <button onClick={() => updateBlogStatus(post.id, "archived")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Archive</button>
                      </div>
                    </div>
                  </BrutalCard>
                ))}
                {activeBlogs.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No published blog posts.</p></BrutalCard>}
              </div>
              <h2 className="text-2xl md:text-3xl uppercase mt-10" style={fonts.display}>Archived / Rejected Blog Posts</h2>
              <div className="grid gap-4">
                {archivedBlogs.map((post) => (
                  <BrutalCard key={post.id} color="bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold uppercase text-lg">{post.title}</h3>
                        <p className="text-xs font-mono text-slate-500">By {post.author}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <BrutalBadge color="bg-[#FB7185]">{post.status}</BrutalBadge>
                        <button onClick={() => openBlogModal(post)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs">Edit</button>
                        <button onClick={() => updateBlogStatus(post.id, "published")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Unarchive</button>
                      </div>
                    </div>
                  </BrutalCard>
                ))}
                {archivedBlogs.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No archived or rejected blog posts.</p></BrutalCard>}
              </div>
            </>
          )}

          {selectedTab === "gallery" && (
            <>
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Pending Gallery Submissions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pendingGallery.map((item) => (
                  <BrutalCard key={item.id} color="bg-white">
                    <div className="aspect-video bg-slate-100 border-2 border-[#171717] mb-4 overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold uppercase">{item.title}</h3>
                    <p className="text-xs font-mono text-slate-500 mb-3">{item.event_name || "General gallery"} - {item.status}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openReviewPreview("Gallery Submission", [
                          { label: "Title", value: item.title },
                          { label: "Event", value: item.event_name },
                          { label: "Status", value: item.status },
                          { label: "Submitted", value: item.created_at ? new Date(item.created_at).toLocaleString() : "" },
                          { label: "Image URL", value: item.image_url },
                        ], item.image_url, {
                          kind: "gallery",
                          title: item.title,
                          event: item.event_name || "Community",
                          imageUrl: item.image_url,
                          date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
                        })}
                        className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs"
                      >
                        View
                      </button>
                      <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "approved")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Approve</button>
                      <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "rejected")} className="px-3 py-1 border-2 border-[#171717] bg-[#FB7185] text-white font-bold uppercase text-xs">Reject</button>
                    </div>
                  </BrutalCard>
                ))}
                {pendingGallery.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No pending gallery submissions.</p></BrutalCard>}
              </div>
              <h2 className="text-2xl md:text-3xl uppercase mt-10" style={fonts.display}>Approved Gallery</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {approvedGallery.map((item) => (
                  <BrutalCard key={item.id} color="bg-white">
                    <div className="aspect-video bg-slate-100 border-2 border-[#171717] mb-4 overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold uppercase">{item.title}</h3>
                    <p className="text-xs font-mono text-slate-500 mb-3">{item.event_name || "General gallery"} - {item.status}</p>
                    <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "rejected")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Move to Rejected</button>
                  </BrutalCard>
                ))}
                {approvedGallery.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No approved gallery items.</p></BrutalCard>}
              </div>
              <h2 className="text-2xl md:text-3xl uppercase mt-10" style={fonts.display}>Rejected Gallery</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {rejectedGallery.map((item) => (
                  <BrutalCard key={item.id} color="bg-white">
                    <h3 className="font-bold uppercase">{item.title}</h3>
                    <p className="text-xs font-mono text-slate-500 mb-3">{item.event_name || "General gallery"} - {item.status}</p>
                    <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "approved")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Unarchive</button>
                  </BrutalCard>
                ))}
                {rejectedGallery.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No rejected gallery submissions.</p></BrutalCard>}
              </div>
            </>
          )}

          {selectedTab === "partners" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Partners</h2>
                <button onClick={() => openPartnerModal()} className="px-5 py-3 bg-[#2563EB] text-white border-2 border-[#171717] font-bold uppercase tracking-widest text-xs brutal-shadow brutal-shadow-hover">
                  Add Partner
                </button>
              </div>
              <div className="grid gap-4">
                {activePartners.map((partner) => (
                  <BrutalCard key={partner.id} color="bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold uppercase text-lg">{partner.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{partner.category || "Partner"} - {partner.status}</p>
                        <p className="text-sm text-slate-600 mt-2">{partner.description}</p>
                        {partner.website_url && <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#2563EB]">Open website</a>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openPartnerModal(partner)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs">Edit</button>
                        <button onClick={() => updateSubmissionStatus("partner_submissions", partner.id, "archived")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Archive</button>
                        <button onClick={() => deletePartner(partner.id)} className="px-3 py-1 border-2 border-[#171717] bg-[#FB7185] text-white font-bold uppercase text-xs">Delete</button>
                      </div>
                    </div>
                  </BrutalCard>
                ))}
                {activePartners.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No partners added yet.</p></BrutalCard>}
              </div>
              <h2 className="text-2xl md:text-3xl uppercase mt-10" style={fonts.display}>Archived Partners</h2>
              <div className="grid gap-4">
                {archivedPartners.map((partner) => (
                  <BrutalCard key={partner.id} color="bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold uppercase text-lg">{partner.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{partner.category || "Partner"} - {partner.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openPartnerModal(partner)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs">Edit</button>
                        <button onClick={() => updateSubmissionStatus("partner_submissions", partner.id, "published")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Unarchive</button>
                        <button onClick={() => deletePartner(partner.id)} className="px-3 py-1 border-2 border-[#171717] bg-[#FB7185] text-white font-bold uppercase text-xs">Delete</button>
                      </div>
                    </div>
                  </BrutalCard>
                ))}
                {archivedPartners.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No archived partners.</p></BrutalCard>}
              </div>
            </>
          )}

          {selectedTab === "resources" && (
            <div className="grid lg:grid-cols-[420px_1fr] gap-6">
              <BrutalCard color="bg-white">
                <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Add Learning Material</h2>
                <form onSubmit={addLearningMaterial}>
                  <BrutalInput label="Title" value={resourceForm.title} onChange={(event: any) => setResourceForm({ ...resourceForm, title: event.target.value })} required />
                  <BrutalInput label="Category" value={resourceForm.category} onChange={(event: any) => setResourceForm({ ...resourceForm, category: event.target.value })} required />
                  <BrutalInput label="Resource URL" value={resourceForm.resourceUrl} onChange={(event: any) => setResourceForm({ ...resourceForm, resourceUrl: event.target.value })} required />
                  <BrutalTextarea label="Description" value={resourceForm.description} onChange={(event: any) => setResourceForm({ ...resourceForm, description: event.target.value })} />
                  <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full">Publish Material</BrutalButton>
                </form>
              </BrutalCard>
              <div className="space-y-3">
                {learningMaterials.map((material) => (
                  <BrutalCard key={material.id} color="bg-white">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold uppercase">{material.title}</h3>
                        <p className="text-xs font-mono text-slate-500">{material.category} - {material.status}</p>
                        <p className="text-sm text-slate-600 mt-2">{material.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <a href={material.resource_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs">Open</a>
                        <button onClick={() => deleteLearningMaterial(material.id)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Delete</button>
                      </div>
                    </div>
                  </BrutalCard>
                ))}
                {learningMaterials.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No learning materials yet.</p></BrutalCard>}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === "certificates" && (
        <div className="space-y-6">
          <BrutalCard color="bg-white">
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>
              {editingCertificateId ? "Edit Certificate" : "Certificate Studio"}
            </h2>
            {!isCertificateAdmin ? (
              <div className="border-2 border-[#171717] bg-[#FFE800] p-4">
                <p className="text-sm font-bold">
                  Your profile must have the admin or organizer role before you can issue certificates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleIssueCertificate}>
                <div className="mb-5 border-2 border-[#171717] bg-[#F4EFEB] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Step 1</p>
                  <h3 className="font-bold uppercase tracking-widest text-sm">Select the event</h3>
                  <p className="mt-1 text-xs font-mono text-slate-500">
                    Certificates are issued from an event attendance list. Check-in must happen first, then the certificate can be sent.
                  </p>
                </div>
                <BrutalSelect
                  label="Certificate Event"
                  value={certificateForm.eventId}
                  onChange={(event: any) => applyCertificateEvent(event.target.value)}
                  disabled={Boolean(editingCertificateId)}
                  options={[
                    { value: "", label: "Select event" },
                    ...events.map((event) => ({
                      value: event.id,
                      label: event.title,
                    })),
                  ]}
                />
                {selectedCertificateEvent && (
                  <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="border-2 border-[#171717] bg-white p-3">
                      <p className="text-xl font-bold">{certificateEventRegistrations.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registered</p>
                    </div>
                    <div className="border-2 border-[#171717] bg-[#DBEAFE] p-3">
                      <p className="text-xl font-bold">{certificateEventAttendees.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Checked In</p>
                    </div>
                    <div className="border-2 border-[#171717] bg-[#DCFCE7] p-3">
                      <p className="text-xl font-bold">{eligibleCertificateAttendees.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ready</p>
                    </div>
                    <div className="border-2 border-[#171717] bg-[#FFE800] p-3">
                      <p className="text-xl font-bold">{alreadyIssuedCertificateAttendees.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Issued</p>
                    </div>
                  </div>
                )}
                <div className="mb-6 border-4 border-[#171717] bg-[#171717] text-white brutal-shadow-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-4 border-[#171717] bg-[#2563EB] p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Certificate Draft Editor</p>
                      <h3 className="text-2xl uppercase leading-none" style={fonts.display}>Design the certificate before issuing</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{certificateForm.templateStyle}</BrutalBadge>
                      <BrutalBadge color="bg-white" text="text-[#171717]">Live Preview</BrutalBadge>
                    </div>
                  </div>

                  <div className="grid 2xl:grid-cols-[520px_1fr] gap-0 bg-white text-[#171717]">
                    <div className="border-b-4 2xl:border-b-0 2xl:border-r-4 border-[#171717] p-4 md:p-5 space-y-5">
                      <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Content</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Text printed on certificate</h4>
                          </div>
                          <FileText size={18} className="text-[#2563EB]" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <BrutalInput
                            label="Printed Recipient Name"
                            value={certificateForm.recipientNameSnapshot}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, recipientNameSnapshot: event.target.value })}
                            placeholder="Name shown on certificate"
                            required
                          />
                          <BrutalInput
                            label="Printed Event Name"
                            value={certificateForm.eventTitleSnapshot}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, eventTitleSnapshot: event.target.value })}
                            placeholder="Event shown on certificate"
                            required
                          />
                        </div>
                        <BrutalInput
                          label="Certificate Title"
                          value={certificateForm.title}
                          onChange={(event: any) => setCertificateForm({ ...certificateForm, title: event.target.value })}
                          placeholder="Certificate of Participation"
                          required
                        />
                        <BrutalTextarea
                          label="Certificate Description"
                          value={certificateForm.description}
                          onChange={(event: any) => setCertificateForm({ ...certificateForm, description: event.target.value })}
                          placeholder="For actively participating in this program..."
                          rows={5}
                        />
                      </div>

                      <div className="border-2 border-[#171717] bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Design</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Template and metadata</h4>
                          </div>
                          <Settings size={18} className="text-[#7C3AED]" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
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
                          <BrutalSelect
                            label="Template"
                            value={certificateForm.templateStyle}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, templateStyle: event.target.value })}
                            options={certificateTemplateOptions.map((template) => ({
                              value: template.value,
                              label: template.label,
                            }))}
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
                        </div>
                        <BrutalInput
                          label="Optional External PDF Link"
                          value={certificateForm.certificateUrl}
                          onChange={(event: any) => setCertificateForm({ ...certificateForm, certificateUrl: event.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signatures</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Add up to 3 signers</h4>
                          </div>
                          <button
                            type="button"
                            onClick={addCertificateSignature}
                            className="px-3 py-2 border-2 border-[#171717] bg-[#FFE800] font-bold uppercase tracking-widest text-[10px]"
                          >
                            Add Signer
                          </button>
                        </div>
                        <div className="space-y-3">
                          {certificateForm.signatures.map((signature, index) => (
                            <div key={index} className="border-2 border-[#171717] bg-white p-3">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signer {index + 1}</p>
                                <button
                                  type="button"
                                  onClick={() => removeCertificateSignature(index)}
                                  className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase tracking-widest text-[10px]"
                                  disabled={certificateForm.signatures.length === 1}
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid md:grid-cols-2 gap-2">
                                <input
                                  className="w-full border-2 border-[#171717] p-2 font-mono text-xs"
                                  value={signature.name}
                                  onChange={(event) => updateCertificateSignature(index, "name", event.target.value)}
                                  placeholder="Signer name"
                                />
                                <input
                                  className="w-full border-2 border-[#171717] p-2 font-mono text-xs"
                                  value={signature.title}
                                  onChange={(event) => updateCertificateSignature(index, "title", event.target.value)}
                                  placeholder="Role / title"
                                />
                              </div>
                              <div className="mt-3 grid md:grid-cols-[1fr_auto] gap-3 items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) => uploadCertificateSignature(index, event.target.files?.[0])}
                                  className="w-full border-2 border-[#171717] p-2 font-mono text-xs"
                                />
                                {signature.signature_image_url && (
                                  <img src={signature.signature_image_url} alt={`${signature.name} signature`} className="h-12 max-w-40 object-contain border-2 border-[#171717] bg-white p-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F4EFEB] p-4 md:p-6">
                      <div className="sticky top-28">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Final draft</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Preview before issue</h4>
                          </div>
                          <BrutalBadge color="bg-[#2563EB]">{certificateForm.certificateType}</BrutalBadge>
                        </div>
                        <div className="overflow-x-auto border-2 border-[#171717] bg-white p-3 brutal-shadow">
                          <div className="min-w-[760px]">
                            <CertificateRenderer certificate={certificatePreviewRecord} />
                          </div>
                        </div>
                        {certificateForm.eventId && (
                          <p className="mt-4 text-xs font-mono text-slate-500">
                            Bulk issue will send this same draft to {eligibleCertificateAttendees.length} checked-in attendee{eligibleCertificateAttendees.length === 1 ? "" : "s"} who {eligibleCertificateAttendees.length === 1 ? "does" : "do"} not already have one.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCertificateEvent && (
                  <div className="mb-5 border-2 border-[#171717] bg-white p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Issuing Queue</p>
                        <h3 className="font-bold uppercase tracking-widest text-sm">{selectedCertificateEvent.title}</h3>
                      </div>
                      <BrutalBadge color="bg-[#DCFCE7]">{eligibleCertificateAttendees.length} ready</BrutalBadge>
                    </div>
                    {certificateEventRegistrations.length === 0 ? (
                      <p className="text-xs font-mono text-slate-500">No registrations found for this event yet.</p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {certificateEventRegistrations.map((registration) => {
                          const profile = Array.isArray(registration.profiles) ? registration.profiles[0] : registration.profiles;
                          const isCheckedIn = registration.status === "checked_in" || registration.checked_in_at;
                          const isIssued = registration.user_id && issuedRecipientIdsForEvent.has(registration.user_id);
                          const statusColor = isIssued ? "bg-[#FFE800]" : isCheckedIn ? "bg-[#DCFCE7]" : "bg-slate-200";
                          const statusText = isIssued ? "Issued" : isCheckedIn ? "Ready" : "Not checked in";
                          return (
                            <div key={registration.id || registration.user_id} className="flex items-center justify-between gap-3 border-2 border-[#171717] p-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase truncate">{profile?.full_name || profile?.email || "Member"}</p>
                                <p className="text-[10px] font-mono text-slate-500 truncate">{profile?.email || registration.user_id}</p>
                              </div>
                              <BrutalBadge color={statusColor} text="text-[#171717]">{statusText}</BrutalBadge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {uncheckedCertificateAttendees.length > 0 && (
                      <p className="mt-3 text-[10px] font-mono text-slate-500">
                        {uncheckedCertificateAttendees.length} registered attendee{uncheckedCertificateAttendees.length === 1 ? "" : "s"} still need check-in before certificate issuing.
                      </p>
                    )}
                  </div>
                )}
                {certificateStatus && (
                  <p className="mb-4 text-xs font-bold text-[#2563EB]">{certificateStatus}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <BrutalButton
                    type="submit"
                    color="bg-[#2563EB]"
                    text="text-white"
                    className="w-full text-xs"
                    disabled={
                      !certificateForm.eventId ||
                      (!editingCertificateId && (!certificateForm.recipientId || !isSelectedRecipientCheckedIn || isSelectedRecipientAlreadyIssued))
                    }
                >
                    <Award size={16} className="inline mr-2" /> {editingCertificateId ? "Save Certificate" : "Issue Single"}
                  </BrutalButton>
                  <BrutalButton
                    type="button"
                    color="bg-[#FFE800]"
                    className="w-full text-xs"
                    onClick={issueEventCertificates}
                    disabled={Boolean(editingCertificateId) || issuingBulkCertificates || !certificateForm.eventId || eligibleCertificateAttendees.length === 0}
                  >
                    <Users size={16} className="inline mr-2" /> {issuingBulkCertificates ? "Issuing..." : "Issue Checked-In"}
                  </BrutalButton>
                </div>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Credential Registry</h2>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  {activeCredentialCount} active - {revokedCredentialCount} revoked
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <BrutalBadge color="bg-[#2563EB]">{issuedCertificates.length} total</BrutalBadge>
                <BrutalBadge color="bg-green-500">{activeCredentialCount} active</BrutalBadge>
              </div>
            </div>
            {certificateStatus && (
              <div className="mb-4 border-2 border-[#171717] bg-[#FFE800] p-3 text-xs font-bold uppercase tracking-widest">
                {certificateStatus}
              </div>
            )}
            {issuedCertificates.length === 0 ? (
              <div className="border-2 border-dashed border-[#171717] p-8 text-center">
                <Award size={32} className="mx-auto mb-3 text-[#2563EB]" />
                <p className="font-bold uppercase tracking-widest text-sm">No certificates issued yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issuedCertificates.map((certificate) => {
                  const recipient = Array.isArray(certificate.profiles) ? certificate.profiles[0] : certificate.profiles;
                  const isRevoked = Boolean(certificate.status === "revoked" || certificate.status === "archived");
                  const verifyUrl = certificate.verification_code ? `${window.location.origin}/verify/${certificate.verification_code}` : "";
                  return (
                    <div key={certificate.id} className={`border-2 border-[#171717] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${isRevoked ? "bg-slate-100 opacity-80" : "bg-white"}`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold uppercase">{certificate.certificate_title || certificate.title}</h3>
                          <BrutalBadge color={isRevoked ? "bg-slate-500" : "bg-green-500"}>
                            {isRevoked ? "Revoked" : "Verified"}
                          </BrutalBadge>
                        </div>
                        <p className="text-xs font-mono text-slate-500">
                          Recipient: {certificate.recipient_name_snapshot || recipient?.full_name || recipient?.email || "Member"} - issued {certificate.issued_date || certificate.issued_at || "date pending"}
                        </p>
                        <p className="text-xs font-mono text-slate-500">
                          Issuer: {certificate.issuer_name || "Data Science Club"} - Created: {certificate.created_at ? new Date(certificate.created_at).toLocaleString() : "unknown"}
                        </p>
                        {certificate.events && (
                          <p className="text-xs font-mono text-slate-500">
                            Event: {certificate.event_title_snapshot || (Array.isArray(certificate.events) ? certificate.events[0]?.title : certificate.events.title)}
                          </p>
                        )}
                        <p className="text-xs font-mono text-slate-500">
                          Verify code: {certificate.verification_code || "Pending migration"}
                        </p>
                        {verifyUrl && <p className="text-xs font-mono text-slate-500 break-all">Verify URL: {verifyUrl}</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <BrutalBadge color="bg-[#7C3AED]">{certificate.certificate_type}</BrutalBadge>
                        <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{certificate.template || certificate.template_style || "legacy"}</BrutalBadge>
                        <button
                          type="button"
                          onClick={() => setCertificateModal(certificate)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FFE800] transition-all font-bold uppercase text-xs"
                        >
                          View
                        </button>
                        {certificate.verification_code && (
                          <button
                            type="button"
                            onClick={() => copyCertificateLink(certificate)}
                            className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FFE800] transition-all font-bold uppercase text-xs"
                          >
                            Copy Link
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => editCertificate(certificate)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setCertificateRevoked(certificate, !isRevoked)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#7C3AED] hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          {isRevoked ? "Restore" : "Revoke"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCertificate(certificate.id)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white transition-all font-bold uppercase text-xs"
                          disabled={!isRevoked}
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
          {settingsStatus && (
            <div className="border-2 border-[#171717] bg-[#FFE800] p-3 font-bold text-sm uppercase tracking-widest brutal-shadow">
              {settingsStatus}
            </div>
          )}
          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Site Settings</h2>
            <BrutalInput label="Site Name" value={siteSettings.siteName} onChange={(e: any) => setSiteSettings({...siteSettings, siteName: e.target.value})} />
            <BrutalInput label="Tagline" value={siteSettings.tagline} onChange={(e: any) => setSiteSettings({...siteSettings, tagline: e.target.value})} />
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save Settings"}
            </BrutalButton>
          </BrutalCard>

          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Contact Information</h2>
            <BrutalInput label="Email" type="email" value={siteSettings.contactEmail} onChange={(e: any) => setSiteSettings({...siteSettings, contactEmail: e.target.value})} />
            <BrutalInput label="Phone" value={siteSettings.contactPhone} onChange={(e: any) => setSiteSettings({...siteSettings, contactPhone: e.target.value})} />
            <BrutalTextarea label="Address" value={siteSettings.address} onChange={(e: any) => setSiteSettings({...siteSettings, address: e.target.value})} />
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save Contact Info"}
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
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save Social Links"}
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
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{users.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Members</div>
            </BrutalCard>
            <BrutalCard color="bg-[#7C3AED]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={24} />
                <TrendingUp size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{attendanceRate}%</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Event Attendance</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FB7185]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Trophy size={24} />
                <TrendingUp size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{projectsThisMonth}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Projects This Month</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FFE800]">
              <div className="flex items-center justify-between mb-2">
                <FileText size={24} />
                <Activity size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{postsThisMonth}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Blog Posts This Month</div>
            </BrutalCard>
          </div>

          <BrutalCard className="mb-6">
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Member Growth</h2>
            <div className="space-y-4">
              {memberGrowth.map((month) => (
                <div key={month.key} className="grid grid-cols-[64px_1fr_48px] items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest">{month.label}</span>
                  <div className="h-8 border-2 border-[#171717] bg-[#F4EFEB]">
                    <div
                      className="h-full bg-[#2563EB]"
                      style={{ width: `${Math.max(6, (month.count / maxGrowth) * 100)}%` }}
                    />
                  </div>
                  <span className="text-right text-sm font-bold font-mono">{month.count}</span>
                </div>
              ))}
            </div>
          </BrutalCard>

          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Popular Events</h2>
            <div className="space-y-4">
              {popularEvents.map(event => (
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
              {popularEvents.length === 0 && (
                <p className="text-sm font-mono text-slate-500">Approved events will appear here after registrations start.</p>
              )}
            </div>
          </BrutalCard>
        </>
      )}

      {/* ─── MODALS ──────────────────────────────────────────────────────────── */}
      
      {certificateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="max-w-6xl w-full max-h-[94vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between gap-3 text-white">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>
                {certificateModal.certificate_title || certificateModal.title || "Certificate"}
              </h2>
              <button
                onClick={() => setCertificateModal(null)}
                className="px-4 py-2 border-2 border-[#171717] bg-white text-[#171717] font-bold uppercase tracking-widest text-xs"
              >
                Close
              </button>
            </div>
            <CertificateRenderer certificate={normalizeCertificateForRenderer(certificateModal)} />
          </div>
        </div>
      )}

      {reviewPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <BrutalCard className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>{reviewPreview.title}</h2>
              <button onClick={() => setReviewPreview(null)} className="p-2 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            {reviewPreview.preview && (
              <div className="mb-6">
                {reviewPreview.preview.kind === "event" && (
                  <div className="border-2 border-[#171717] bg-[#F4EFEB] p-6 brutal-shadow">
                    <BrutalBadge color="bg-[#2563EB]" className="mb-4">{reviewPreview.preview.category}</BrutalBadge>
                    <h3 className="text-4xl uppercase leading-tight mb-3" style={fonts.display}>{reviewPreview.preview.title}</h3>
                    <p className="text-slate-700 mb-5">{reviewPreview.preview.summary}</p>
                    <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="border-2 border-[#171717] bg-white p-3">Date<br /><b>{reviewPreview.preview.date}</b></div>
                      <div className="border-2 border-[#171717] bg-white p-3">Venue<br /><b>{reviewPreview.preview.location}</b></div>
                      <div className="border-2 border-[#171717] bg-white p-3">Capacity<br /><b>{reviewPreview.preview.capacity}</b></div>
                    </div>
                  </div>
                )}
                {reviewPreview.preview.kind === "project" && (
                  <div className="border-2 border-[#171717] bg-white overflow-hidden brutal-shadow">
                    {reviewPreview.preview.imageUrl && <img src={reviewPreview.preview.imageUrl} alt={reviewPreview.preview.title} className="w-full h-56 object-cover border-b-2 border-[#171717]" />}
                    <div className="p-6">
                      <BrutalBadge color="bg-[#FB7185]" className="mb-3">{reviewPreview.preview.category}</BrutalBadge>
                      <h3 className="text-4xl uppercase leading-tight mb-2" style={fonts.display}>{reviewPreview.preview.title}</h3>
                      <p className="text-xs font-mono text-slate-500 mb-4">By {reviewPreview.preview.author}</p>
                      <p className="text-slate-700 mb-4">{reviewPreview.preview.summary}</p>
                      <div className="flex gap-2 flex-wrap">{(reviewPreview.preview.tags || []).map((tag: string) => <BrutalBadge key={tag} color="bg-[#2563EB]">{tag}</BrutalBadge>)}</div>
                    </div>
                  </div>
                )}
                {reviewPreview.preview.kind === "blog" && (
                  <article className="border-2 border-[#171717] bg-white overflow-hidden brutal-shadow">
                    {reviewPreview.preview.imageUrl && <img src={reviewPreview.preview.imageUrl} alt={reviewPreview.preview.title} className="w-full h-56 object-cover border-b-2 border-[#171717]" />}
                    <div className="p-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">{(reviewPreview.preview.tags || []).join(" / ") || "Blog"}</p>
                      <h3 className="text-4xl uppercase leading-tight mb-3" style={fonts.display}>{reviewPreview.preview.title}</h3>
                      <p className="text-xs font-mono text-slate-500 mb-4">By {reviewPreview.preview.author}</p>
                      <p className="text-lg text-slate-700 mb-5">{reviewPreview.preview.summary}</p>
                      <pre className="whitespace-pre-wrap border-2 border-[#171717] bg-[#F4EFEB] p-4 text-xs font-mono max-h-72 overflow-auto">{reviewPreview.preview.content}</pre>
                    </div>
                  </article>
                )}
                {reviewPreview.preview.kind === "gallery" && (
                  <div className="border-2 border-[#171717] bg-white overflow-hidden brutal-shadow">
                    <img src={reviewPreview.preview.imageUrl} alt={reviewPreview.preview.title} className="w-full h-80 object-cover border-b-2 border-[#171717]" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <BrutalBadge color="bg-[#2563EB]">{reviewPreview.preview.event}</BrutalBadge>
                        <span className="text-xs font-mono text-slate-500">{reviewPreview.preview.date}</span>
                      </div>
                      <h3 className="text-3xl uppercase" style={fonts.display}>{reviewPreview.preview.title}</h3>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              {reviewPreview.rows.map((row: any) => (
                <div key={row.label} className="border-2 border-[#171717] bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{row.label}</p>
                  <p className="text-sm whitespace-pre-wrap break-words">{row.value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setReviewPreview(null)}
              className="mt-6 w-full px-6 py-3 border-2 border-[#171717] bg-[#171717] text-white hover:bg-black transition-all font-bold uppercase tracking-widest"
            >
              Close
            </button>
          </BrutalCard>
        </div>
      )}

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
              <button onClick={() => { resetEventForm(); setShowEventModal(false); }} className="p-2 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveEvent}>
              <BrutalInput label="Event Title" value={eventForm.title} onChange={(event: any) => setEventForm({ ...eventForm, title: event.target.value })} required />
              <BrutalTextarea label="Description" value={eventForm.description} onChange={(event: any) => setEventForm({ ...eventForm, description: event.target.value })} required />
              <BrutalInput label="Short Description" value={eventForm.shortDescription} onChange={(event: any) => setEventForm({ ...eventForm, shortDescription: event.target.value })} />
              <div className="grid md:grid-cols-2 gap-4">
                <BrutalInput label="Start Time" type="datetime-local" value={eventForm.startTime} onChange={(event: any) => setEventForm({ ...eventForm, startTime: event.target.value })} />
                <BrutalInput label="End Time" type="datetime-local" value={eventForm.endTime} onChange={(event: any) => setEventForm({ ...eventForm, endTime: event.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <BrutalInput label="Location" value={eventForm.venue} onChange={(event: any) => setEventForm({ ...eventForm, venue: event.target.value })} />
                <BrutalInput label="Capacity" type="number" value={eventForm.capacity} onChange={(event: any) => setEventForm({ ...eventForm, capacity: event.target.value })} />
              </div>
              <BrutalSelect
                label="Category"
                value={eventForm.eventType}
                onChange={(event: any) => setEventForm({ ...eventForm, eventType: event.target.value })}
                options={[
                  { value: "WORKSHOP", label: "Workshop" },
                  { value: "SEMINAR", label: "Seminar" },
                  { value: "COMPETITION", label: "Competition" },
                  { value: "COMMUNITY", label: "Community" },
                ]}
              />
              <BrutalSelect
                label="Status"
                value={eventForm.status}
                onChange={(event: any) => setEventForm({ ...eventForm, status: event.target.value })}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "approved", label: "Approved" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" },
                ]}
              />
              <BrutalTextarea
                label="Coordinator Emails"
                value={eventForm.coordinatorEmails}
                onChange={(event: any) => setEventForm({ ...eventForm, coordinatorEmails: event.target.value })}
                placeholder="coordinator@sms.tu.edu.np, external@example.com"
              />
              <label className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                <input
                  type="checkbox"
                  checked={eventForm.registrationOpen}
                  onChange={(event) => setEventForm({ ...eventForm, registrationOpen: event.target.checked })}
                  className="w-4 h-4 accent-[#2563EB]"
                />
                Registration open
              </label>
              <div className="flex gap-3">
                <BrutalButton type="submit" color="bg-[#7C3AED]" text="text-white" className="flex-1">
                  <Save size={16} className="inline mr-2" /> Save Event
                </BrutalButton>
              <button
                type="button"
                onClick={() => { resetEventForm(); setShowEventModal(false); }}
                className="flex-1 px-6 py-3 border-2 border-[#171717] bg-white hover:bg-slate-100 transition-all font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
              </div>
            </form>
          </BrutalCard>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <BrutalCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Edit Project</h2>
              <button onClick={() => { resetProjectForm(); setShowProjectModal(false); }} className="p-2 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveProject}>
              <BrutalInput label="Project Title" value={projectForm.title} onChange={(event: any) => setProjectForm({ ...projectForm, title: event.target.value })} required />
              <div className="grid md:grid-cols-2 gap-4">
                <BrutalInput label="Category" value={projectForm.category} onChange={(event: any) => setProjectForm({ ...projectForm, category: event.target.value })} required />
                <BrutalInput label="Team" value={projectForm.team} onChange={(event: any) => setProjectForm({ ...projectForm, team: event.target.value })} />
              </div>
              <BrutalInput label="Technologies" value={projectForm.technologies} onChange={(event: any) => setProjectForm({ ...projectForm, technologies: event.target.value })} placeholder="Python, React, TensorFlow" />
              <BrutalTextarea label="Summary" value={projectForm.summary} onChange={(event: any) => setProjectForm({ ...projectForm, summary: event.target.value })} required />
              <BrutalTextarea label="Content" value={projectForm.content} onChange={(event: any) => setProjectForm({ ...projectForm, content: event.target.value })} />
              <BrutalInput label="Thumbnail URL" value={projectForm.thumbnailUrl} onChange={(event: any) => setProjectForm({ ...projectForm, thumbnailUrl: event.target.value })} />
              <BrutalSelect
                label="Status"
                value={projectForm.status}
                onChange={(event: any) => setProjectForm({ ...projectForm, status: event.target.value })}
                options={[
                  { value: "submitted", label: "Submitted" },
                  { value: "approved", label: "Approved" },
                  { value: "published", label: "Published" },
                  { value: "rejected", label: "Rejected" },
                  { value: "archived", label: "Archived" },
                ]}
              />
              <div className="flex gap-3">
                <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="flex-1">
                  <Save size={16} className="inline mr-2" /> Save Project
                </BrutalButton>
                <button
                  type="button"
                  onClick={() => { resetProjectForm(); setShowProjectModal(false); }}
                  className="flex-1 px-6 py-3 border-2 border-[#171717] bg-white hover:bg-slate-100 transition-all font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </BrutalCard>
        </div>
      )}

      {showBlogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <BrutalCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>
                {editingBlogId ? "Edit Blog Post" : "Create Blog Post"}
              </h2>
              <button onClick={() => { resetBlogForm(); setShowBlogModal(false); }} className="p-2 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveBlogPost}>
              <BrutalInput label="Post Title" value={blogForm.title} onChange={(event: any) => setBlogForm({ ...blogForm, title: event.target.value })} required />
              <BrutalTextarea label="Summary" value={blogForm.summary} onChange={(event: any) => setBlogForm({ ...blogForm, summary: event.target.value })} required />
              <BrutalInput label="Tags" value={blogForm.tags} onChange={(event: any) => setBlogForm({ ...blogForm, tags: event.target.value })} placeholder="AI, Events, Research" />
              <BrutalTextarea label="Content" value={blogForm.content} onChange={(event: any) => setBlogForm({ ...blogForm, content: event.target.value })} required />
              <BrutalInput label="Cover Image URL" value={blogForm.coverImageUrl} onChange={(event: any) => setBlogForm({ ...blogForm, coverImageUrl: event.target.value })} />
              <BrutalSelect
                label="Status"
                value={blogForm.status}
                onChange={(event: any) => setBlogForm({ ...blogForm, status: event.target.value })}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "submitted", label: "Submitted" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" },
                ]}
              />
              <div className="flex gap-3">
                <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="flex-1">
                  <Save size={16} className="inline mr-2" /> {editingBlogId ? "Save Post" : "Create Post"}
                </BrutalButton>
                <button
                  type="button"
                  onClick={() => { resetBlogForm(); setShowBlogModal(false); }}
                  className="flex-1 px-6 py-3 border-2 border-[#171717] bg-white hover:bg-slate-100 transition-all font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </BrutalCard>
        </div>
      )}

      {showPartnerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <BrutalCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>
                {editingPartnerId ? "Edit Partner" : "Add Partner"}
              </h2>
              <button onClick={() => { resetPartnerForm(); setShowPartnerModal(false); }} className="p-2 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={savePartner}>
              <BrutalInput label="Partner Name" value={partnerForm.name} onChange={(event: any) => setPartnerForm({ ...partnerForm, name: event.target.value })} required />
              <BrutalInput label="Website URL" type="url" value={partnerForm.websiteUrl} onChange={(event: any) => setPartnerForm({ ...partnerForm, websiteUrl: event.target.value })} />
              <BrutalInput label="Logo URL" type="url" value={partnerForm.logoUrl} onChange={(event: any) => setPartnerForm({ ...partnerForm, logoUrl: event.target.value })} />
              <BrutalInput label="Category" value={partnerForm.category} onChange={(event: any) => setPartnerForm({ ...partnerForm, category: event.target.value })} placeholder="Technology Partner" />
              <BrutalTextarea label="Description" value={partnerForm.description} onChange={(event: any) => setPartnerForm({ ...partnerForm, description: event.target.value })} required />
              <BrutalSelect
                label="Status"
                value={partnerForm.status}
                onChange={(event: any) => setPartnerForm({ ...partnerForm, status: event.target.value })}
                options={[
                  { value: "published", label: "Published" },
                  { value: "approved", label: "Approved" },
                  { value: "archived", label: "Archived" },
                ]}
              />
              <div className="flex gap-3">
                <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="flex-1">
                  <Save size={16} className="inline mr-2" /> Save Partner
                </BrutalButton>
                <button
                  type="button"
                  onClick={() => { resetPartnerForm(); setShowPartnerModal(false); }}
                  className="flex-1 px-6 py-3 border-2 border-[#171717] bg-white hover:bg-slate-100 transition-all font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </BrutalCard>
        </div>
      )}
    </div>
  );
}
