import {
  Check, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff,
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare, ListFilter
} from "lucide-react";
import { CertificateRenderer } from "../../../components/CertificateRenderer";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "../AdminPrimitives";

export function LogsTab({ ctx }: { ctx: any }) {
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
{activeTab === "logs" && isFullAdmin && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <BrutalCard color="bg-[#2563EB]" className="text-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{auditLogs.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Total Logs</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FFE800]">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{todayAuditCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Today</div>
            </BrutalCard>
            <BrutalCard color="bg-[#FB7185]" className="text-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{destructiveAuditCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Delete / Revoke</div>
            </BrutalCard>
          </div>

          <BrutalCard>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Activity Logs</h2>
                <p className="text-sm text-slate-600">Search admin actions, resources, actors, and record ids.</p>
              </div>
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={logSearchQuery} onChange={(event) => setLogSearchQuery(event.target.value)} placeholder="Search logs..." className="w-full pl-10 pr-4 py-3 border-2 border-[#171717] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-mono text-sm" />
              </div>
            </div>

            {filteredAuditLogs.length === 0 ? (
              <div className="border-2 border-dashed border-[#171717] p-10 text-center">
                <ListFilter size={36} className="mx-auto mb-3 text-[#2563EB]" />
                <p className="font-bold uppercase tracking-widest">No logs found</p>
                <p className="mt-2 text-sm text-slate-600">If this stays empty, apply the audit log migration to Supabase.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-[#171717] text-sm">
                  <thead className="bg-[#171717] text-white">
                    <tr>
                      <th className="p-3 text-left uppercase tracking-widest text-xs">Time</th>
                      <th className="p-3 text-left uppercase tracking-widest text-xs">Actor</th>
                      <th className="p-3 text-left uppercase tracking-widest text-xs">Action</th>
                      <th className="p-3 text-left uppercase tracking-widest text-xs">Resource</th>
                      <th className="p-3 text-left uppercase tracking-widest text-xs">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="border-t-2 border-[#171717] bg-white align-top">
                        <td className="p-3 font-mono text-xs whitespace-nowrap">{log.created_at ? new Date(log.created_at).toLocaleString() : "-"}</td>
                        <td className="p-3 font-mono text-xs">{log.actor_email || "System"}</td>
                        <td className="p-3"><BrutalBadge color={["delete", "revoke"].includes(log.action) ? "bg-[#FB7185]" : "bg-[#FFE800]"}>{String(log.action || "").replaceAll("_", " ")}</BrutalBadge></td>
                        <td className="p-3">
                          <p className="font-bold uppercase">{log.resource}</p>
                          {log.resource_id && <p className="text-[11px] font-mono text-slate-500 break-all">{log.resource_id}</p>}
                        </td>
                        <td className="p-3">
                          <p>{log.summary || "-"}</p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2 text-xs font-mono text-slate-500">
                              <summary className="cursor-pointer font-bold uppercase">Details</summary>
                              <pre className="mt-2 whitespace-pre-wrap break-words">{JSON.stringify(log.metadata, null, 2)}</pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </BrutalCard>
        </div>
      )}
  </>);
}
