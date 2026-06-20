import {
  Check, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff,
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare, ListFilter
} from "lucide-react";
import { CertificateRenderer } from "../../../components/CertificateRenderer";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "../AdminPrimitives";

export function ContentTab({ ctx }: { ctx: any }) {
  const {
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
    answer,
    applyCertificateEvent,
    approvedGallery,
    archivedBlogs,
    archivedEvents,
    archivedPartners,
    assignableRoleOptions,
    attendanceSummary,
    attendees,
    attendeesForEvent,
    auditLogs,
    author,
    blogForm,
    blogPosts,
    blogRows,
    buildCertificateTemplateData,
    canAccessAdmin,
    canManage,
    capacity,
    certificateEventAttendees,
    certificateEventRegistrations,
    certificateForm,
    certificateMemberOptions,
    certificateModal,
    certificatePreviewName,
    certificatePreviewRecipient,
    certificatePreviewRecord,
    certificateRows,
    certificateStatus,
    certificateTemplateOptions,
    checkedIn,
    checkedInCount,
    contactMessages,
    contentStatusStats,
    coordinatorEmails,
    copyCertificateLink,
    createEventFromProposal,
    createdEvent,
    currentRoles,
    data,
    date,
    deleteCertificate,
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
    eventCertificateType,
    eventForm,
    eventProposals,
    eventRegistrations,
    eventRows,
    eventTime,
    eventUtilization,
    events,
    failedDetails,
    filteredAuditLogs,
    filteredEvents,
    filteredProjects,
    filteredUsers,
    findProfileByEmail,
    firstAddress,
    firstEmail,
    firstPhone,
    form,
    gallerySubmissions,
    getRoleBadge,
    handleArchiveEvent,
    handleIssueCertificate,
    handleUserAction,
    isAdmin,
    isCertificateAdmin,
    isCheckedIn,
    isFullAdmin,
    isIssued,
    isOpen,
    isOrganizer,
    isOrganizerAdmin,
    isSelectedRecipientAlreadyIssued,
    isSelectedRecipientCheckedIn,
    issueEventCertificates,
    issuedCertificates,
    issuedRecipientIdsForEvent,
    issuingBulkCertificates,
    label,
    learningMaterials,
    linkTeamMemberToProfile,
    logSearchQuery,
    managerTabs,
    mapped,
    mappedProfiles,
    maxGrowth,
    memberGrowth,
    membershipStatus,
    message,
    monthLabels,
    myProfile,
    name,
    navigate,
    newContactItem,
    newFAQ,
    newSocialLink,
    newTeamMember,
    next,
    nextPrimaryRole,
    nextRoles,
    nextSocialLinks,
    nextTab,
    normalizeCertificateForRenderer,
    normalized,
    normalizedEmail,
    normalizedSettings,
    now,
    ok,
    openAdminTab,
    openBlogModal,
    openEventModal,
    openPartnerModal,
    openProjectModal,
    openReviewPreview,
    openSettingsSections,
    partnerForm,
    partnerSubmissions,
    patch,
    payload,
    pendingBlogs,
    pendingEventProposals,
    pendingGallery,
    pendingProjects,
    pendingReviewCount,
    platform,
    popularEvents,
    position,
    postsThisMonth,
    profile,
    profileById,
    profileFields,
    profileOptions,
    profileToTeamFields,
    profiles,
    projectForm,
    projectRows,
    projects,
    projectsThisMonth,
    publicUrl,
    query,
    question,
    recentAuditLogs,
    refreshCertificateRegistry,
    refreshed,
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
    resource,
    resourceForm,
    reviewPreview,
    revokedCredentialCount,
    role,
    roles,
    rows,
    safeList,
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
    selectedEvent,
    selectedRegistration,
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
    signatureData,
    siteSettings,
    slug,
    statusLabel,
    summary,
    tabs,
    tags,
    technologies,
    templateData,
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
    url,
    users,
    value,
    visibleTabs,
  } = ctx;
  return (<>
{activeTab === "content" && isFullAdmin && (
        <div className="space-y-6">
          <BrutalCard>
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Homepage Content</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <BrutalInput label="Brand Title" value={siteSettings.home.brandTitle} onChange={(e: any) => updateHomeSettings({ brandTitle: e.target.value })} />
              <BrutalInput label="Hero Tagline" value={siteSettings.home.heroTagline} onChange={(e: any) => updateHomeSettings({ heroTagline: e.target.value })} />
            </div>
            <BrutalTextarea label="Hero Description" value={siteSettings.home.heroDescription} onChange={(e: any) => updateHomeSettings({ heroDescription: e.target.value })} />
            <div className="grid md:grid-cols-3 gap-4">
              <BrutalInput label="Membership Label" value={siteSettings.home.membershipLabel} onChange={(e: any) => updateHomeSettings({ membershipLabel: e.target.value })} />
              <BrutalInput label="Membership Title" value={siteSettings.home.membershipTitle} onChange={(e: any) => updateHomeSettings({ membershipTitle: e.target.value })} />
              <BrutalInput label="Membership Description" value={siteSettings.home.membershipDescription} onChange={(e: any) => updateHomeSettings({ membershipDescription: e.target.value })} />
            </div>
            <BrutalTextarea label="Community Intro" value={siteSettings.home.communityIntro} onChange={(e: any) => updateHomeSettings({ communityIntro: e.target.value })} />
            <div className="grid md:grid-cols-3 gap-4">
              <BrutalTextarea label="Member Stat Text" value={siteSettings.home.memberStatDescription} onChange={(e: any) => updateHomeSettings({ memberStatDescription: e.target.value })} />
              <BrutalTextarea label="Event Stat Text" value={siteSettings.home.eventStatDescription} onChange={(e: any) => updateHomeSettings({ eventStatDescription: e.target.value })} />
              <BrutalTextarea label="Project Stat Text" value={siteSettings.home.projectStatDescription} onChange={(e: any) => updateHomeSettings({ projectStatDescription: e.target.value })} />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl uppercase" style={fonts.display}>Homepage Feature Cards</h3>
              {siteSettings.home.featureItems.map((item) => (
                <div key={item.id} className="grid md:grid-cols-[180px_1fr_1fr] gap-4 border-2 border-[#171717] p-4">
                  <select
                    value={item.icon}
                    onChange={(e) => updateHomeFeature(item.id, { icon: e.target.value as any })}
                    className="w-full px-3 py-3 border-2 border-[#171717] bg-white font-mono text-sm brutal-shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFE800]"
                  >
                    <option value="users">Users</option>
                    <option value="database">Database</option>
                    <option value="map">Map</option>
                  </select>
                  <BrutalInput label="Title" value={item.title} onChange={(e: any) => updateHomeFeature(item.id, { title: e.target.value })} />
                  <BrutalTextarea label="Description" value={item.description} onChange={(e: any) => updateHomeFeature(item.id, { description: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <BrutalInput label="CTA Title" value={siteSettings.home.ctaTitle} onChange={(e: any) => updateHomeSettings({ ctaTitle: e.target.value })} />
              <BrutalInput label="CTA Button Label" value={siteSettings.home.ctaButtonLabel} onChange={(e: any) => updateHomeSettings({ ctaButtonLabel: e.target.value })} />
            </div>
            <BrutalTextarea label="CTA Description" value={siteSettings.home.ctaDescription} onChange={(e: any) => updateHomeSettings({ ctaDescription: e.target.value })} />
            <BrutalTextarea label="CTA Closed Message" value={siteSettings.home.ctaClosedMessage} onChange={(e: any) => updateHomeSettings({ ctaClosedMessage: e.target.value })} />
            {settingsStatus && (
              <p className={`mb-4 text-sm font-bold ${settingsStatus.toLowerCase().includes("saved") ? "text-green-700" : "text-red-700"}`}>{settingsStatus}</p>
            )}
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
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
  </>);
}
