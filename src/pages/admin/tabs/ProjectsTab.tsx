import {
  Check, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff,
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare, ListFilter
} from "lucide-react";
import { CertificateRenderer } from "../../../components/CertificateRenderer";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "../AdminPrimitives";

export function ProjectsTab({ ctx }: { ctx: any }) {
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
{activeTab === "projects" && (isFullAdmin || isOrganizerAdmin) && (
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
                      by <span className="font-bold">{project.author}</span> â¢ {project.submittedDate}
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
                      {isFullAdmin && project.status !== "published" && (
                        <button
                          onClick={() => updateProjectStatus(project.id, "published")}
                          className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white hover:bg-green-600 transition-all font-bold uppercase text-xs"
                        >
                          Publish
                        </button>
                      )}
                      {isFullAdmin && (
                        <button
                          onClick={() => updateProjectStatus(project.id, "rejected")}
                          className="px-3 py-1 border-2 border-[#171717] bg-[#FFE800] hover:bg-[#FCD34D] transition-all font-bold uppercase text-xs"
                        >
                          Reject
                        </button>
                      )}
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
                    {isFullAdmin && <button onClick={() => updateProjectStatus(project.id, "archived")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white transition-all font-bold uppercase text-xs">Archive</button>}
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
                    {isFullAdmin && <button onClick={() => updateProjectStatus(project.id, "published")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white hover:bg-green-600 transition-all font-bold uppercase text-xs">Unarchive</button>}
                  </div>
                </div>
              </BrutalCard>
            ))}
            {rejectedProjects.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No rejected or archived projects.</p></BrutalCard>}
          </div>
        </>
      )}
  </>);
}
