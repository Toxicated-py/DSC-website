import {
  Check, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff,
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare, ListFilter
} from "lucide-react";
import { CertificateRenderer } from "../../../components/CertificateRenderer";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "../AdminPrimitives";

export function EventsTab({ ctx }: { ctx: any }) {
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
{activeTab === "events" && (
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
                  {isFullAdmin && (
                    <button
                      onClick={() => handleArchiveEvent(event.id)}
                      className="flex-1 p-2 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white transition-all font-bold uppercase text-xs"
                    >
                      Archive
                    </button>
                  )}
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
  </>);
}
