import {
  Check, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff,
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare, ListFilter
} from "lucide-react";
import { CertificateRenderer } from "../../../components/CertificateRenderer";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "../AdminPrimitives";

export function CertificatesTab({ ctx }: { ctx: any }) {
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
{activeTab === "certificates" && isFullAdmin && (
        <div className="space-y-6">
          <BrutalCard color="bg-white">
            <h2 className="text-2xl md:text-3xl uppercase mb-6" style={fonts.display}>
              {editingCertificateId ? "Edit Certificate" : "Certificate Studio"}
            </h2>
            {!isCertificateAdmin ? (
              <div className="border-2 border-[#171717] bg-[#FFE800] p-4">
                <p className="text-sm font-bold">
                  Only admins can issue certificates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleIssueCertificate}>
                <div className="mb-5 border-2 border-[#171717] bg-[#F4EFEB] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Step 1</p>
                  <h3 className="font-bold uppercase tracking-widest text-sm">Select the event</h3>
                  <p className="mt-1 text-xs font-mono text-slate-500">
                    Certificates are issued from an event attendance list. Check-in must happen first, then the certificate can be sent.
                  </p>
                </div>
                <BrutalSelect
                  label="Certificate Event"
                  value={certificateForm.eventId}
                  onChange={(event: any) => applyCertificateEvent(event.target.value)}
                  disabled={Boolean(editingCertificateId)}
                  options={[
                    { value: "", label: "Select event" },
                    ...events.map((event) => ({
                      value: event.id,
                      label: event.title,
                    })),
                  ]}
                />
                {selectedCertificateEvent && (
                  <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="border-2 border-[#171717] bg-white p-3">
                      <p className="text-xl font-bold">{certificateEventRegistrations.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Registered</p>
                    </div>
                    <div className="border-2 border-[#171717] bg-[#DBEAFE] p-3">
                      <p className="text-xl font-bold">{certificateEventAttendees.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Checked In</p>
                    </div>
                    <div className="border-2 border-[#171717] bg-[#DCFCE7] p-3">
                      <p className="text-xl font-bold">{eligibleCertificateAttendees.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ready</p>
                    </div>
                    <div className="border-2 border-[#171717] bg-[#FFE800] p-3">
                      <p className="text-xl font-bold">{alreadyIssuedCertificateAttendees.length}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Issued</p>
                    </div>
                  </div>
                )}
                <div className="mb-6 border-4 border-[#171717] bg-[#171717] text-white brutal-shadow-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b-4 border-[#171717] bg-[#2563EB] p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Certificate Draft Editor</p>
                      <h3 className="text-2xl uppercase leading-none" style={fonts.display}>Design the certificate before issuing</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{certificateForm.templateStyle}</BrutalBadge>
                      <BrutalBadge color="bg-white" text="text-[#171717]">Live Preview</BrutalBadge>
                    </div>
                  </div>

                  <div className="grid 2xl:grid-cols-[520px_1fr] gap-0 bg-white text-[#171717]">
                    <div className="border-b-4 2xl:border-b-0 2xl:border-r-4 border-[#171717] p-4 md:p-5 space-y-5">
                      <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Content</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Text printed on certificate</h4>
                          </div>
                          <FileText size={18} className="text-[#2563EB]" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <BrutalInput
                            label="Printed Recipient Name"
                            value={certificateForm.recipientNameSnapshot}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, recipientNameSnapshot: event.target.value })}
                            placeholder="Name shown on certificate"
                            required
                          />
                          <BrutalInput
                            label="Printed Event Name"
                            value={certificateForm.eventTitleSnapshot}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, eventTitleSnapshot: event.target.value })}
                            placeholder="Event shown on certificate"
                            required
                          />
                        </div>
                        <BrutalInput
                          label="Certificate Title"
                          value={certificateForm.title}
                          onChange={(event: any) => setCertificateForm({ ...certificateForm, title: event.target.value })}
                          placeholder="Certificate of Participation"
                          required
                        />
                        <BrutalTextarea
                          label="Certificate Description"
                          value={certificateForm.description}
                          onChange={(event: any) => setCertificateForm({ ...certificateForm, description: event.target.value })}
                          placeholder="For actively participating in this program..."
                          rows={5}
                        />
                      </div>

                      <div className="border-2 border-[#171717] bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Design</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Template and metadata</h4>
                          </div>
                          <Settings size={18} className="text-[#7C3AED]" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <BrutalSelect
                            label="Type"
                            value={certificateForm.certificateType}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, certificateType: event.target.value })}
                            options={[
                              { value: "Workshop", label: "Workshop" },
                              { value: "Competition", label: "Competition" },
                              { value: "Course", label: "Course" },
                              { value: "Participation", label: "Participation" },
                            ]}
                          />
                          <BrutalSelect
                            label="Template"
                            value={certificateForm.templateStyle}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, templateStyle: event.target.value })}
                            options={certificateTemplateOptions.map((template) => ({
                              value: template.value,
                              label: template.label,
                            }))}
                          />
                          <BrutalInput
                            label="Issuer"
                            value={certificateForm.issuerName}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, issuerName: event.target.value })}
                            required
                          />
                          <BrutalInput
                            label="Issued Date"
                            type="date"
                            value={certificateForm.issuedAt}
                            onChange={(event: any) => setCertificateForm({ ...certificateForm, issuedAt: event.target.value })}
                          />
                        </div>
                        <BrutalInput
                          label="Optional External PDF Link"
                          value={certificateForm.certificateUrl}
                          onChange={(event: any) => setCertificateForm({ ...certificateForm, certificateUrl: event.target.value })}
                          placeholder="https://..."
                        />
                        {certificateForm.templateStyle === "custom-image" && (
                          <div className="mt-4 border-2 border-[#171717] bg-[#F4EFEB] p-4">
                            <div className="mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Blank Template Overlay</p>
                              <p className="mt-1 text-xs font-mono text-slate-600">
                                Add a blank certificate image URL. The website writes the recipient name and details on top.
                              </p>
                            </div>
                            <BrutalInput
                              label="Blank Template Image URL"
                              value={certificateForm.templateBackgroundUrl}
                              onChange={(event: any) => setCertificateForm({ ...certificateForm, templateBackgroundUrl: event.target.value })}
                              placeholder="https://.../blank-certificate.png"
                            />
                            <div className="mb-4">
                              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                Upload Blank Template
                              </label>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(event) => uploadCertificateTemplate(event.target.files?.[0])}
                                className="w-full border-2 border-[#171717] bg-white p-2 font-mono text-xs"
                              />
                              {certificateForm.templateBackgroundUrl && (
                                <img loading="lazy"
                                  src={certificateForm.templateBackgroundUrl}
                                  alt="Certificate template preview"
                                  className="mt-3 aspect-[1.414/1] w-full max-w-lg border-2 border-[#171717] bg-white object-cover"
                                />
                              )}
                            </div>
                            <div className="grid md:grid-cols-3 gap-3">
                              <BrutalInput
                                label="Name X %"
                                type="number"
                                value={certificateForm.templateNameX}
                                onChange={(event: any) => setCertificateForm({ ...certificateForm, templateNameX: Number(event.target.value) })}
                              />
                              <BrutalInput
                                label="Name Y %"
                                type="number"
                                value={certificateForm.templateNameY}
                                onChange={(event: any) => setCertificateForm({ ...certificateForm, templateNameY: Number(event.target.value) })}
                              />
                              <BrutalInput
                                label="Name Size"
                                type="number"
                                value={certificateForm.templateNameSize}
                                onChange={(event: any) => setCertificateForm({ ...certificateForm, templateNameSize: Number(event.target.value) })}
                              />
                              <BrutalInput
                                label="Detail Y %"
                                type="number"
                                value={certificateForm.templateDetailY}
                                onChange={(event: any) => setCertificateForm({ ...certificateForm, templateDetailY: Number(event.target.value) })}
                              />
                              <BrutalInput
                                label="Name Color"
                                type="color"
                                value={certificateForm.templateNameColor}
                                onChange={(event: any) => setCertificateForm({ ...certificateForm, templateNameColor: event.target.value })}
                              />
                              <BrutalInput
                                label="Detail Color"
                                type="color"
                                value={certificateForm.templateDetailColor}
                                onChange={(event: any) => setCertificateForm({ ...certificateForm, templateDetailColor: event.target.value })}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signatures</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Add up to 3 signers</h4>
                          </div>
                          <button
                            type="button"
                            onClick={addCertificateSignature}
                            className="px-3 py-2 border-2 border-[#171717] bg-[#FFE800] font-bold uppercase tracking-widest text-[10px]"
                          >
                            Add Signer
                          </button>
                        </div>
                        <div className="space-y-3">
                          {certificateForm.signatures.map((signature, index) => (
                            <div key={index} className="border-2 border-[#171717] bg-white p-3">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signer {index + 1}</p>
                                <button
                                  type="button"
                                  onClick={() => removeCertificateSignature(index)}
                                  className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase tracking-widest text-[10px]"
                                  disabled={certificateForm.signatures.length === 1}
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid md:grid-cols-2 gap-2">
                                <input
                                  className="w-full border-2 border-[#171717] p-2 font-mono text-xs"
                                  value={signature.name}
                                  onChange={(event) => updateCertificateSignature(index, "name", event.target.value)}
                                  placeholder="Signer name"
                                />
                                <input
                                  className="w-full border-2 border-[#171717] p-2 font-mono text-xs"
                                  value={signature.title}
                                  onChange={(event) => updateCertificateSignature(index, "title", event.target.value)}
                                  placeholder="Role / title"
                                />
                              </div>
                              <div className="mt-3 grid md:grid-cols-[1fr_auto] gap-3 items-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) => uploadCertificateSignature(index, event.target.files?.[0])}
                                  className="w-full border-2 border-[#171717] p-2 font-mono text-xs"
                                />
                                {signature.signature_image_url && (
                                  <img loading="lazy" src={signature.signature_image_url} alt={`${signature.name} signature`} className="h-12 max-w-40 object-contain border-2 border-[#171717] bg-white p-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F4EFEB] p-4 md:p-6">
                      <div className="sticky top-28">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Final draft</p>
                            <h4 className="font-bold uppercase tracking-widest text-sm">Preview before issue</h4>
                          </div>
                          <BrutalBadge color="bg-[#2563EB]">{certificateForm.certificateType}</BrutalBadge>
                        </div>
                        <div className="overflow-x-auto border-2 border-[#171717] bg-white p-3 brutal-shadow">
                          <div className="min-w-[760px]">
                            <CertificateRenderer certificate={certificatePreviewRecord} />
                          </div>
                        </div>
                        {certificateForm.eventId && (
                          <p className="mt-4 text-xs font-mono text-slate-500">
                            Bulk issue will send this same draft to {eligibleCertificateAttendees.length} checked-in attendee{eligibleCertificateAttendees.length === 1 ? "" : "s"} who {eligibleCertificateAttendees.length === 1 ? "does" : "do"} not already have one.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedCertificateEvent && (
                  <div className="mb-5 border-2 border-[#171717] bg-white p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Issuing Queue</p>
                        <h3 className="font-bold uppercase tracking-widest text-sm">{selectedCertificateEvent.title}</h3>
                      </div>
                      <BrutalBadge color="bg-[#DCFCE7]">{eligibleCertificateAttendees.length} ready</BrutalBadge>
                    </div>
                    {certificateEventRegistrations.length === 0 ? (
                      <p className="text-xs font-mono text-slate-500">No registrations found for this event yet.</p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {certificateEventRegistrations.map((registration) => {
                          const profile = Array.isArray(registration.profiles) ? registration.profiles[0] : registration.profiles;
                          const isCheckedIn = registration.status === "checked_in" || registration.checked_in_at;
                          const isIssued = registration.user_id && issuedRecipientIdsForEvent.has(registration.user_id);
                          const statusColor = isIssued ? "bg-[#FFE800]" : isCheckedIn ? "bg-[#DCFCE7]" : "bg-slate-200";
                          const statusText = isIssued ? "Issued" : isCheckedIn ? "Ready" : "Not checked in";
                          return (
                            <div key={registration.id || registration.user_id} className="flex items-center justify-between gap-3 border-2 border-[#171717] p-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase truncate">{profile?.full_name || profile?.email || "Member"}</p>
                                <p className="text-[10px] font-mono text-slate-500 truncate">{profile?.email || registration.user_id}</p>
                              </div>
                              <BrutalBadge color={statusColor} text="text-[#171717]">{statusText}</BrutalBadge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {uncheckedCertificateAttendees.length > 0 && (
                      <p className="mt-3 text-[10px] font-mono text-slate-500">
                        {uncheckedCertificateAttendees.length} registered attendee{uncheckedCertificateAttendees.length === 1 ? "" : "s"} still need check-in before certificate issuing.
                      </p>
                    )}
                  </div>
                )}
                {certificateStatus && (
                  <p className="mb-4 text-xs font-bold text-[#2563EB]">{certificateStatus}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <BrutalButton
                    type="submit"
                    color="bg-[#2563EB]"
                    text="text-white"
                    className="w-full text-xs"
                    disabled={
                      !certificateForm.eventId ||
                      (!editingCertificateId && (!certificateForm.recipientId || !isSelectedRecipientCheckedIn || isSelectedRecipientAlreadyIssued))
                    }
                >
                    <Award size={16} className="inline mr-2" /> {editingCertificateId ? "Save Certificate" : "Issue Single"}
                  </BrutalButton>
                  <BrutalButton
                    type="button"
                    color="bg-[#FFE800]"
                    className="w-full text-xs"
                    onClick={issueEventCertificates}
                    disabled={Boolean(editingCertificateId) || issuingBulkCertificates || !certificateForm.eventId || eligibleCertificateAttendees.length === 0}
                  >
                    <Users size={16} className="inline mr-2" /> {issuingBulkCertificates ? "Issuing..." : "Issue Checked-In"}
                  </BrutalButton>
                </div>
                {editingCertificateId && (
                  <button
                    type="button"
                    onClick={resetCertificateForm}
                    className="mt-3 w-full px-4 py-3 border-2 border-[#171717] bg-white font-bold uppercase tracking-widest text-xs"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            )}
          </BrutalCard>

          <BrutalCard color="bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Credential Registry</h2>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  {activeCredentialCount} active - {revokedCredentialCount} revoked
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <BrutalBadge color="bg-[#2563EB]">{issuedCertificates.length} total</BrutalBadge>
                <BrutalBadge color="bg-green-500">{activeCredentialCount} active</BrutalBadge>
              </div>
            </div>
            {certificateStatus && (
              <div className="mb-4 border-2 border-[#171717] bg-[#FFE800] p-3 text-xs font-bold uppercase tracking-widest">
                {certificateStatus}
              </div>
            )}
            {issuedCertificates.length === 0 ? (
              <div className="border-2 border-dashed border-[#171717] p-8 text-center">
                <Award size={32} className="mx-auto mb-3 text-[#2563EB]" />
                <p className="font-bold uppercase tracking-widest text-sm">No certificates issued yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issuedCertificates.map((certificate) => {
                  const recipient = Array.isArray(certificate.profiles) ? certificate.profiles[0] : certificate.profiles;
                  const isRevoked = Boolean(certificate.status === "revoked" || certificate.status === "archived");
                  const verifyUrl = certificate.verification_code ? `${window.location.origin}/verify/${certificate.verification_code}` : "";
                  return (
                    <div key={certificate.id} className={`border-2 border-[#171717] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${isRevoked ? "bg-slate-100 opacity-80" : "bg-white"}`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold uppercase">{certificate.certificate_title || certificate.title}</h3>
                          <BrutalBadge color={isRevoked ? "bg-slate-500" : "bg-green-500"}>
                            {isRevoked ? "Revoked" : "Verified"}
                          </BrutalBadge>
                        </div>
                        <p className="text-xs font-mono text-slate-500">
                          Recipient: {certificate.recipient_name_snapshot || recipient?.full_name || recipient?.email || "Member"} - issued {certificate.issued_date || certificate.issued_at || "date pending"}
                        </p>
                        <p className="text-xs font-mono text-slate-500">
                          Issuer: {certificate.issuer_name || "Data Science Club"} - Created: {certificate.created_at ? new Date(certificate.created_at).toLocaleString() : "unknown"}
                        </p>
                        {certificate.events && (
                          <p className="text-xs font-mono text-slate-500">
                            Event: {certificate.event_title_snapshot || (Array.isArray(certificate.events) ? certificate.events[0]?.title : certificate.events.title)}
                          </p>
                        )}
                        <p className="text-xs font-mono text-slate-500">
                          Verify code: {certificate.verification_code || "Pending migration"}
                        </p>
                        {verifyUrl && <p className="text-xs font-mono text-slate-500 break-all">Verify URL: {verifyUrl}</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <BrutalBadge color="bg-[#7C3AED]">{certificate.certificate_type}</BrutalBadge>
                        <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{certificate.template || certificate.template_style || "legacy"}</BrutalBadge>
                        <button
                          type="button"
                          onClick={() => setCertificateModal(certificate)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FFE800] transition-all font-bold uppercase text-xs"
                        >
                          View
                        </button>
                        {certificate.verification_code && (
                          <button
                            type="button"
                            onClick={() => copyCertificateLink(certificate)}
                            className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FFE800] transition-all font-bold uppercase text-xs"
                          >
                            Copy Link
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => editCertificate(certificate)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setCertificateRevoked(certificate, !isRevoked)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#7C3AED] hover:text-white transition-all font-bold uppercase text-xs"
                        >
                          {isRevoked ? "Restore" : "Revoke"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCertificate(certificate.id)}
                          className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white transition-all font-bold uppercase text-xs"
                          disabled={!isRevoked}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </BrutalCard>
        </div>
      )}
  </>);
}
