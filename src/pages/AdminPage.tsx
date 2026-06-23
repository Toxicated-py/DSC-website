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
import { User, UserCheck, GraduationCap, Settings, Edit, Crown, Calendar, Users, Trophy, Save, X, Eye, Mail, Phone, Globe, Home, FileText, BarChart3, ListFilter } from "lucide-react";
import { adminCreateResource, adminCreateEventFromProposal, adminDeleteContact, adminDeleteResource, adminListAuditLogs, adminListContacts, adminListResource, adminListEventStaff, adminReplaceEventStaff, adminSaveSiteSettings, adminUpdateContactStatus, adminUpdateResource, adminUpdateResourceStatus } from "../lib/adminApi";
import { apiGet } from "../lib/apiClient";
import { ContactItem, defaultSiteSettings, FAQItem, mergeSiteSettings, TeamMember } from "../lib/siteSettings";
import { deleteCertificate as deleteCertificateRecord, getCertificatesByEvent, issueCheckedInBulk, issueSingleCertificate, revokeCertificate, updateCertificate, uploadCertificateTemplateImage, uploadSignatureImage } from "../services/certificateService";
import { CertificateRenderer } from "../components/CertificateRenderer";
import { fonts } from "../config/fonts";
import { AdminAccessDenied, AdminShellHeader, AdminTabs } from "./admin/AdminShell";
import { OverviewTab, UsersTab, EventsTab, ProposalsTab, ProjectsTab, BlogsTab, GalleryTab, PartnersTab, ResourcesTab, ContentTab, ContactsTab, CertificatesTab, SettingsTab, AnalyticsTab, LogsTab } from "./admin/tabs";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "./admin/AdminPrimitives";
import { assignableRoleOptions, certificateTemplateOptions, formatCertificateError, fromDatetimeLocalValue, hasDatePassed, isEventRegistrationOpen, isFullAdminProfile, isOrganizerProfile, isPastEvent, slugify, toDatetimeLocalValue } from "./admin/adminUtils";

const rolePriority = ["president", "admin", "event_manager", "teacher", "student", "member"];
const primaryRoleFrom = (roles: string[]) => rolePriority.find((role) => roles.includes(role)) || "member";


// âââ Reusable Components âââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// âââ Main Admin Panel ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const SettingsSection = ({ id, title, description, children, openSettingsSections, setOpenSettingsSections }: any) => {
  const isOpen = Boolean(openSettingsSections[id]);
  return (
    <BrutalCard>
      <button
        type="button"
        onClick={() => setOpenSettingsSections((sections: Record<string, boolean>) => ({ ...sections, [id]: !sections[id] }))}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        <span className="border-2 border-[#171717] bg-[#FFE800] px-3 py-1 text-xs font-bold uppercase tracking-widest">
          {isOpen ? "Hide" : "Edit"}
        </span>
      </button>
      {isOpen && <div className="mt-6">{children}</div>}
    </BrutalCard>
  );
};

