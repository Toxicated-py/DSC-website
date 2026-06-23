
import React, { useState } from "react";
import { fonts } from "../../../config/fonts";
import { BrutalCard } from "../AdminPrimitives";

export function GalleryTab({ ctx }: { ctx: any }) {
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
    adminUpdateResource,
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

  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const parseTags = (value: string) => value.split(",").map((tag) => tag.trim()).filter(Boolean);
  const [galleryEditForm, setGalleryEditForm] = useState({ title: "", event_type: "social", caption: "", tags: "", event_name: "", image_url: "" });

  const startGalleryEdit = (item: any) => {
    setEditingGalleryId(item.id);
    setGalleryEditForm({
      title: item.title || "",
      event_type: item.event_type || "social",
      caption: item.caption || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      event_name: item.event_name || "",
      image_url: item.image_url || "",
    });
  };

  const saveGalleryEdit = async () => {
    if (!editingGalleryId) return;
    try {
      const updated = await adminUpdateResource("gallery", editingGalleryId, {
        title: galleryEditForm.title.trim(),
        event_type: galleryEditForm.event_type,
        caption: galleryEditForm.caption.trim() || null,
        tags: parseTags(galleryEditForm.tags),
        event_name: galleryEditForm.event_name.trim() || null,
        image_url: galleryEditForm.image_url.trim(),
      });
      setGallerySubmissions(gallerySubmissions.map((item: any) => item.id === editingGalleryId ? { ...item, ...updated } : item));
      setAdminStatus("Gallery item updated.");
      setEditingGalleryId(null);
    } catch (error: any) {
      setAdminStatus(error.message || "Could not update gallery item.");
    }
  };

  const renderGalleryItem = (item: any, actions: React.ReactNode) => (
    <BrutalCard key={item.id} color="bg-white" className="p-4">
      <div className="h-40 bg-slate-100 border-2 border-[#171717] mb-3 overflow-hidden">
        <img loading="lazy" src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
      </div>
      {editingGalleryId === item.id ? (
        <div className="grid gap-2">
          <input value={galleryEditForm.title} onChange={(event) => setGalleryEditForm({ ...galleryEditForm, title: event.target.value })} className="border-2 border-[#171717] p-2 font-mono text-xs" placeholder="Title" />
          <select value={galleryEditForm.event_type} onChange={(event) => setGalleryEditForm({ ...galleryEditForm, event_type: event.target.value })} className="border-2 border-[#171717] p-2 font-mono text-xs">
            {["workshop", "competition", "talk", "social"].map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}
          </select>
          <textarea value={galleryEditForm.caption} onChange={(event) => setGalleryEditForm({ ...galleryEditForm, caption: event.target.value })} className="min-h-20 border-2 border-[#171717] p-2 font-mono text-xs" placeholder="Caption" />
          <input value={galleryEditForm.tags} onChange={(event) => setGalleryEditForm({ ...galleryEditForm, tags: event.target.value })} className="border-2 border-[#171717] p-2 font-mono text-xs" placeholder="Tags, comma separated" />
          <input value={galleryEditForm.event_name} onChange={(event) => setGalleryEditForm({ ...galleryEditForm, event_name: event.target.value })} className="border-2 border-[#171717] p-2 font-mono text-xs" placeholder="Event title" />
          <input value={galleryEditForm.image_url} onChange={(event) => setGalleryEditForm({ ...galleryEditForm, image_url: event.target.value })} className="border-2 border-[#171717] p-2 font-mono text-xs" placeholder="Image URL" />
          <div className="flex gap-2">
            <button onClick={saveGalleryEdit} className="px-3 py-1 border-2 border-[#171717] bg-[#2563EB] text-white font-bold uppercase text-xs">Save</button>
            <button onClick={() => setEditingGalleryId(null)} className="px-3 py-1 border-2 border-[#171717] bg-white font-bold uppercase text-xs">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-bold uppercase leading-tight">{item.title}</h3>
          <p className="mt-1 text-xs font-mono text-slate-500">{item.event_name || "General gallery"} - {item.event_type || "social"} - {item.status}</p>
          {item.caption && <p className="mt-2 max-h-10 overflow-hidden text-sm text-slate-600">{item.caption}</p>}
          {Array.isArray(item.tags) && item.tags.length > 0 && <p className="mt-2 text-xs font-bold text-slate-500">{item.tags.map((tag: string) => `#${tag}`).join(" ")}</p>}
          <div className="mt-3 flex gap-2 flex-wrap">
            <button onClick={() => startGalleryEdit(item)} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FFE800] font-bold uppercase text-xs">Edit</button>
            {actions}
          </div>
        </>
      )}
    </BrutalCard>
  );

  return (<>
{activeTab === "gallery" && (
            <>
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Pending Gallery Submissions</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pendingGallery.map((item) => (
                  renderGalleryItem(item, (
                    <>
                      <button
                        onClick={() => openReviewPreview("Gallery Submission", [
                          { label: "Title", value: item.title },
                          { label: "Event Type", value: item.event_type || "social" },
                          { label: "Caption", value: item.caption },
                          { label: "Tags", value: Array.isArray(item.tags) ? item.tags.join(", ") : "" },
                          { label: "Event", value: item.event_name },
                          { label: "Status", value: item.status },
                          { label: "Submitted", value: item.created_at ? new Date(item.created_at).toLocaleString() : "" },
                          { label: "Image URL", value: item.image_url },
                        ], item.image_url, {
                          kind: "gallery",
                          title: item.title,
                          event: item.event_name || "Community",
                          imageUrl: item.image_url,
                          date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
                        })}
                        className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#2563EB] hover:text-white font-bold uppercase text-xs"
                      >
                        View
                      </button>
                      <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "approved")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Approve</button>
                      <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "rejected")} className="px-3 py-1 border-2 border-[#171717] bg-[#FB7185] text-white font-bold uppercase text-xs">Reject</button>
                      <button onClick={() => deleteContentItem("gallery", item.id, "gallery item")} className="px-3 py-1 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] font-bold uppercase text-xs">Delete</button>
                    </>
                  ))
                ))}
                {pendingGallery.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No pending gallery submissions.</p></BrutalCard>}
              </div>
              <h2 className="text-2xl md:text-3xl uppercase mt-10" style={fonts.display}>Approved Gallery</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {approvedGallery.map((item) => (
                  renderGalleryItem(item, (
                    <>
                      <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "rejected")} className="px-3 py-1 border-2 border-[#171717] bg-white hover:bg-[#FB7185] hover:text-white font-bold uppercase text-xs">Move to Rejected</button>
                      <button onClick={() => deleteContentItem("gallery", item.id, "gallery item")} className="px-3 py-1 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] font-bold uppercase text-xs">Delete</button>
                    </>
                  ))
                ))}
                {approvedGallery.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No approved gallery items.</p></BrutalCard>}
              </div>
              <h2 className="text-2xl md:text-3xl uppercase mt-10" style={fonts.display}>Rejected Gallery</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rejectedGallery.map((item) => (
                  renderGalleryItem(item, (
                    <>
                      <button onClick={() => updateSubmissionStatus("gallery_submissions", item.id, "approved")} className="px-3 py-1 border-2 border-[#171717] bg-green-500 text-white font-bold uppercase text-xs">Unarchive</button>
                      <button onClick={() => deleteContentItem("gallery", item.id, "gallery item")} className="px-3 py-1 border-2 border-[#171717] bg-[#FB7185] text-white hover:bg-[#F43F5E] font-bold uppercase text-xs">Delete</button>
                    </>
                  ))
                ))}
                {rejectedGallery.length === 0 && <BrutalCard color="bg-white"><p className="font-bold text-sm uppercase">No rejected gallery submissions.</p></BrutalCard>}
              </div>
            </>
          )}
  </>);
}
