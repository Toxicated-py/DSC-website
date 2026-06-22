import { Edit } from "lucide-react";

import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalCard } from "../AdminPrimitives";

export function BlogsTab({ ctx }: { ctx: any }) {
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
{activeTab === "blogs" && (
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
                        {isFullAdmin && post.status !== "published" && (
                          <button onClick={() => updateBlogStatus(post.id, "published")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Publish</button>
                        )}
                        {isFullAdmin && <button onClick={() => updateBlogStatus(post.id, "archived")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Archive</button>}
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
                        {isFullAdmin && <button onClick={() => updateBlogStatus(post.id, "archived")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Archive</button>}
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
                        {isFullAdmin && <button onClick={() => updateBlogStatus(post.id, "published")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Unarchive</button>}
                      </div>
                    </div>
                  </BrutalCard>
                ))}
                {archivedBlogs.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No archived or rejected blog posts.</p></BrutalCard>}
              </div>
            </>
          )}
  </>);
}
