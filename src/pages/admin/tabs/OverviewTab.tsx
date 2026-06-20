import { User, Calendar, Users, Trophy, Plus, Activity } from "lucide-react";

import { fonts } from "../../../config/fonts";
import { BrutalCard } from "../AdminPrimitives";

export function OverviewTab({ ctx }: { ctx: any }) {
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
{activeTab === "overview" && isFullAdmin && (
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
  </>);
}
