import type { AdminTabContext } from "../types";
import { Search, Edit, Calendar, MapPin, Users, Plus, Star, MessageSquare } from "lucide-react";

import { fonts } from "../../../config/fonts";
import { isEventRegistrationOpen } from "../adminUtils";
import { BrutalBadge, BrutalCard } from "../AdminPrimitives";

export function EventsTab({ ctx }: { ctx: AdminTabContext }) {
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
    pastEvents,
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
                className="w-full border-2 border-foreground p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all brutal-shadow"
              />
            </div>
            {isFullAdmin && (
              <button
                onClick={() => void openEventModal()}
                className="px-6 py-3 bg-violet-600 text-white border-2 border-foreground font-bold uppercase tracking-widest text-sm brutal-shadow brutal-shadow-hover flex items-center gap-2 justify-center"
              >
                <Plus size={16} /> Create Event
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => {
              const registrationOpen = isEventRegistrationOpen(event);
              return (
              <BrutalCard key={event.id} color="bg-white">
                <div className="flex items-start justify-between mb-4">
                  <BrutalBadge color={event.status === "Upcoming" ? "bg-primary" : "bg-slate-400"}>
                    {event.status}
                  </BrutalBadge>
                  {event.featured && <Star size={16} className="text-highlight fill-highlight" />}
                </div>
                <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={14} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users size={14} />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
                <BrutalBadge color="bg-highlight" text="text-foreground" className="mb-4">
                  {event.category}
                </BrutalBadge>
                <div className="flex gap-2 pt-4 border-t-2 border-slate-200">
                  <button
                    onClick={() => void openEventModal(event)}
                    className="flex-1 p-2 border-2 border-foreground bg-white hover:bg-primary hover:text-white transition-all font-bold uppercase text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleEventRegistration(event)}
                    className="flex-1 p-2 border-2 border-foreground bg-white hover:bg-highlight transition-all font-bold uppercase text-xs"
                  >
                    {registrationOpen ? "Close Reg" : "Open Reg"}
                  </button>
                  {isFullAdmin && (
                    <button
                      onClick={() => handleArchiveEvent(event.id)}
                      className="flex-1 p-2 border-2 border-foreground bg-white hover:bg-secondary hover:text-white transition-all font-bold uppercase text-xs"
                    >
                      Archive
                    </button>
                  )}
                  {isFullAdmin && (
                    <button onClick={() => deleteContentItem("events", event.id, "event")} className="flex-1 p-2 border-2 border-foreground bg-secondary text-white hover:bg-destructive transition-all font-bold uppercase text-xs">
                      Delete
                    </button>
                  )}
                </div>
              </BrutalCard>
            );
            })}
          </div>

          {pastEvents.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Past Events</h2>
                <BrutalBadge color="bg-slate-400">{pastEvents.length}</BrutalBadge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <BrutalCard key={event.id} color="bg-white">
                    <BrutalBadge color="bg-slate-400" className="mb-4">Past</BrutalBadge>
                    <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar size={14} />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users size={14} />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t-2 border-slate-200">
                      <button onClick={() => void openEventModal(event)} className="flex-1 p-2 border-2 border-foreground bg-white hover:bg-primary hover:text-white transition-all font-bold uppercase text-xs">Edit</button>
                      {isFullAdmin && <button onClick={() => handleArchiveEvent(event.id)} className="flex-1 p-2 border-2 border-foreground bg-white hover:bg-secondary hover:text-white transition-all font-bold uppercase text-xs">Archive</button>}
                      {isFullAdmin && <button onClick={() => deleteContentItem("events", event.id, "event")} className="flex-1 p-2 border-2 border-foreground bg-secondary text-white hover:bg-destructive transition-all font-bold uppercase text-xs">Delete</button>}
                    </div>
                  </BrutalCard>
                ))}
              </div>
            </div>
          )}

          {isFullAdmin && <div className="mt-10">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Pending Event Proposals</h2>
              <BrutalBadge color="bg-highlight" text="text-foreground">{pendingEventProposals.length}</BrutalBadge>
            </div>
            <div className="grid gap-6">
              {pendingEventProposals.length === 0 ? (
                <BrutalCard color="bg-white" className="text-center">
                  <MessageSquare size={36} className="mx-auto mb-3 text-primary" />
                  <h3 className="text-2xl uppercase mb-2" style={fonts.display}>No Pending Proposals</h3>
                  <p className="text-sm text-muted-foreground">New event ideas will appear here for review.</p>
                </BrutalCard>
              ) : (
                pendingEventProposals.map((proposal) => (
                  <BrutalCard key={proposal.id} color="bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-xl font-bold uppercase" style={fonts.display}>{proposal.title}</h3>
                          <BrutalBadge color="bg-primary">{proposal.event_type}</BrutalBadge>
                          <BrutalBadge color={proposal.status === "approved" ? "bg-green-500" : proposal.status === "rejected" ? "bg-secondary" : "bg-highlight"} text={proposal.status === "pending" ? "text-foreground" : "text-white"}>
                            {proposal.status}
                          </BrutalBadge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          by <span className="font-bold">{proposal.proposer}</span> - {proposal.submittedDate}
                        </p>
                        <p className="text-sm text-slate-700 mb-3">{proposal.summary}</p>
                        <div className="flex gap-4 flex-wrap text-xs font-mono text-muted-foreground">
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
                          className="px-3 py-2 border-2 border-foreground bg-white hover:bg-primary hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => createEventFromProposal(proposal)}
                          className="px-3 py-2 border-2 border-foreground bg-green-500 text-white hover:bg-green-600 transition-all font-bold uppercase text-xs"
                        >
                          Approve + Create
                        </button>
                        <button
                          onClick={() => updateProposalStatus(proposal.id, "rejected")}
                          className="px-3 py-2 border-2 border-foreground bg-secondary text-white hover:bg-destructive transition-all font-bold uppercase text-xs"
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
              <h3 className="text-xl uppercase mb-4" style={fonts.display}>Rejected</h3>
              <div className="grid gap-3">
                {rejectedEventProposals.map((proposal) => (
                  <div key={`proposal-${proposal.id}`} className="border-2 border-foreground bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold uppercase">{proposal.title}</p>
                      <p className="text-xs font-mono text-muted-foreground">{proposal.proposer} - {proposal.submittedDate}</p>
                    </div>
                    <BrutalBadge color="bg-secondary">Rejected</BrutalBadge>
                  </div>
                ))}
                {archivedEvents.map((event) => (
                  <div key={`event-${event.id}`} className="border-2 border-foreground bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold uppercase">{event.title}</p>
                      <p className="text-xs font-mono text-muted-foreground">{event.date} - {event.location}</p>
                    </div>
                    <button onClick={() => void openEventModal(event)} className="px-3 py-1 border-2 border-foreground bg-white hover:bg-primary hover:text-white font-bold uppercase text-xs">Edit</button>
                    <button onClick={() => updateEventStatus(event.id, "approved")} className="px-3 py-1 border-2 border-foreground bg-green-500 text-white hover:bg-green-600 font-bold uppercase text-xs">Unarchive</button>
                    <button onClick={() => deleteContentItem("events", event.id, "event")} className="px-3 py-1 border-2 border-foreground bg-secondary text-white hover:bg-destructive font-bold uppercase text-xs">Delete</button>
                  </div>
                ))}
                {rejectedEventProposals.length === 0 && archivedEvents.length === 0 && (
                  <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No rejected items.</p></BrutalCard>
                )}
              </div>
            </div>
          </div>}
        </>
      )}
  </>);
}
