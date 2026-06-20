import {
  Check, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown,
  Calendar, MapPin, Users, Trophy, TrendingUp, Save, X, Plus, Eye, EyeOff,
  Mail, Phone, Globe, Github, Linkedin, Twitter, Instagram, Facebook,
  Home, FileText, Award, Zap, BarChart3, Activity, Clock, Star, MessageSquare, ListFilter
} from "lucide-react";
import { CertificateRenderer } from "../../../components/CertificateRenderer";
import { fonts } from "../../../config/fonts";
import { BrutalBadge, BrutalButton, BrutalCard, BrutalInput, BrutalSelect, BrutalTextarea } from "../AdminPrimitives";

export function SettingsTab({ ctx }: { ctx: any }) {
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
{activeTab === "settings" && isFullAdmin && (
        <div className="space-y-6">
          {settingsStatus && (
            <div className="border-2 border-[#171717] bg-[#FFE800] p-3 font-bold text-sm uppercase tracking-widest brutal-shadow">
              {settingsStatus}
            </div>
          )}
          <SettingsSection openSettingsSections={openSettingsSections} setOpenSettingsSections={setOpenSettingsSections} id="site" title="Site Settings" description="Main website name and tagline.">
            <BrutalInput label="Site Name" value={siteSettings.siteName} onChange={(e: any) => setSiteSettings({...siteSettings, siteName: e.target.value})} />
            <BrutalInput label="Tagline" value={siteSettings.tagline} onChange={(e: any) => setSiteSettings({...siteSettings, tagline: e.target.value})} />
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save Settings"}
            </BrutalButton>
          </SettingsSection>

          <SettingsSection openSettingsSections={openSettingsSections} setOpenSettingsSections={setOpenSettingsSections} id="contact" title="Contact Information" description="Contact cards, address, and office hours shown on Contact page.">
            <BrutalTextarea
              label="Office Hours"
              value={siteSettings.officeHours}
              onChange={(e: any) => setSiteSettings({ ...siteSettings, officeHours: e.target.value })}
            />
            <div className="space-y-4">
              {siteSettings.contactItems.map((item) => (
                <div key={item.id} className="grid lg:grid-cols-[160px_220px_1fr_auto] gap-3 items-end border-2 border-[#171717] bg-[#F4EFEB] p-3">
                  <BrutalSelect
                    label="Type"
                    value={item.type}
                    onChange={(e: any) => updateContactItem(item.id, { type: e.target.value })}
                    options={[
                      { value: "email", label: "Email" },
                      { value: "phone", label: "Phone" },
                      { value: "address", label: "Address" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                  <BrutalInput
                    label="Label"
                    value={item.label}
                    onChange={(e: any) => updateContactItem(item.id, { label: e.target.value })}
                  />
                  {item.type === "address" ? (
                    <BrutalTextarea
                      label="Value"
                      value={item.value}
                      onChange={(e: any) => updateContactItem(item.id, { value: e.target.value })}
                    />
                  ) : (
                    <BrutalInput
                      label="Value"
                      value={item.value}
                      onChange={(e: any) => updateContactItem(item.id, { value: e.target.value })}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeContactItem(item.id)}
                    className="h-[52px] px-4 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] font-bold uppercase tracking-widest text-xs brutal-shadow"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="grid lg:grid-cols-[160px_220px_1fr_auto] gap-3 items-end border-2 border-dashed border-[#171717] bg-white p-3">
                <BrutalSelect
                  label="New Type"
                  value={newContactItem.type}
                  onChange={(e: any) => setNewContactItem({ ...newContactItem, type: e.target.value })}
                  options={[
                    { value: "email", label: "Email" },
                    { value: "phone", label: "Phone" },
                    { value: "address", label: "Address" },
                    { value: "other", label: "Other" },
                  ]}
                />
                <BrutalInput
                  label="New Label"
                  placeholder="Office, WhatsApp, Location"
                  value={newContactItem.label}
                  onChange={(e: any) => setNewContactItem({ ...newContactItem, label: e.target.value })}
                />
                <BrutalInput
                  label="New Value"
                  placeholder="clubid@sms.tu.edu.np"
                  value={newContactItem.value}
                  onChange={(e: any) => setNewContactItem({ ...newContactItem, value: e.target.value })}
                />
                <button
                  type="button"
                  onClick={addContactItem}
                  className="h-[52px] px-4 border-2 border-[#171717] bg-[#22C55E] text-white hover:bg-[#16A34A] font-bold uppercase tracking-widest text-xs brutal-shadow"
                >
                  Add Contact
                </button>
              </div>
            </div>
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save Contact Info"}
            </BrutalButton>
          </SettingsSection>

          <SettingsSection openSettingsSections={openSettingsSections} setOpenSettingsSections={setOpenSettingsSections} id="social" title="Social Media Links" description="Add, remove, or edit footer and contact social links.">
            <div className="space-y-4">
              {Object.entries(siteSettings.socialLinks).map(([platform, url]) => (
                <div key={platform} className="grid lg:grid-cols-[220px_1fr_auto] gap-3 items-end border-2 border-[#171717] bg-[#F4EFEB] p-3">
                  <BrutalInput
                    label="Platform"
                    value={platform}
                    disabled
                  />
                  <BrutalInput
                    label="URL"
                    value={url}
                    onChange={(e: any) => updateSocialLink(platform, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(platform)}
                    className="h-[52px] px-4 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] font-bold uppercase tracking-widest text-xs brutal-shadow"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="grid lg:grid-cols-[220px_1fr_auto] gap-3 items-end border-2 border-dashed border-[#171717] bg-white p-3">
                <BrutalInput
                  label="New Platform"
                  placeholder="YouTube, TikTok, Website"
                  value={newSocialLink.platform}
                  onChange={(e: any) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                />
                <BrutalInput
                  label="New URL"
                  placeholder="https://..."
                  value={newSocialLink.url}
                  onChange={(e: any) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                />
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="h-[52px] px-4 border-2 border-[#171717] bg-[#22C55E] text-white hover:bg-[#16A34A] font-bold uppercase tracking-widest text-xs brutal-shadow"
                >
                  Add Link
                </button>
              </div>
            </div>
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save Social Links"}
            </BrutalButton>
          </SettingsSection>

          <SettingsSection openSettingsSections={openSettingsSections} setOpenSettingsSections={setOpenSettingsSections} id="team" title="Team Members" description="Profile-linked executives/members and manual advisors shown on Team page.">
            <div className="space-y-4">
              {siteSettings.teamMembers.map((member) => (
                <div key={member.id} className="border-2 border-[#171717] bg-[#F4EFEB] p-3">
                  <div className="mb-3 grid md:grid-cols-[180px_1fr_auto] gap-3 items-end">
                    <BrutalSelect
                      label="Source"
                      value={member.source || "manual"}
                      onChange={(e: any) => updateTeamMember(member.id, { source: e.target.value })}
                      options={[
                        { value: "profile", label: "Profile Linked" },
                        { value: "manual", label: "Manual Entry" },
                      ]}
                    />
                    <BrutalInput
                      label="Profile Email"
                      value={member.profileEmail || ""}
                      onChange={(e: any) => updateTeamMember(member.id, { profileEmail: e.target.value })}
                      placeholder="member@sms.tu.edu.np"
                    />
                    <button
                      type="button"
                      onClick={() => linkTeamMemberToProfile(member.id, member.profileEmail)}
                      className="h-[52px] px-4 border-2 border-[#171717] bg-[#FFE800] text-[#171717] hover:bg-yellow-300 font-bold uppercase tracking-widest text-xs brutal-shadow"
                    >
                      Link Profile
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <BrutalInput
                      label="Group"
                      value={member.group}
                      onChange={(e: any) => updateTeamMember(member.id, { group: e.target.value })}
                      placeholder="executive, faculty, volunteer..."
                    />
                    <BrutalInput label="Name" value={member.name} onChange={(e: any) => updateTeamMember(member.id, { name: e.target.value })} />
                    <BrutalInput label="Position" value={member.position} onChange={(e: any) => updateTeamMember(member.id, { position: e.target.value })} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <BrutalInput label="Meta" value={member.meta} onChange={(e: any) => updateTeamMember(member.id, { meta: e.target.value })} placeholder="Year, department, or role detail" />
                    <BrutalInput label="Image URL" value={member.image} onChange={(e: any) => updateTeamMember(member.id, { image: e.target.value })} />
                  </div>
                  <BrutalTextarea label="Bio" value={member.bio} onChange={(e: any) => updateTeamMember(member.id, { bio: e.target.value })} />
                  <div className="grid md:grid-cols-3 gap-3">
                    <BrutalInput label="Email" value={member.email} onChange={(e: any) => updateTeamMember(member.id, { email: e.target.value })} />
                    <BrutalInput label="LinkedIn" value={member.linkedin} onChange={(e: any) => updateTeamMember(member.id, { linkedin: e.target.value })} />
                    <BrutalInput label="GitHub" value={member.github} onChange={(e: any) => updateTeamMember(member.id, { github: e.target.value })} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(member.id)}
                    className="px-4 py-2 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] font-bold uppercase tracking-widest text-xs brutal-shadow"
                  >
                    Remove Member
                  </button>
                </div>
              ))}

              <div className="border-2 border-dashed border-[#171717] bg-white p-3">
                <div className="grid md:grid-cols-[180px_1fr] gap-3">
                  <BrutalSelect
                    label="New Source"
                    value={newTeamMember.source || "profile"}
                    onChange={(e: any) => setNewTeamMember({ ...newTeamMember, source: e.target.value })}
                    options={[
                      { value: "profile", label: "Profile Linked" },
                      { value: "manual", label: "Manual Entry" },
                    ]}
                  />
                  <BrutalInput
                    label="New Profile Email"
                    value={newTeamMember.profileEmail || ""}
                    onChange={(e: any) => {
                      const profile = findProfileByEmail(e.target.value);
                      setNewTeamMember({
                        ...newTeamMember,
                        profileEmail: e.target.value,
                        ...(profile ? profileToTeamFields(profile) : {}),
                      });
                    }}
                    placeholder="Use for executives/members with website profiles"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <BrutalInput
                    label="New Group"
                    value={newTeamMember.group}
                    onChange={(e: any) => setNewTeamMember({ ...newTeamMember, group: e.target.value })}
                    placeholder="executive, faculty, volunteer..."
                  />
                  <BrutalInput label="New Name" value={newTeamMember.name} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, name: e.target.value })} />
                  <BrutalInput label="New Position" value={newTeamMember.position} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, position: e.target.value })} />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <BrutalInput label="New Meta" value={newTeamMember.meta} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, meta: e.target.value })} />
                  <BrutalInput label="New Image URL" value={newTeamMember.image} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, image: e.target.value })} />
                </div>
                <BrutalTextarea label="New Bio" value={newTeamMember.bio} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })} />
                <div className="grid md:grid-cols-3 gap-3">
                  <BrutalInput label="New Email" value={newTeamMember.email} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, email: e.target.value })} />
                  <BrutalInput label="New LinkedIn" value={newTeamMember.linkedin} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })} />
                  <BrutalInput label="New GitHub" value={newTeamMember.github} onChange={(e: any) => setNewTeamMember({ ...newTeamMember, github: e.target.value })} />
                </div>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="px-4 py-2 border-2 border-[#171717] bg-[#22C55E] text-white hover:bg-[#16A34A] font-bold uppercase tracking-widest text-xs brutal-shadow"
                >
                  Add Team Member
                </button>
              </div>
            </div>
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save Team"}
            </BrutalButton>
          </SettingsSection>

          <SettingsSection openSettingsSections={openSettingsSections} setOpenSettingsSections={setOpenSettingsSections} id="faqs" title="Frequently Asked Questions" description="Questions and answers shown on the Contact page.">
            <div className="space-y-4">
              {siteSettings.faqs.map((faq) => (
                <div key={faq.id} className="border-2 border-[#171717] bg-[#F4EFEB] p-3">
                  <BrutalInput
                    label="Question"
                    value={faq.question}
                    onChange={(e: any) => updateFAQ(faq.id, { question: e.target.value })}
                  />
                  <BrutalTextarea
                    label="Answer"
                    value={faq.answer}
                    onChange={(e: any) => updateFAQ(faq.id, { answer: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeFAQ(faq.id)}
                    className="px-4 py-2 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] font-bold uppercase tracking-widest text-xs brutal-shadow"
                  >
                    Remove FAQ
                  </button>
                </div>
              ))}

              <div className="border-2 border-dashed border-[#171717] bg-white p-3">
                <BrutalInput
                  label="New Question"
                  value={newFAQ.question}
                  onChange={(e: any) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                />
                <BrutalTextarea
                  label="New Answer"
                  value={newFAQ.answer}
                  onChange={(e: any) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                />
                <button
                  type="button"
                  onClick={addFAQ}
                  className="px-4 py-2 border-2 border-[#171717] bg-[#22C55E] text-white hover:bg-[#16A34A] font-bold uppercase tracking-widest text-xs brutal-shadow"
                >
                  Add FAQ
                </button>
              </div>
            </div>
            <BrutalButton color="bg-[#2563EB]" text="text-white" onClick={saveSiteSettings} disabled={savingSettings}>
              <Save size={16} className="inline mr-2" /> {savingSettings ? "Saving..." : "Save FAQs"}
            </BrutalButton>
          </SettingsSection>
        </div>
      )}
  </>);
}
