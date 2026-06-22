import { Mail } from "lucide-react";

import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalCard } from "../AdminPrimitives";

export function ContactsTab({ ctx }: { ctx: any }) {
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
{activeTab === "contacts" && isFullAdmin && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <BrutalCard color="bg-[#2563EB]" className="text-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{contactMessages.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Total Messages</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FFE800]">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{contactMessages.filter((message) => message.status === "new").length}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">New</div>
            </BrutalCard>
            <BrutalCard color="bg-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{contactMessages.filter((message) => message.status === "read").length}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Read</div>
            </BrutalCard>
          </div>

          <BrutalCard>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Contact Inbox</h2>
                <p className="text-sm text-slate-600">Messages sent from the public contact page appear here.</p>
              </div>
              <BrutalBadge color="bg-[#FB7185]">
                {contactMessages.filter((message) => message.status === "new").length} Unread
              </BrutalBadge>
            </div>

            {contactMessages.length === 0 ? (
              <div className="border-2 border-dashed border-[#171717] p-10 text-center">
                <Mail size={36} className="mx-auto mb-3 text-[#2563EB]" />
                <p className="font-bold uppercase tracking-widest">No contact messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((message) => (
                  <div key={message.id} className={`border-2 border-[#171717] p-4 ${message.status === "new" ? "bg-[#FFF7A8]" : "bg-white"}`}>
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <BrutalBadge color={message.status === "new" ? "bg-[#FFE800]" : message.status === "archived" ? "bg-slate-300" : "bg-[#22C55E]"}>
                            {message.status}
                          </BrutalBadge>
                          <span className="text-xs font-mono text-slate-500">
                            {message.created_at ? new Date(message.created_at).toLocaleString() : "Unknown time"}
                          </span>
                        </div>
                        <h3 className="text-xl uppercase mb-1" style={fonts.display}>{message.subject}</h3>
                        <p className="text-sm font-mono text-slate-600 mb-3">
                          {message.name} - <a href={`mailto:${message.email}`} className="underline">{message.email}</a>
                        </p>
                        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                      </div>
                      <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => updateContactMessageStatus(message.id, message.status === "new" ? "read" : "new")}
                          className="px-3 py-2 border-2 border-[#171717] bg-white text-xs font-bold uppercase tracking-widest hover:bg-[#F4EFEB]"
                        >
                          {message.status === "new" ? "Mark Read" : "Mark New"}
                        </button>
                        <button
                          onClick={() => updateContactMessageStatus(message.id, "archived")}
                          className="px-3 py-2 border-2 border-[#171717] bg-[#FFE800] text-xs font-bold uppercase tracking-widest hover:bg-yellow-300"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => deleteContactMessage(message.id)}
                          className="px-3 py-2 border-2 border-[#171717] bg-[#FB7185] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#F43F5E]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BrutalCard>
        </div>
      )}
  </>);
}
