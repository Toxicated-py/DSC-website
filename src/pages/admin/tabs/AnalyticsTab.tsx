import {
  Check, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff,
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare, ListFilter
} from "lucide-react";
import { CertificateRenderer } from "../../../components/CertificateRenderer";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "../AdminPrimitives";

export function AnalyticsTab({ ctx }: { ctx: any }) {
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
{activeTab === "analytics" && isFullAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <BrutalCard color="bg-[#2563EB]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity size={24} />
                <TrendingUp size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{activeMemberCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Active Members</div>
              <p className="mt-2 text-xs font-mono opacity-80">{users.length} total profiles</p>
            </BrutalCard>
            <BrutalCard color="bg-[#7C3AED]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={24} />
                <TrendingUp size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{activeEventCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Active Events</div>
              <p className="mt-2 text-xs font-mono opacity-80">{upcomingEventCount} upcoming</p>
            </BrutalCard>
            <BrutalCard color="bg-[#22C55E]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <UserCheck size={24} />
                <Activity size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{attendanceSummary}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Check-ins</div>
              <p className="mt-2 text-xs font-mono opacity-80">All-time registered attendees</p>
            </BrutalCard>
            <BrutalCard color="bg-[#FB7185]" className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} />
                <MessageSquare size={16} />
              </div>
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{pendingReviewCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Pending Review</div>
              <p className="mt-2 text-xs font-mono opacity-80">{contactMessages.filter((message) => message.status === "new").length} new contacts</p>
            </BrutalCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <BrutalCard>
              <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Member Growth</h2>
              <div className="space-y-4">
                {memberGrowth.map((month) => (
                  <div key={month.key} className="grid grid-cols-[64px_1fr_48px] items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest">{month.label}</span>
                    <div className="h-8 border-2 border-[#171717] bg-[#F4EFEB]">
                      <div className="h-full bg-[#2563EB]" style={{ width: `${Math.max(6, (month.count / maxGrowth) * 100)}%` }} />
                    </div>
                    <span className="text-right text-sm font-bold font-mono">{month.count}</span>
                  </div>
                ))}
              </div>
            </BrutalCard>

            <BrutalCard>
              <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>This Month</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                  <Trophy size={20} className="mb-3 text-[#2563EB]" />
                  <p className="text-3xl uppercase" style={fonts.display}>{projectsThisMonth}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Projects submitted/published</p>
                </div>
                <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                  <FileText size={20} className="mb-3 text-[#7C3AED]" />
                  <p className="text-3xl uppercase" style={fonts.display}>{postsThisMonth}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Blog posts published</p>
                </div>
                <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                  <Award size={20} className="mb-3 text-[#2563EB]" />
                  <p className="text-3xl uppercase" style={fonts.display}>{issuedCertificates.length}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Certificates issued</p>
                </div>
                <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                  <Mail size={20} className="mb-3 text-[#FB7185]" />
                  <p className="text-3xl uppercase" style={fonts.display}>{contactMessages.length}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Contact messages</p>
                </div>
              </div>
            </BrutalCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <BrutalCard>
              <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Event Capacity</h2>
              <div className="space-y-4">
                {eventUtilization.map((event) => (
                  <div key={event.id} className="border-2 border-[#171717] bg-white p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-sm uppercase">{event.title}</p>
                        <p className="text-xs font-mono text-slate-500">{event.attendees}/{event.capacity || "unlimited"} registered - {event.checkedIn} checked in</p>
                      </div>
                      <BrutalBadge color={event.fillRate >= 90 ? "bg-[#FB7185]" : "bg-[#FFE800]"}>{event.fillRate}%</BrutalBadge>
                    </div>
                    <div className="h-4 border-2 border-[#171717] bg-[#F4EFEB]">
                      <div className="h-full bg-[#2563EB]" style={{ width: `${event.fillRate}%` }} />
                    </div>
                  </div>
                ))}
                {eventUtilization.length === 0 && <p className="text-sm font-mono text-slate-500">Events will appear here after they are created.</p>}
              </div>
            </BrutalCard>

            <BrutalCard>
              <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>Content Health</h2>
              <div className="space-y-3">
                {contentStatusStats.map((item) => (
                  <div key={item.label} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-2 border-[#171717] bg-white p-3 text-xs font-bold uppercase tracking-widest">
                    <span>{item.label}</span>
                    <span className="text-[#22C55E]">{item.active} active</span>
                    <span className="text-[#FB7185]">{item.pending} pending</span>
                    <span className="text-slate-500">{item.archived} archived</span>
                  </div>
                ))}
              </div>
            </BrutalCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
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
                {popularEvents.length === 0 && <p className="text-sm font-mono text-slate-500">Approved events will appear here after registrations start.</p>}
              </div>
            </BrutalCard>

            <BrutalCard>
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Recent Logs</h2>
                <button onClick={() => openAdminTab("logs")} className="px-3 py-2 border-2 border-[#171717] bg-white hover:bg-[#FFE800] font-bold uppercase tracking-widest text-xs">View All</button>
              </div>
              <div className="space-y-3">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="border-2 border-[#171717] bg-[#F4EFEB] p-3">
                    <p className="text-xs font-bold uppercase tracking-widest">{log.action?.replaceAll("_", " ")} - {log.resource}</p>
                    <p className="text-sm mt-1">{log.summary || log.resource_id}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-2">{log.actor_email || "System"} - {log.created_at ? new Date(log.created_at).toLocaleString() : ""}</p>
                  </div>
                ))}
                {recentAuditLogs.length === 0 && <p className="text-sm font-mono text-slate-500">No logs yet. Run the audit log migration, then admin actions will appear here.</p>}
              </div>
            </BrutalCard>
          </div>
        </>
      )}
  </>);
}