export function ComprehensiveAdminPanel() {
  const navigate = useNavigate();
  const { adminTab } = useParams();
  const [selectedTab, setSelectedTab] = useState(adminTab || "overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [isCertificateAdmin, setIsCertificateAdmin] = useState(false);
  const [certificateStatus, setCertificateStatus] = useState("");
  const [profileOptions, setProfileOptions] = useState<any[]>([]);
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
    templateBackgroundUrl: "",
    templateNameX: 50,
    templateNameY: 45,
    templateNameSize: 74,
    templateDetailY: 57,
    templateNameColor: "#0066B3",
    templateDetailColor: "#073B91",
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
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
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
    slug: "",
    eventType: "WORKSHOP",
    description: "",
    shortDescription: "",
    startTime: "",
    endTime: "",
    venue: "",
    bannerUrl: "",
    googleFormUrl: "",
    capacity: "40",
    status: "approved",
    registrationOpen: true,
    registrationDeadline: "",
    coordinatorEmails: "",
  });
  const [projectForm, setProjectForm] = useState({
    title: "",
    slug: "",
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
    slug: "",
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
  const [savingUser, setSavingUser] = useState(false);
  const [userRoleDraft, setUserRoleDraft] = useState<string[]>(["member"]);
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
  const [savingEvent, setSavingEvent] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [savingBlog, setSavingBlog] = useState(false);
  const [openSettingsSections, setOpenSettingsSections] = useState<Record<string, boolean>>({
    site: true,
    contact: false,
    social: false,
    team: false,
    faqs: false,
  });
  const [newSocialLink, setNewSocialLink] = useState({ platform: "", url: "" });
  const [newContactItem, setNewContactItem] = useState<Omit<ContactItem, "id">>({
    type: "email",
    label: "",
    value: "",
  });
  const [newFAQ, setNewFAQ] = useState<Omit<FAQItem, "id">>({ question: "", answer: "" });
  const [newTeamMember, setNewTeamMember] = useState<Omit<TeamMember, "id">>({
    group: "executive",
    source: "profile",
    profileId: "",
    profileEmail: "",
    name: "",
    position: "",
    meta: "",
    image: "",
    bio: "",
    email: "",
    linkedin: "",
    github: "",
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
    { id: "contacts", label: "Contact", icon: <Mail size={16} /> },
    { id: "certificates", label: "Certificates", icon: <FileText size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
    { id: "logs", label: "Logs", icon: <ListFilter size={16} /> },
  ];
  const isFullAdmin = isFullAdminProfile(adminProfile);
  const isOrganizerAdmin = isOrganizerProfile(adminProfile);
  const canAccessAdmin = isFullAdmin || isOrganizerAdmin;
  const managerTabs = new Set(["events", "projects", "blogs", "gallery"]);
  const visibleTabs = isFullAdmin ? tabs : isOrganizerAdmin ? tabs.filter((tab) => managerTabs.has(tab.id)) : [];
  const activeTab = isFullAdmin ? selectedTab : managerTabs.has(selectedTab) ? selectedTab : "events";
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
    if (!adminProfile || !canAccessAdmin) return;
    if (!visibleTabs.some((tab) => tab.id === selectedTab)) {
      openAdminTab(visibleTabs[0]?.id || "overview", true);
    }
  }, [adminProfile, selectedTab, visibleTabs, canAccessAdmin]);

  useEffect(() => {
    let mounted = true;

    async function loadAdminData() {
      const safeList = async <T,>(loader: Promise<T[]>, label: string): Promise<T[]> => {
        try {
          return await loader;
        } catch (error: any) {
          console.error(`Could not load ${label}`, error);
          if (mounted) {
            setAdminStatus(`Could not load ${label}: ${error.message || "request failed"}`);
          }
          return [];
        }
      };

      const myProfile = await apiGet<any>("/api/me", { auth: true }).catch(() => null);
      if (!mounted || !myProfile) return;
      setAdminProfile(myProfile);
      const isAdmin = isFullAdminProfile(myProfile);
      const isOrganizer = isOrganizerProfile(myProfile);
      const canManage = isAdmin || isOrganizer;
      if (!canManage) return;

      const [
        profileRows,
        projectRowsRaw,
        proposalRows,
        eventRowsRaw,
        blogRowsRaw,
        galleryRows,
        partnerRows,
        resourceRows,
        registrationRows,
        settingsValue,
        contactRows,
        auditRows,
      ] = await Promise.all([
        isAdmin ? safeList(adminListResource<any>("profiles"), "users") : Promise.resolve([myProfile]),
        safeList(adminListResource<any>("projects"), "projects"),
        safeList(adminListResource<any>("event-proposals"), "event proposals"),
        safeList(adminListResource<any>("events"), "events"),
        safeList(adminListResource<any>("blog-posts"), "blogs"),
        safeList(adminListResource<any>("gallery"), "gallery"),
        isAdmin ? safeList(adminListResource<any>("partners"), "partners") : Promise.resolve([]),
        isAdmin ? safeList(adminListResource<any>("learning-materials"), "learning materials") : Promise.resolve([]),
        isAdmin ? safeList(adminListResource<any>("event-registrations"), "event registrations") : Promise.resolve([]),
        apiGet<any>("/api/site-settings").catch(() => null),
        isAdmin ? safeList(adminListContacts<any>(), "contact messages") : Promise.resolve([]),
        isAdmin ? safeList(adminListAuditLogs<any>(), "audit logs") : Promise.resolve([]),
      ]);

      if (!mounted) return;
      const profiles = profileRows || [];
      const profileById = new Map(profiles.map((profile: any) => [profile.id, profile]));
      const canManageCoreContent = isAdmin || isOrganizerProfile(myProfile);
      const projectRows = canManageCoreContent ? projectRowsRaw : (projectRowsRaw || []).filter((project: any) => project.author_id === myProfile.id);
      const blogRows = canManageCoreContent ? blogRowsRaw : (blogRowsRaw || []).filter((post: any) => post.author_id === myProfile.id);
      const eventRows = canManageCoreContent ? eventRowsRaw : (eventRowsRaw || []).filter((event: any) => event.created_by === myProfile.id);
      const mappedProfiles = (profiles || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || profile.email || "Member",
        email: profile.email,
        phone: profile.phone || "",
        role: primaryRoleFrom(Array.isArray(profile.roles) && profile.roles.length ? profile.roles : [profile.role || "member"]),
        roles: Array.isArray(profile.roles) && profile.roles.length ? profile.roles : [profile.role || "member"],
        membershipStatus: profile.membership_status,
        designationStatus: profile.designation_status,
        verified: profile.membership_status === "approved",
        designation: profile.designation || "",
        batchYear: profile.batch_year || "",
        createdAt: profile.created_at,
        joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "",
      }));
      setUsers(mappedProfiles);
      setProfileOptions(profiles || []);
      setProjects((projectRows || []).map((project) => {
        const author = profileById.get(project.author_id);
        return {
          ...project,
          author: author?.full_name || author?.email || "Member",
          submittedDate: project.submitted_at ? new Date(project.submitted_at).toLocaleDateString() : "",
          tags: project.technologies || [],
        };
      }));
      setBlogPosts((blogRows || []).map((post) => {
        const author = profileById.get(post.author_id);
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
      setContactMessages(contactRows || []);
      setAuditLogs(auditRows || []);
      setEventRegistrations(registrationRows || []);
      if (settingsValue) {
        setSiteSettings(mergeSiteSettings(settingsValue));
      }
      setEventProposals((proposalRows || []).map((proposal) => {
        const author = profileById.get(proposal.proposed_by);
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

  useEffect(() => {
    if (!showUserModal) return;
    const roles = Array.isArray(editingItem?.roles) && editingItem.roles.length ? editingItem.roles : [editingItem?.role || "member"];
    const normalizedRoles = roles
      .map((role: string) => String(role).trim().toLowerCase())
      .filter((role: string) => assignableRoleOptions.includes(role));
    if (!normalizedRoles.includes("member")) normalizedRoles.unshift("member");
    setUserRoleDraft(normalizedRoles.length ? normalizedRoles : ["member"]);
  }, [showUserModal, editingItem]);

  const saveSiteSettings = async () => {
    setSettingsStatus("");

    setSavingSettings(true);
    try {
      const firstEmail = siteSettings.contactItems.find((item) => item.type === "email")?.value || siteSettings.contactEmail;
      const firstPhone = siteSettings.contactItems.find((item) => item.type === "phone")?.value || siteSettings.contactPhone;
      const firstAddress = siteSettings.contactItems.find((item) => item.type === "address")?.value || siteSettings.address;
      const normalizedSettings = {
        ...siteSettings,
        contactEmail: firstEmail,
        contactPhone: firstPhone,
        address: firstAddress,
      };

      await adminSaveSiteSettings(normalizedSettings as unknown as Record<string, unknown>);
      setSiteSettings(normalizedSettings);
      setSettingsStatus("Settings saved and connected to the public site.");
    } catch (error: any) {
      const message = error.message || "Could not save settings.";
      setSettingsStatus(
        message.includes("site_settings") || message.includes("schema cache")
          ? "Site settings are not installed in Supabase yet. Run the latest site settings migration, then try again."
          : message
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const updateHomeSettings = (patch: Partial<typeof siteSettings.home>) => {
    setSiteSettings({
      ...siteSettings,
      home: {
        ...siteSettings.home,
        ...patch,
      },
    });
  };

  const updateHomeFeature = (id: string, patch: Partial<typeof siteSettings.home.featureItems[number]>) => {
    setSiteSettings({
      ...siteSettings,
      home: {
        ...siteSettings.home,
        featureItems: siteSettings.home.featureItems.map((item) => item.id === id ? { ...item, ...patch } : item),
      },
    });
  };

  const updateContactItem = (id: string, patch: Partial<ContactItem>) => {
    setSiteSettings({
      ...siteSettings,
      contactItems: siteSettings.contactItems.map((item) => item.id === id ? { ...item, ...patch } : item),
    });
  };

  const removeContactItem = (id: string) => {
    setSiteSettings({
      ...siteSettings,
      contactItems: siteSettings.contactItems.filter((item) => item.id !== id),
    });
  };

  const addContactItem = () => {
    const label = newContactItem.label.trim() || newContactItem.type;
    const value = newContactItem.value.trim();
    if (!value) {
      setSettingsStatus("Add a contact value first.");
      return;
    }

    setSiteSettings({
      ...siteSettings,
      contactItems: [
        ...siteSettings.contactItems,
        {
          id: `${newContactItem.type}-${Date.now()}`,
          type: newContactItem.type,
          label,
          value,
        },
      ],
    });
    setNewContactItem({ type: "email", label: "", value: "" });
    setSettingsStatus("");
  };

  const updateFAQ = (id: string, patch: Partial<FAQItem>) => {
    setSiteSettings({
      ...siteSettings,
      faqs: siteSettings.faqs.map((faq) => faq.id === id ? { ...faq, ...patch } : faq),
    });
  };

  const removeFAQ = (id: string) => {
    setSiteSettings({
      ...siteSettings,
      faqs: siteSettings.faqs.filter((faq) => faq.id !== id),
    });
  };

  const addFAQ = () => {
    const question = newFAQ.question.trim();
    const answer = newFAQ.answer.trim();
    if (!question || !answer) {
      setSettingsStatus("Add both a FAQ question and answer.");
      return;
    }

    setSiteSettings({
      ...siteSettings,
      faqs: [
        ...siteSettings.faqs,
        {
          id: `faq-${Date.now()}`,
          question,
          answer,
        },
      ],
    });
    setNewFAQ({ question: "", answer: "" });
    setSettingsStatus("");
  };

  const updateTeamMember = (id: string, patch: Partial<TeamMember>) => {
    setSiteSettings({
      ...siteSettings,
      teamMembers: siteSettings.teamMembers.map((member) => member.id === id ? { ...member, ...patch } : member),
    });
  };

  const profileToTeamFields = (profile: any) => ({
    profileId: profile?.id || "",
    profileEmail: profile?.email || "",
    name: profile?.full_name || profile?.email || "",
    meta: profile?.designation || profile?.major || "",
    image: profile?.avatar_url || "",
    bio: profile?.bio || "",
    email: profile?.email || "",
    linkedin: profile?.linkedin_username || "",
    github: profile?.github_username || "",
  });

  const findProfileByEmail = (email?: string) => {
    const normalized = (email || "").trim().toLowerCase();
    if (!normalized) return null;
    return profileOptions.find((profile) => String(profile.email || "").toLowerCase() === normalized) || null;
  };

  const linkTeamMemberToProfile = (id: string, email?: string) => {
    const profile = findProfileByEmail(email);
    const normalizedEmail = (email || "").trim().toLowerCase();
    updateTeamMember(id, {
      source: "profile",
      profileEmail: normalizedEmail,
      ...(profile ? profileToTeamFields(profile) : {}),
    });
    setSettingsStatus(profile ? "Profile linked. Save settings to publish this team update." : "No profile found yet. The email is saved and will resolve when that user creates a profile.");
  };

  const removeTeamMember = (id: string) => {
    setSiteSettings({
      ...siteSettings,
      teamMembers: siteSettings.teamMembers.filter((member) => member.id !== id),
    });
  };

  const addTeamMember = () => {
    const profile = newTeamMember.source === "profile" ? findProfileByEmail(newTeamMember.profileEmail) : null;
    const profileFields = profile ? profileToTeamFields(profile) : {};
    const name = (profileFields.name || newTeamMember.name).trim();
    const position = newTeamMember.position.trim();
    if (!position || (!name && !newTeamMember.profileEmail?.trim())) {
      setSettingsStatus("Add a position and either a profile email or manual name.");
      return;
    }

    setSiteSettings({
      ...siteSettings,
      teamMembers: [
        ...siteSettings.teamMembers,
        {
          ...newTeamMember,
          ...profileFields,
          id: `team-${Date.now()}`,
          name,
          position,
          source: newTeamMember.source || "manual",
          profileEmail: (profileFields.profileEmail || newTeamMember.profileEmail || "").trim().toLowerCase(),
          meta: (profileFields.meta || newTeamMember.meta).trim(),
          image: (profileFields.image || newTeamMember.image).trim(),
          bio: (profileFields.bio || newTeamMember.bio).trim(),
          email: (profileFields.email || newTeamMember.email).trim(),
          linkedin: (profileFields.linkedin || newTeamMember.linkedin).trim(),
          github: (profileFields.github || newTeamMember.github).trim(),
        },
      ],
    });
    setNewTeamMember({
      group: "executive",
      source: "profile",
      profileId: "",
      profileEmail: "",
      name: "",
      position: "",
      meta: "",
      image: "",
      bio: "",
      email: "",
      linkedin: "",
      github: "",
    });
    setSettingsStatus("");
  };

  const updateContactMessageStatus = async (id: string, status: "new" | "read" | "archived") => {
    setAdminStatus("");

    try {
      await adminUpdateContactStatus(id, status);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update message.");
      return;
    }

    setContactMessages((messages) =>
      messages.map((message) => message.id === id ? { ...message, status } : message)
    );
    setAdminStatus(status === "archived" ? "Message archived." : "Message updated.");
  };

  const deleteContactMessage = async (id: string) => {
    if (!window.confirm("Delete this contact message permanently?")) return;
    setAdminStatus("");

    try {
      await adminDeleteContact(id);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not delete message.");
      return;
    }

    setContactMessages((messages) => messages.filter((message) => message.id !== id));
    setAdminStatus("Message deleted.");
  };

  const updateSocialLink = (platform: string, url: string) => {
    setSiteSettings({
      ...siteSettings,
      socialLinks: {
        ...siteSettings.socialLinks,
        [platform]: url,
      },
    });
  };

  const removeSocialLink = (platform: string) => {
    const nextSocialLinks = { ...siteSettings.socialLinks };
    delete nextSocialLinks[platform];
    setSiteSettings({ ...siteSettings, socialLinks: nextSocialLinks });
  };

  const addSocialLink = () => {
    const platform = newSocialLink.platform.trim().toLowerCase().replace(/\s+/g, "-");
    const url = newSocialLink.url.trim();
    if (!platform || !url) {
      setSettingsStatus("Add both a platform name and URL.");
      return;
    }
    if (siteSettings.socialLinks[platform]) {
      setSettingsStatus("That social link already exists. Edit the existing field instead.");
      return;
    }
    setSiteSettings({
      ...siteSettings,
      socialLinks: {
        ...siteSettings.socialLinks,
        [platform]: url,
      },
    });
    setNewSocialLink({ platform: "", url: "" });
    setSettingsStatus("");
  };

  // Helper functions
  const getRoleBadge = (role: string, verified: boolean) => {
    if (role === "admin") {
      return <BrutalBadge color="bg-[#FB7185]" className="inline-flex items-center gap-1"><Crown size={10} /> ADMIN</BrutalBadge>;
    }
    if (role === "president") {
      return <BrutalBadge color="bg-[#FB7185]" className="inline-flex items-center gap-1"><Crown size={10} /> PRESIDENT</BrutalBadge>;
    }
    if (role === "event_manager") {
      return <BrutalBadge color="bg-[#7C3AED]" className="inline-flex items-center gap-1"><GraduationCap size={10} /> EVENT MANAGER</BrutalBadge>;
    }
    if (role === "member" && verified) {
      return <BrutalBadge color="bg-[#2563EB]" className="inline-flex items-center gap-1"><UserCheck size={10} /> MEMBER</BrutalBadge>;
    }
    return <BrutalBadge color="bg-slate-400" className="inline-flex items-center gap-1"><User size={10} /> {role === "student" ? "STUDENT" : "MEMBER"}</BrutalBadge>;
  };

  const updateProfile = async (id: string, patch: Record<string, unknown>) => {
    setAdminStatus("");
    try {
      await adminUpdateResource("profiles", id, patch);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update user.");
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

  const saveUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItem?.id || savingUser) return;
    const form = new FormData(event.currentTarget);
    const roles = String(form.get("roles") || "")
      .split(",")
      .map((role) => role.trim().toLowerCase())
      .filter((role) => assignableRoleOptions.includes(role));
    if (!roles.includes("member")) roles.unshift("member");
    const role = primaryRoleFrom(roles);
    const membershipStatus = String(form.get("membership_status") || "pending");
    const patch = {
      full_name: String(form.get("full_name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim() || null,
      batch_year: String(form.get("batch_year") || "").trim() || null,
      role,
      roles,
      designation: String(form.get("designation") || "").trim() || null,
      designation_status: String(form.get("designation") || "").trim() ? "approved" : null,
      membership_status: membershipStatus === "verified" ? "approved" : membershipStatus,
    };

    setAdminStatus("");
    setSavingUser(true);
    try {
      await adminUpdateResource("profiles", editingItem.id, patch);
      setUsers(users.map((user) => user.id === editingItem.id ? {
        ...user,
        ...patch,
        name: patch.full_name || user.name,
        batchYear: patch.batch_year,
        membershipStatus: patch.membership_status,
        designationStatus: patch.designation_status,
        verified: patch.membership_status === "approved",
      } : user));
      setShowUserModal(false);
      setEditingItem(null);
      setAdminStatus("User profile updated.");
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update user profile.");
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUserProfile = async (user: any) => {
    const ok = window.confirm(`Dangerous action: delete the profile for ${user.email || user.name}. This does not delete the Supabase Auth user. Continue?`);
    if (!ok) return;
    try {
      await adminDeleteResource("profiles", user.id);
      setUsers(users.filter((row) => row.id !== user.id));
      setAdminStatus("Profile deleted. Auth user was not deleted.");
    } catch (error: any) {
      const message = String(error.message || "");
      setAdminStatus(
        message.toLowerCase().includes("foreign key")
          ? "This profile has related events, tickets, projects, or certificates. Remove or reassign those records before deleting it."
          : message || "Could not delete profile."
      );
    }
  };

  const toggleUserRole = async (user: any, role: string) => {
    const currentRoles = new Set<string>(Array.isArray(user.roles) ? user.roles : []);
    if (currentRoles.has(role)) {
      currentRoles.delete(role);
    } else {
      currentRoles.add(role);
    }
    currentRoles.add("member");

    const nextRoles = Array.from(currentRoles).filter((role) => assignableRoleOptions.includes(role));
    const nextPrimaryRole = primaryRoleFrom(nextRoles);

    await updateProfile(user.id, { roles: nextRoles, role: nextPrimaryRole });
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
      templateBackgroundUrl: "",
      templateNameX: 50,
      templateNameY: 45,
      templateNameSize: 74,
      templateDetailY: 57,
      templateNameColor: "#0066B3",
      templateDetailColor: "#073B91",
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

  const uploadCertificateTemplate = async (file?: File) => {
    if (!file) return;
    try {
      setCertificateStatus("Uploading certificate template...");
      const publicUrl = await uploadCertificateTemplateImage(file);
      setCertificateForm((current) => ({
        ...current,
        templateStyle: "custom-image",
        templateBackgroundUrl: publicUrl,
      }));
      setCertificateStatus("Certificate template uploaded.");
    } catch (error: any) {
      setCertificateStatus(error.message || "Could not upload certificate template.");
    }
  };

  const buildCertificateTemplateData = () => ({
    background_image_url: certificateForm.templateBackgroundUrl.trim(),
    recipient_x: Number(certificateForm.templateNameX) || 50,
    recipient_y: Number(certificateForm.templateNameY) || 45,
    recipient_font_size: Number(certificateForm.templateNameSize) || 74,
    recipient_color: certificateForm.templateNameColor || "#0066B3",
    detail_y: Number(certificateForm.templateDetailY) || 57,
    detail_color: certificateForm.templateDetailColor || "#073B91",
    show_title: true,
    show_description: true,
    show_event: true,
    show_signatures: true,
    show_verification: true,
  });

  const resetEventForm = () => {
    setEditingItem(null);
    setEventForm({
      title: "",
      slug: "",
      eventType: "WORKSHOP",
      description: "",
      shortDescription: "",
      startTime: "",
      endTime: "",
      venue: "",
      bannerUrl: "",
      googleFormUrl: "",
      capacity: "40",
      status: "approved",
      registrationOpen: true,
      registrationDeadline: "",
      coordinatorEmails: "",
    });
  };

  const resetProjectForm = () => {
    setEditingProjectId("");
    setProjectForm({
      title: "",
      slug: "",
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
      slug: "",
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
      slug: event?.slug || "",
      eventType: event?.event_type || event?.category || "WORKSHOP",
      description: event?.description || "",
      shortDescription: event?.short_description || "",
      startTime: toDatetimeLocalValue(event?.start_time),
      endTime: toDatetimeLocalValue(event?.end_time),
      venue: event?.venue || event?.location || "",
      bannerUrl: event?.banner_url || "",
      googleFormUrl: event?.google_form_url || "",
      capacity: event?.capacity ? String(event.capacity) : "40",
      status: event?.status || "approved",
      registrationOpen: event?.registration_open ?? true,
      registrationDeadline: toDatetimeLocalValue(event?.registration_deadline),
      coordinatorEmails: "",
    });

    if (event?.id) {
      const data = await adminListEventStaff<any>(event.id).catch(() => []);
      setEventForm((current) => ({
        ...current,
        coordinatorEmails: (data || []).map((staff) => staff.email).join(", "),
      }));
    }
    setShowEventModal(true);
  };

  const saveEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingEvent) return;

    const slug = slugify(eventForm.slug || eventForm.title);
    const payload = {
      title: eventForm.title,
      slug,
      event_type: eventForm.eventType,
      description: eventForm.description,
      short_description: eventForm.shortDescription || eventForm.description.slice(0, 160),
      start_time: fromDatetimeLocalValue(eventForm.startTime),
      end_time: fromDatetimeLocalValue(eventForm.endTime),
      venue: eventForm.venue,
      banner_url: eventForm.bannerUrl || null,
      google_form_url: eventForm.googleFormUrl || null,
      capacity: Number(eventForm.capacity) || 40,
      status: eventForm.status,
      registration_open: eventForm.registrationOpen,
      registration_deadline: fromDatetimeLocalValue(eventForm.registrationDeadline),
      created_by: editingItem?.created_by || adminProfile?.id || null,
    };

    let savedEvent: any;
    try {
      setSavingEvent(true);
      savedEvent = editingItem?.id
        ? await adminUpdateResource("events", editingItem.id, payload)
        : await adminCreateResource("events", payload);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not save event.");
      return;
    } finally {
      setSavingEvent(false);
    }

    const coordinatorEmails = eventForm.coordinatorEmails
      .split(/[,\n]/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    await adminReplaceEventStaff(savedEvent.id, coordinatorEmails);

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
    try {
      await adminUpdateResourceStatus("events", id, "archived");
    } catch (error: any) {
      setAdminStatus(error.message || "Could not archive event.");
      return;
    }
    setEvents(events.map(e => e.id === id ? { ...e, status: "archived" } : e));
  };

  const deleteContentItem = async (resource: "events" | "projects" | "blog-posts" | "gallery", id: string, label: string) => {
    if (!window.confirm(`Delete this ${label} permanently?`)) return;
    try {
      await adminDeleteResource(resource, id);
    } catch (error: any) {
      setAdminStatus(error.message || `Could not delete ${label}.`);
      return;
    }
    if (resource === "events") setEvents(events.filter((item) => item.id !== id));
    if (resource === "projects") setProjects(projects.filter((item) => item.id !== id));
    if (resource === "blog-posts") setBlogPosts(blogPosts.filter((item) => item.id !== id));
    if (resource === "gallery") setGallerySubmissions(gallerySubmissions.filter((item) => item.id !== id));
    setAdminStatus(`${label} deleted.`);
  };

  const updateEventStatus = async (id: string, status: string) => {
    try {
      await adminUpdateResourceStatus("events", id, status);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update event.");
      return;
    }
    setEvents(events.map((event) => event.id === id ? { ...event, status, featured: status === "published" } : event));
    setAdminStatus(status === "archived" ? "Event archived." : "Event restored.");
  };

  const toggleEventRegistration = async (event: any) => {
    const next = !isEventRegistrationOpen(event);
    const patch: Record<string, any> = { registration_open: next };
    if (next && hasDatePassed(event.registration_deadline)) {
      patch.registration_deadline = null;
    }
    try {
      await adminUpdateResource("events", event.id, patch);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update registration.");
      return;
    }
    setEvents(events.map((row) => row.id === event.id ? { ...row, ...patch } : row));
  };

  const updateProjectStatus = async (id: string, status: string) => {
    try {
      await adminUpdateResource("projects", id, {
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      });
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update project.");
      return;
    }
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
  };

  const openProjectModal = (project: any) => {
    setAdminStatus("");
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title || "",
      slug: project.slug || "",
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
    if (savingProject) return;
    if (!editingProjectId) return;
    const technologies = projectForm.technologies
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const payload = {
      title: projectForm.title,
      slug: slugify(projectForm.slug || projectForm.title),
      category: projectForm.category,
      team: projectForm.team || null,
      technologies,
      summary: projectForm.summary,
      content: projectForm.content,
      thumbnail_url: projectForm.thumbnailUrl || null,
      status: projectForm.status,
      published_at: projectForm.status === "published" ? new Date().toISOString() : null,
    };
    let data: any;
    try {
      setSavingProject(true);
      data = await adminUpdateResource("projects", editingProjectId, payload);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update project.");
      return;
    } finally {
      setSavingProject(false);
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
    try {
      await adminUpdateResourceStatus("event-proposals", id, status);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update proposal.");
      return;
    }
    setEventProposals(eventProposals.map(p => p.id === id ? { ...p, status } : p));
  };

  const createEventFromProposal = async (proposal: any) => {
    if (proposal.status !== "pending") {
      setAdminStatus("This proposal has already been reviewed.");
      return;
    }
    let result: any;
    try {
      result = await adminCreateEventFromProposal(proposal.id);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not create event from proposal.");
      return;
    }
    setEventProposals(eventProposals.map((row) => row.id === proposal.id ? { ...row, status: "approved" } : row));
    const createdEvent = result.event;
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
    setAdminStatus(result.status === "already_exists" ? "Proposal was already created as an event. Marked approved." : "Event created from proposal.");
  };

  const updateBlogStatus = async (id: string, status: string) => {
    try {
      await adminUpdateResourceStatus("blog-posts", id, status);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update blog post.");
      return;
    }
    setBlogPosts(blogPosts.map((post) => post.id === id ? { ...post, status } : post));
  };

  const openBlogModal = (post?: any) => {
    setAdminStatus("");
    setEditingBlogId(post?.id || "");
    setBlogForm({
      title: post?.title || "",
      slug: post?.slug || "",
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
    if (savingBlog) return;
    const tags = blogForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const payload = {
      title: blogForm.title,
      slug: slugify(blogForm.slug || blogForm.title),
      summary: blogForm.summary,
      tags,
      content: blogForm.content,
      cover_image_url: blogForm.coverImageUrl || null,
      status: blogForm.status,
      published_at: blogForm.status === "published" ? new Date().toISOString() : new Date().toISOString(),
    };
    let data: any;
    try {
      setSavingBlog(true);
      data = editingBlogId
        ? await adminUpdateResource("blog-posts", editingBlogId, payload)
        : await adminCreateResource("blog-posts", payload);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not save blog post.");
      return;
    } finally {
      setSavingBlog(false);
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
    const resource = table === "gallery_submissions" ? "gallery" : "partners";
    try {
      await adminUpdateResource(resource, id, {
        status,
        reviewed_at: new Date().toISOString(),
      });
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update submission.");
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
    const payload = {
      name: partnerForm.name.trim(),
      website_url: partnerForm.websiteUrl.trim() || null,
      logo_url: partnerForm.logoUrl.trim() || null,
      category: partnerForm.category.trim() || "Partner",
      description: partnerForm.description.trim(),
      status: partnerForm.status,
      reviewed_at: new Date().toISOString(),
    };
    let data: any;
    try {
      data = editingPartnerId
        ? await adminUpdateResource("partners", editingPartnerId, payload)
        : await adminCreateResource("partners", payload);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not save partner.");
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
    if (!window.confirm("Delete this partner?")) return;
    try {
      await adminDeleteResource("partners", id);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not delete partner.");
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
    let data: any;
    try {
      data = await adminCreateResource("learning-materials", {
        title: resourceForm.title,
        category: resourceForm.category,
        description: resourceForm.description,
        resource_url: resourceForm.resourceUrl,
        status: "published",
      });
    } catch (error: any) {
      setAdminStatus(error.message || "Could not publish learning material.");
      return;
    }
    setLearningMaterials([data, ...learningMaterials]);
    setResourceForm({ title: "", category: "General", description: "", resourceUrl: "" });
    setAdminStatus("Learning material published.");
  };

  const deleteLearningMaterial = async (id: string) => {
    if (!window.confirm("Delete this learning material?")) return;
    try {
      await adminDeleteResource("learning-materials", id);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not delete learning material.");
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
    if (certificateForm.templateStyle === "custom-image" && !certificateForm.templateBackgroundUrl.trim()) {
      setCertificateStatus("Add a blank template image URL before issuing a custom-image certificate.");
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
    const templateData = buildCertificateTemplateData();

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
          template_data: templateData,
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
          template_data: templateData,
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
    if (certificateForm.templateStyle === "custom-image" && !certificateForm.templateBackgroundUrl.trim()) {
      setCertificateStatus("Add a blank template image URL before issuing custom-image certificates.");
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
    const templateData = buildCertificateTemplateData();

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
        template_data: templateData,
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
    const templateData = certificate.template_data && typeof certificate.template_data === "object" ? certificate.template_data : {};
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
      templateBackgroundUrl: templateData.background_image_url || "",
      templateNameX: templateData.recipient_x ?? 50,
      templateNameY: templateData.recipient_y ?? 45,
      templateNameSize: templateData.recipient_font_size ?? 74,
      templateDetailY: templateData.detail_y ?? 57,
      templateNameColor: templateData.recipient_color || "#0066B3",
      templateDetailColor: templateData.detail_color || "#073B91",
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
        await adminUpdateResource("certificates", certificate.id, { status: "valid" });
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
  const visibleEvents = filteredEvents.filter((event) => event.status !== "archived" && event.status !== "rejected");
  const activeEvents = visibleEvents.filter((event) => !isPastEvent(event));
  const pastEvents = visibleEvents.filter((event) => isPastEvent(event));
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
  const attendanceSummary = `${checkedInCount}/${registrationsCount}`;
  const projectsThisMonth = projects.filter((project) => {
    const date = project.published_at || project.submitted_at;
    return date && new Date(date).toISOString().slice(0, 7) === thisMonth;
  }).length;
  const postsThisMonth = blogPosts.filter((post) => post.published_at && new Date(post.published_at).toISOString().slice(0, 7) === thisMonth).length;
  const activeMemberCount = users.filter((user) => user.membershipStatus === "approved").length;
  const activeEventCount = events.filter((event) => event.status === "approved" || event.status === "published").length;
  const upcomingEventCount = events.filter((event) => {
    const eventTime = event.start_time || event.startTime;
    return (event.status === "approved" || event.status === "published") && eventTime && new Date(eventTime) >= now;
  }).length;
  const pendingReviewCount = pendingEventProposals.length + pendingProjects.length + pendingBlogs.length + pendingGallery.length;
  const contentStatusStats = [
    { label: "Projects", active: activeProjects.length, pending: pendingProjects.length, archived: rejectedProjects.length },
    { label: "Blogs", active: activeBlogs.length, pending: pendingBlogs.length, archived: archivedBlogs.length },
    { label: "Gallery", active: approvedGallery.length, pending: pendingGallery.length, archived: rejectedGallery.length },
    { label: "Partners", active: activePartners.length, pending: 0, archived: archivedPartners.length },
    { label: "Resources", active: learningMaterials.filter((item) => item.status === "published" || item.status === "approved").length, pending: learningMaterials.filter((item) => item.status === "pending" || item.status === "submitted" || item.status === "draft").length, archived: learningMaterials.filter((item) => item.status === "archived" || item.status === "rejected").length },
  ];
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
  const eventUtilization = [...events]
    .filter((event) => event.status !== "archived" && event.status !== "rejected")
    .map((event) => {
      const capacity = Number(event.capacity || 0);
      const attendees = Number(event.attendees || event.registeredCount || event.registered_count || 0);
      const checkedIn = Number(event.checkedIn || 0);
      return {
        ...event,
        capacity,
        attendees,
        checkedIn,
        fillRate: capacity ? Math.min(100, Math.round((attendees / capacity) * 100)) : 0,
      };
    })
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 6);
  const recentAuditLogs = auditLogs.slice(0, 6);
  const filteredAuditLogs = auditLogs.filter((log) => {
    const query = logSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      log.actor_email,
      log.action,
      log.resource,
      log.resource_id,
      log.summary,
      log.created_at,
      JSON.stringify(log.metadata || {}),
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
  const todayAuditCount = auditLogs.filter((log) => log.created_at && new Date(log.created_at).toDateString() === now.toDateString()).length;
  const destructiveAuditCount = auditLogs.filter((log) => ["delete", "revoke"].includes(log.action)).length;
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
    template_data: buildCertificateTemplateData(),
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
    template_data: certificate.template_data && typeof certificate.template_data === "object" ? certificate.template_data : {},
    verification_code: certificate.verification_code || "CLUB-YYYY-00000",
    event_title_snapshot: certificate.event_title_snapshot || certificate.events?.title || "Event",
    recipient_name_snapshot: certificate.recipient_name_snapshot || "Participant",
    status: certificate.status === "revoked" || certificate.status === "archived" ? "revoked" as const : "valid" as const,
    created_at: certificate.created_at || new Date().toISOString(),
  });
  const activeCredentialCount = issuedCertificates.filter((certificate) => certificate.status !== "revoked" && certificate.status !== "archived").length;
  const revokedCredentialCount = issuedCertificates.filter((certificate) => certificate.status === "revoked" || certificate.status === "archived").length;
  const adminTabContext = {
    SettingsSection,
    activeBlogs,
    activeCredentialCount,
    activeEventCount,
    activeEvents,
    activeMemberCount,
    activePartners,
    activeProjects,
    activeTab,
    addCertificateSignature,
    addContactItem,
    addFAQ,
    addLearningMaterial,
    addSocialLink,
    addTeamMember,
    adminProfile,
    adminStatus,
    alreadyIssuedCertificateAttendees,
    applyCertificateEvent,
    approvedGallery,
    archivedBlogs,
    archivedEvents,
    archivedPartners,
    assignableRoleOptions,
    attendanceSummary,
    auditLogs,
    blogForm,
    blogPosts,
    buildCertificateTemplateData,
    canAccessAdmin,
    certificateEventAttendees,
    certificateEventRegistrations,
    certificateForm,
    certificateMemberOptions,
    certificateModal,
    certificatePreviewName,
    certificatePreviewRecipient,
    certificatePreviewRecord,
    certificateStatus,
    certificateTemplateOptions,
    checkedInCount,
    contactMessages,
    contentStatusStats,
    copyCertificateLink,
    createEventFromProposal,
    deleteCertificate,
    deleteContentItem,
    deleteContactMessage,
    deleteLearningMaterial,
    deletePartner,
    deleteUserProfile,
    destructiveAuditCount,
    editCertificate,
    editingBlogId,
    editingCertificateId,
    editingItem,
    editingPartnerId,
    editingProjectId,
    eligibleCertificateAttendees,
    eventForm,
    eventProposals,
    eventRegistrations,
    eventUtilization,
    events,
    filteredAuditLogs,
    filteredEvents,
    filteredProjects,
    filteredUsers,
    findProfileByEmail,
    fonts,
    formatCertificateError,
    gallerySubmissions,
    getRoleBadge,
    handleArchiveEvent,
    handleIssueCertificate,
    handleUserAction,
    isCertificateAdmin,
    isFullAdmin: isFullAdmin || isOrganizerAdmin,
    isOrganizerAdmin,
    isSelectedRecipientAlreadyIssued,
    isSelectedRecipientCheckedIn,
    issueEventCertificates,
    issuedCertificates,
    issuedRecipientIdsForEvent,
    issuingBulkCertificates,
    learningMaterials,
    linkTeamMemberToProfile,
    logSearchQuery,
    managerTabs,
    maxGrowth,
    memberGrowth,
    monthLabels,
    navigate,
    newContactItem,
    newFAQ,
    newSocialLink,
    newTeamMember,
    normalizeCertificateForRenderer,
    now,
    openAdminTab,
    openBlogModal,
    openEventModal,
    openPartnerModal,
    openProjectModal,
    openReviewPreview,
    openSettingsSections,
    partnerForm,
    partnerSubmissions,
    pastEvents,
    pendingBlogs,
    pendingEventProposals,
    pendingGallery,
    pendingProjects,
    pendingReviewCount,
    popularEvents,
    postsThisMonth,
    profileOptions,
    profileToTeamFields,
    projectForm,
    projects,
    projectsThisMonth,
    recentAuditLogs,
    refreshCertificateRegistry,
    registrationsCount,
    rejectedEventProposals,
    rejectedGallery,
    rejectedProjects,
    removeCertificateSignature,
    removeContactItem,
    removeFAQ,
    removeSocialLink,
    removeTeamMember,
    resetBlogForm,
    resetCertificateForm,
    resetEventForm,
    resetPartnerForm,
    resetProjectForm,
    resourceForm,
    reviewPreview,
    revokedCredentialCount,
    saveBlogPost,
    saveEvent,
    savePartner,
    saveProject,
    saveSiteSettings,
    saveUser,
    savingBlog,
    savingEvent,
    savingProject,
    savingSettings,
    savingUser,
    searchQuery,
    selectedCertificateEvent,
    selectedTab,
    setAdminProfile,
    setAdminStatus,
    setAuditLogs,
    setBlogForm,
    setBlogPosts,
    setCertificateForm,
    setCertificateModal,
    setCertificateRevoked,
    setCertificateStatus,
    setContactMessages,
    setEditingBlogId,
    setEditingCertificateId,
    setEditingItem,
    setEditingPartnerId,
    setEditingProjectId,
    setEventForm,
    setEventProposals,
    setEventRegistrations,
    setEvents,
    setGallerySubmissions,
    setIsCertificateAdmin,
    setIssuedCertificates,
    setIssuingBulkCertificates,
    setLearningMaterials,
    setLogSearchQuery,
    setNewContactItem,
    setNewFAQ,
    setNewSocialLink,
    setNewTeamMember,
    setOpenSettingsSections,
    setPartnerForm,
    setPartnerSubmissions,
    setProfileOptions,
    setProjectForm,
    setProjects,
    setResourceForm,
    setReviewPreview,
    setSavingBlog,
    setSavingEvent,
    setSavingProject,
    setSavingSettings,
    setSavingUser,
    setSearchQuery,
    setSelectedTab,
    setSettingsStatus,
    setShowBlogModal,
    setShowEventModal,
    setShowPartnerModal,
    setShowProjectModal,
    setShowUserModal,
    setSiteSettings,
    setUsers,
    settingsStatus,
    showBlogModal,
    showEventModal,
    showPartnerModal,
    showProjectModal,
    showUserModal,
    siteSettings,
    tabs,
    thisMonth,
    todayAuditCount,
    toggleEventRegistration,
    toggleUserRole,
    uncheckedCertificateAttendees,
    upcomingEventCount,
    updateBlogStatus,
    updateCertificateSignature,
    updateContactItem,
    updateContactMessageStatus,
    updateEventStatus,
    updateFAQ,
    updateHomeFeature,
    updateHomeSettings,
    updateProfile,
    updateProjectStatus,
    updateProposalStatus,
    updateSocialLink,
    updateSubmissionStatus,
    updateTeamMember,
    uploadCertificateSignature,
    uploadCertificateTemplate,
    users,
    visibleTabs,
  };

  if (adminProfile && !canAccessAdmin) {
    return <AdminAccessDenied navigate={navigate} />;
  }

  return (
    <div className="pt-32 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto min-h-screen bg-[#F4EFEB]">
      <AdminShellHeader isFullAdmin={isFullAdmin} navigate={navigate} />
      <AdminTabs visibleTabs={visibleTabs} activeTab={activeTab} openAdminTab={openAdminTab} />

      {adminStatus && (
        <div className="mb-6 border-2 border-[#171717] bg-[#FFE800] p-4 font-bold text-sm">
          {adminStatus}
        </div>
      )}

      {/* âââ OVERVIEW TAB âââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <OverviewTab ctx={adminTabContext} />

      {/* âââ USERS TAB âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <UsersTab ctx={adminTabContext} />

      {/* âââ EVENTS TAB ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <EventsTab ctx={adminTabContext} />

      {/* âââ PROJECTS TAB âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <ProposalsTab ctx={adminTabContext} />

      <ProjectsTab ctx={adminTabContext} />

      {/* âââ CONTENT TAB âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      {["blogs", "gallery", "partners", "resources"].includes(activeTab) && (isFullAdmin || (isOrganizerAdmin && ["blogs", "gallery"].includes(activeTab))) && (
        <div className="space-y-6">
          <BlogsTab ctx={adminTabContext} />

          <GalleryTab ctx={adminTabContext} />

          <PartnersTab ctx={adminTabContext} />

          <ResourcesTab ctx={adminTabContext} />
        </div>
      )}

      <ContentTab ctx={adminTabContext} />

      {/* âââ CONTACT INBOX TAB âââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <ContactsTab ctx={adminTabContext} />
      {activeTab === "certificates" && isFullAdmin && <CertificatesTab />}

      {/* âââ SETTINGS TAB ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <SettingsTab ctx={adminTabContext} />

      {/* âââ ANALYTICS TAB ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <AnalyticsTab ctx={adminTabContext} />

      <LogsTab ctx={adminTabContext} />

      {/* âââ MODALS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}

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
                    {reviewPreview.preview.imageUrl && <img loading="lazy" src={reviewPreview.preview.imageUrl} alt={reviewPreview.preview.title} className="w-full h-56 object-cover border-b-2 border-[#171717]" />}
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
                    {reviewPreview.preview.imageUrl && <img loading="lazy" src={reviewPreview.preview.imageUrl} alt={reviewPreview.preview.title} className="w-full h-56 object-cover border-b-2 border-[#171717]" />}
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
                    <img loading="lazy" src={reviewPreview.preview.imageUrl} alt={reviewPreview.preview.title} className="w-full h-80 object-cover border-b-2 border-[#171717]" />
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
            <form onSubmit={saveUser}>
              <BrutalInput name="full_name" label="Full Name" defaultValue={editingItem?.name || ""} />
              <BrutalInput name="email" label="Email" type="email" defaultValue={editingItem?.email || ""} />
              <div className="grid md:grid-cols-2 gap-4">
                <BrutalInput name="phone" label="Phone" defaultValue={editingItem?.phone || ""} />
                <BrutalInput name="batch_year" label="Batch / Year" defaultValue={editingItem?.batchYear || editingItem?.batch_year || ""} />
              </div>
              <input type="hidden" name="roles" value={userRoleDraft.join(",")} />
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {assignableRoleOptions.map((role) => {
                    const active = userRoleDraft.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        disabled={role === "member"}
                        onClick={() => {
                          if (role === "member") return;
                          setUserRoleDraft((current) => {
                            const next = current.includes(role) ? current.filter((item) => item !== role) : [...current, role];
                            return next.includes("member") ? next : ["member", ...next];
                          });
                        }}
                        className={`border-2 border-[#171717] px-3 py-2 text-xs font-bold uppercase tracking-widest ${
                          active ? "bg-[#2563EB] text-white" : "bg-white text-[#171717]"
                        } ${role === "member" ? "cursor-not-allowed opacity-80" : "hover:bg-[#FFE800]"}`}
                      >
                        {role.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500">
                  Primary role: {primaryRoleFrom(userRoleDraft).replace("_", " ")}
                </p>
              </div>
              <BrutalInput name="designation" label="Designation (admin assigned)" defaultValue={editingItem?.designation || ""} />
              <BrutalSelect
                name="membership_status"
                label="Status"
                defaultValue={editingItem?.membershipStatus || (editingItem?.verified ? "approved" : "pending")}
                options={[
                  { value: "approved", label: "Verified" },
                  { value: "pending", label: "Pending" },
                ]}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="flex-1" disabled={savingUser}>
                  <Save size={16} className="inline mr-2" /> {savingUser ? "Saving..." : "Save User"}
                </BrutalButton>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-[#171717] bg-white hover:bg-slate-100 transition-all font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
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
              <BrutalInput label="Slug" value={eventForm.slug} onChange={(event: any) => setEventForm({ ...eventForm, slug: event.target.value })} placeholder="power-bi-workshop" />
              <BrutalTextarea label="Description" value={eventForm.description} onChange={(event: any) => setEventForm({ ...eventForm, description: event.target.value })} required />
              <BrutalInput label="Short Description" value={eventForm.shortDescription} onChange={(event: any) => setEventForm({ ...eventForm, shortDescription: event.target.value })} />
              <BrutalInput label="Banner Image URL" value={eventForm.bannerUrl} onChange={(event: any) => setEventForm({ ...eventForm, bannerUrl: event.target.value })} placeholder="https://..." />
              <BrutalInput label="Guest Google Form URL" value={eventForm.googleFormUrl} onChange={(event: any) => setEventForm({ ...eventForm, googleFormUrl: event.target.value })} placeholder="https://docs.google.com/forms/..." />
              <div className="grid md:grid-cols-2 gap-4">
                <BrutalInput label="Start Time" type="datetime-local" value={eventForm.startTime} onChange={(event: any) => setEventForm({ ...eventForm, startTime: event.target.value })} />
                <BrutalInput label="End Time" type="datetime-local" value={eventForm.endTime} onChange={(event: any) => setEventForm({ ...eventForm, endTime: event.target.value })} />
              </div>
              <BrutalInput label="Registration Deadline" type="datetime-local" value={eventForm.registrationDeadline} onChange={(event: any) => setEventForm({ ...eventForm, registrationDeadline: event.target.value })} />
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
                <BrutalButton type="submit" color="bg-[#7C3AED]" text="text-white" className="flex-1" disabled={savingEvent}>
                  <Save size={16} className="inline mr-2" /> {savingEvent ? "Saving..." : "Save Event"}
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
              <BrutalInput label="Slug" value={projectForm.slug} onChange={(event: any) => setProjectForm({ ...projectForm, slug: event.target.value })} placeholder="data-analysis-dashboard" />
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
                <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="flex-1" disabled={savingProject}>
                  <Save size={16} className="inline mr-2" /> {savingProject ? "Saving..." : "Save Project"}
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
              <BrutalInput label="Slug" value={blogForm.slug} onChange={(event: any) => setBlogForm({ ...blogForm, slug: event.target.value })} placeholder="my-first-post" />
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
                <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="flex-1" disabled={savingBlog}>
                  <Save size={16} className="inline mr-2" /> {savingBlog ? "Saving..." : editingBlogId ? "Save Post" : "Create Post"}
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
