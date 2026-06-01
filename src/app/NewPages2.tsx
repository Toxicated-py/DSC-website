/**
 * Additional New Pages - Part 2
 * 
 * 5. Gallery Page
 * 6. User Profile Page
 * 7. Achievements Page
 * 8. Partners Page
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Image, User, Edit, Save, Trophy, Star, Award, Target, Heart,
  Calendar, MapPin, Mail, Github, Linkedin, ExternalLink, Zap,
  TrendingUp, Users, Code, BookOpen, Shield, Crown, GraduationCap, UserCheck, Handshake
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch } from "../lib/apiClient";
import { submitGallery } from "../lib/contentApi";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

const BrutalButton = ({ children, color = "bg-[#FFE800]", text = "text-[#171717]", className = "", ...props }: any) => (
  <button
    className={`px-6 py-3 ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover transition-all ${className}`}
    {...props}
  >
    {children}
  </button>
);

const BrutalCard = ({ children, className = "", color = "bg-white", ...props }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${className}`} {...props}>
    {children}
  </div>
);

const BrutalBadge = ({ children, color = "bg-[#FB7185]", text = "text-white", className = "" }: any) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

const BrutalInput = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <input
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
      {...props}
    />
  </div>
);

const BrutalTextarea = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>}
    <textarea
      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all resize-none"
      rows={4}
      {...props}
    />
  </div>
);

// ─── 5. GALLERY PAGE ───────────────────────────────────────────────────────────

export function GalleryPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [submittedPhotos, setSubmittedPhotos] = useState<any[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submittingGallery, setSubmittingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    imageUrl: "",
    eventName: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadGallery() {
      const data = await apiGet<any[]>("/api/gallery").catch(() => []);
      if (!mounted) return;
      setSubmittedPhotos((data || []).map((item) => ({
        id: item.id,
        url: item.image_url,
        title: item.title,
        event: item.event_name || "Community",
        date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
        likes: 0,
      })));
    }

    loadGallery();
    return () => {
      mounted = false;
    };
  }, []);

  const photos = submittedPhotos;
  const filters = ["all", ...Array.from(new Set(photos.map((photo) => photo.event.toLowerCase())))];
  const filteredPhotos = selectedFilter === "all"
    ? photos
    : photos.filter(p => p.event.toLowerCase() === selectedFilter);

  const submitGalleryPhoto = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingGallery) return;
    setSubmitStatus("");
    setSubmittingGallery(true);
    try {
      await submitGallery({
        title: galleryForm.title.trim(),
        image_url: galleryForm.imageUrl.trim(),
        event_name: galleryForm.eventName.trim() || "Community",
      });
      setGalleryForm({ title: "", imageUrl: "", eventName: "" });
      setSubmitStatus("Photo submitted for admin approval.");
      setShowSubmitForm(false);
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes("log in")) {
        navigate("/login?redirect=/gallery");
        return;
      }
      setSubmitStatus(error?.message || "Could not submit photo.");
    } finally {
      setSubmittingGallery(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-flex items-center gap-1">
          <Image size={10} /> MEMORIES
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Gallery
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Capturing moments from our workshops, events, and community gatherings
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex justify-center gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-6 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
              selectedFilter === filter
                ? "bg-[#2563EB] text-white"
                : "bg-white text-[#171717] hover:bg-[#F4EFEB]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#171717] bg-white">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>No photos yet</p>
          <p className="text-sm font-mono text-slate-400 mt-2">Approved gallery submissions will appear here.</p>
        </div>
      ) : (
      <div className="grid md:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <BrutalCard key={photo.id} className="p-0 overflow-hidden group cursor-pointer">
            <div className="aspect-video overflow-hidden relative">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <BrutalBadge className="opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW
                </BrutalBadge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BrutalBadge color="bg-[#2563EB]" className="text-[8px]">{photo.event}</BrutalBadge>
                <span className="text-xs text-slate-400 font-mono">{photo.date}</span>
              </div>
              <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>{photo.title}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Heart size={12} className="fill-[#FB7185] text-[#FB7185]" />
                <span>{photo.likes} likes</span>
              </div>
            </div>
          </BrutalCard>
        ))}
      </div>
      )}

      {/* Upload CTA */}
      <BrutalCard color="bg-[#FFE800]" className="mt-12 text-center">
        <Image size={32} className="mx-auto mb-4" />
        <h3 className="text-2xl uppercase mb-2" style={fonts.display}>Have Photos to Share?</h3>
        <p className="text-slate-700 mb-4">
          Help us build our community gallery by sharing your event photos!
        </p>
        <BrutalButton color="bg-[#171717]" text="text-white" onClick={() => setShowSubmitForm(!showSubmitForm)}>
          Upload Photos
        </BrutalButton>
        {showSubmitForm && (
          <form onSubmit={submitGalleryPhoto} className="mt-6 max-w-2xl mx-auto text-left">
            <BrutalInput
              label="Photo Title"
              value={galleryForm.title}
              onChange={(event: any) => setGalleryForm({ ...galleryForm, title: event.target.value })}
              required
            />
            <BrutalInput
              label="Image URL"
              type="url"
              value={galleryForm.imageUrl}
              onChange={(event: any) => setGalleryForm({ ...galleryForm, imageUrl: event.target.value })}
              placeholder="https://..."
              required
            />
            <BrutalInput
              label="Event Name"
              value={galleryForm.eventName}
              onChange={(event: any) => setGalleryForm({ ...galleryForm, eventName: event.target.value })}
              placeholder="Workshop, Hackathon, Community"
            />
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full" disabled={submittingGallery}>
              {submittingGallery ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
          </form>
        )}
        {submitStatus && <p className="mt-4 text-sm font-bold">{submitStatus}</p>}
      </BrutalCard>
    </div>
  );
}

// ─── 6. USER PROFILE PAGE ──────────────────────────────────────────────────────

export function UserProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [designationOptions, setDesignationOptions] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    name: "Member",
    email: "",
    bio: "",
    designation: "",
    designationStatus: "pending",
    year: "",
    major: "",
    skills: ["Python", "Machine Learning", "Data Viz", "SQL"],
    github: "",
    linkedin: ""
  });

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!isSupabaseConfigured || !supabase) {
        setLoadingProfile(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!userData.user) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        navigate("/login?redirect=/profile");
        return;
      }

      const fallbackName =
        userData.user.user_metadata?.full_name ||
        userData.user.user_metadata?.name ||
        userData.user.email ||
        "Member";

      const [data, options, submissionRows] = await Promise.all([
        apiGet<any>("/api/me", { auth: true }),
        apiGet<any[]>("/api/designation-options"),
        apiGet<any>("/api/me/submissions", { auth: true }),
      ]);

      if (!mounted) return;
      const optionLabels = (options || []).map((option) => option.label);
      if (data?.designation && !optionLabels.includes(data.designation)) {
        optionLabels.push(data.designation);
      }
      setDesignationOptions(optionLabels);

      setProfile((current) => ({
        ...current,
        name: data?.full_name || fallbackName,
        email: data?.email || userData.user.email || "",
        bio: data?.bio || "",
        designation: data?.designation || "",
        designationStatus: data?.designation_status || "pending",
        year: data?.batch_year ? String(data.batch_year) : "",
        major: data?.major || "",
        github: data?.github_username || "",
        linkedin: data?.linkedin_username || "",
        skills: data?.skills?.length ? data.skills : current.skills,
      }));
      setSubmissions([
        ...(submissionRows.projects || []).map((item: any) => ({ ...item, type: "Project", date: item.submitted_at || item.published_at })),
        ...(submissionRows.blog_posts || []).map((item: any) => ({ ...item, type: "Blog", date: item.published_at })),
        ...(submissionRows.event_proposals || []).map((item: any) => ({ ...item, type: "Event Proposal", date: item.submitted_at })),
        ...(submissionRows.gallery_submissions || []).map((item: any) => ({ ...item, type: "Gallery", date: item.created_at })),
        ...(submissionRows.certificates || []).map((item: any) => ({ ...item, title: item.certificate_title || item.title, type: "Certificate", date: item.created_at })),
      ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      setLoadingProfile(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleEditToggle = async () => {
    setSaveStatus("");
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login?redirect=/profile");
        return;
      }

      const parsedYear = Number.parseInt(profile.year, 10);
      try {
        await apiPatch("/api/me", {
          data: {
          full_name: profile.name,
          bio: profile.bio,
          designation: profile.designation,
          batch_year: Number.isFinite(parsedYear) ? parsedYear : null,
          major: profile.major,
          github_username: profile.github,
          linkedin_username: profile.linkedin,
          skills: profile.skills,
          },
        }, { auth: true });
      } catch (error: any) {
        setSaveStatus(error?.message || "Could not save profile.");
        return;
      }
      setSaveStatus("Profile saved. Designation changes need admin approval before they appear publicly.");
    }

    setIsEditing(false);
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || profile.skills.some((existing) => existing.toLowerCase() === skill.toLowerCase())) return;
    setProfile({ ...profile, skills: [...profile.skills, skill] });
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((item) => item !== skill) });
  };

  const stats = {
    eventsAttended: 0,
    projectsSubmitted: submissions.filter((item) => item.type === "Project").length,
    certificatesEarned: submissions.filter((item) => item.type === "Certificate" && ["approved", "published"].includes(item.status)).length,
    memberSince: "New member"
  };
  const recentActivity = submissions.slice(0, 4).map((item) => ({
    title: `${item.type}: ${item.title}`,
    date: item.date ? new Date(item.date).toLocaleDateString() : "Date pending",
  }));

  const statusColor = (status: string) => {
    if (status === "published" || status === "approved") return "bg-green-500";
    if (status === "rejected" || status === "archived") return "bg-[#FB7185]";
    return "bg-[#FFE800]";
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-flex items-center gap-1">
          <User size={10} /> YOUR PROFILE
        </BrutalBadge>
        <div className="flex items-end justify-between">
          <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>
            Profile
          </h1>
          <BrutalButton
            color={isEditing ? "bg-green-500" : "bg-[#2563EB]"}
            text="text-white"
            onClick={handleEditToggle}
            className="text-sm"
          >
            {isEditing ? (
              <><Save size={14} className="inline mr-1" /> Save</>
            ) : (
              <><Edit size={14} className="inline mr-1" /> Edit Profile</>
            )}
          </BrutalButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          <BrutalCard>
            {loadingProfile ? (
              <p className="font-mono text-sm text-slate-500">Loading profile...</p>
            ) : (
            <>
            <div className="flex items-start gap-6 mb-6">
              <div className="w-32 h-32 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                {profile.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase() || "M"}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <>
                    <BrutalInput
                      value={profile.name}
                      onChange={(e: any) => setProfile({ ...profile, name: e.target.value })}
                    />
                    <BrutalInput
                      value={profile.email}
                      readOnly
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold uppercase mb-1" style={fonts.display}>{profile.name}</h2>
                    <p className="text-slate-600 font-mono text-sm mb-2">{profile.email}</p>
                    <div className="flex gap-2">
                      <BrutalBadge color="bg-[#2563EB]">MEMBER</BrutalBadge>
                      <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">SIGNED IN</BrutalBadge>
                      {profile.designation && profile.designationStatus === "approved" && (
                        <BrutalBadge color="bg-[#7C3AED]">{profile.designation}</BrutalBadge>
                      )}
                    </div>
                    {profile.designation && profile.designationStatus !== "approved" && (
                      <p className="text-xs font-bold text-[#FB7185] mt-3">
                        Designation pending admin approval: {profile.designation}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <>
                <BrutalTextarea
                  label="Bio"
                  value={profile.bio}
                  onChange={(e: any) => setProfile({ ...profile, bio: e.target.value })}
                />
                <BrutalInput
                  label="Batch Year"
                  value={profile.year}
                  onChange={(e: any) => setProfile({ ...profile, year: e.target.value })}
                  placeholder="2026"
                />
                <BrutalInput
                  label="Major"
                  value={profile.major}
                  onChange={(e: any) => setProfile({ ...profile, major: e.target.value })}
                />
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Requested Designation</label>
                  <select
                    value={profile.designation}
                    onChange={(e: any) => setProfile({ ...profile, designation: e.target.value })}
                    className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all bg-white"
                  >
                    <option value="">No designation requested</option>
                    {designationOptions.map((designation) => (
                      <option key={designation} value={designation}>{designation}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Admin approval is required before this appears publicly.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-700 mb-4 italic">{profile.bio}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-bold">Batch Year:</span> {profile.year || "Not set"}
                  </div>
                  <div>
                    <span className="font-bold">Major:</span> {profile.major}
                  </div>
                  <div>
                    <span className="font-bold">Designation:</span>{" "}
                    {profile.designationStatus === "approved" ? profile.designation || "Not set" : "Pending approval"}
                  </div>
                </div>
              </>
            )}
            {saveStatus && <p className="mt-4 text-xs font-bold text-[#2563EB]">{saveStatus}</p>}
            </>
            )}
          </BrutalCard>

          <BrutalCard>
            <h3 className="text-2xl uppercase mb-4" style={fonts.display}>Skills</h3>
            <div className="flex gap-2 flex-wrap">
              {profile.skills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-2">
                  <BrutalBadge color="bg-[#7C3AED]">{skill}</BrutalBadge>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-xs font-bold text-[#FB7185]"
                    >
                      x
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill"
                  className="flex-1 border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-3 border-2 border-dashed border-[#171717] text-xs font-bold uppercase tracking-widest hover:bg-[#F4EFEB] transition-all"
                >
                  Add Skill
                </button>
              </div>
            )}
          </BrutalCard>

          <BrutalCard>
            <h3 className="text-2xl uppercase mb-4" style={fonts.display}>Social Links</h3>
            {isEditing ? (
              <>
                <BrutalInput
                  label="GitHub Username"
                  value={profile.github}
                  onChange={(e: any) => setProfile({ ...profile, github: e.target.value })}
                />
                <BrutalInput
                  label="LinkedIn Username"
                  value={profile.linkedin}
                  onChange={(e: any) => setProfile({ ...profile, linkedin: e.target.value })}
                />
              </>
            ) : (
              <div className="flex gap-3">
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#171717] text-white border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#000] transition-all flex items-center gap-2"
                >
                  <Github size={14} /> GitHub
                </a>
                <a
                  href={`https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#2563EB] text-white border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#1D4ED8] transition-all flex items-center gap-2"
                >
                  <Linkedin size={14} /> LinkedIn
                </a>
              </div>
            )}
          </BrutalCard>

          <BrutalCard>
            <h3 className="text-2xl uppercase mb-4" style={fonts.display}>My Submissions</h3>
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-500 font-mono">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="border-2 border-[#171717] bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">{item.type}</p>
                      <h4 className="font-bold uppercase">{item.title}</h4>
                      <p className="text-xs font-mono text-slate-500">
                        {item.date ? new Date(item.date).toLocaleDateString() : "Date pending"}
                      </p>
                    </div>
                    <BrutalBadge
                      color={statusColor(item.status)}
                      text={item.status === "pending" || item.status === "submitted" || item.status === "draft" ? "text-[#171717]" : "text-white"}
                    >
                      {item.status}
                    </BrutalBadge>
                  </div>
                ))}
              </div>
            )}
          </BrutalCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <BrutalCard color="bg-[#2563EB]" className="text-white">
            <h3 className="text-xl uppercase mb-4" style={fonts.display}>Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span>Events Attended</span>
                <span className="font-bold text-lg">{stats.eventsAttended}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span>Projects Submitted</span>
                <span className="font-bold text-lg">{stats.projectsSubmitted}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span>Certificates</span>
                <span className="font-bold text-lg">{stats.certificatesEarned}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Member Since</span>
                <span className="font-bold text-xs">{stats.memberSince}</span>
              </div>
            </div>
          </BrutalCard>

          {/* Badges/Achievements */}
          <BrutalCard color="bg-[#FFE800]">
            <h3 className="text-xl uppercase mb-4" style={fonts.display}>Badges</h3>
            <p className="text-sm font-mono text-[#171717]/70">Verified badges will appear here when issued.</p>
          </BrutalCard>

          {/* Recent Activity */}
          <BrutalCard>
            <h3 className="text-xl uppercase mb-4" style={fonts.display}>Activity</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm font-mono text-slate-500">No recent activity yet.</p>
              ) : recentActivity.map((activity, idx) => (
                <div key={idx} className="pb-3 border-b border-slate-200 last:border-0">
                  <p className="text-sm font-bold">{activity.title}</p>
                  <p className="text-xs text-slate-400 font-mono">{activity.date}</p>
                </div>
              ))}
            </div>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
}

// ─── 7. ACHIEVEMENTS PAGE ──────────────────────────────────────────────────────

export function AchievementsPage() {
  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-flex items-center gap-1">
          <Trophy size={10} /> OUR JOURNEY
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Achievements
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Celebrating our milestones and the incredible journey of our Data Science community
        </p>
      </div>

      <BrutalCard color="bg-white" className="text-center">
        <Trophy size={48} className="mx-auto mb-4 text-[#FFE800]" />
        <h2 className="text-3xl uppercase mb-3" style={fonts.display}>No achievements published yet</h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Verified club achievements will appear here after they are added by the admin team.
        </p>
      </BrutalCard>

      {/* Future Goals */}
      <BrutalCard color="bg-[#2563EB]" className="text-white text-center mt-16">
        <Target size={48} className="mx-auto mb-4" />
        <h3 className="text-3xl uppercase mb-4" style={fonts.display}>What's Next?</h3>
        <p className="mb-6 max-w-2xl mx-auto">
          Follow our events, projects, and announcements to see what the community is building next.
        </p>
        <BrutalButton color="bg-white" text="text-[#2563EB]">
          Join Our Journey
        </BrutalButton>
      </BrutalCard>
    </div>
  );
}

// ─── 8. PARTNERS PAGE ──────────────────────────────────────────────────────────

export function PartnersPage() {
  const [adminPartners, setAdminPartners] = useState<any[]>([]);
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;

    async function loadPartners() {
      const data = await apiGet<any[]>("/api/partners").catch(() => []);
      if (!mounted) return;
      setAdminPartners((data || []).map((partner) => ({
        name: partner.name,
        logo: partner.logo_url,
        category: partner.category || "Partner",
        description: partner.description || "",
        website: partner.website_url,
        featured: false,
      })));
    }

    loadPartners();
    return () => {
      mounted = false;
    };
  }, []);

  const partners = adminPartners;
  const renderPartnerLogo = (partner: any, className = "") => {
    const initials = partner.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0])
      .join("")
      .toUpperCase();

    if (partner.logo && !failedLogos[partner.name]) {
      return (
        <img
          src={partner.logo}
          alt={`${partner.name} logo`}
          className={`max-w-full max-h-full object-contain ${className}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedLogos((current) => ({ ...current, [partner.name]: true }))}
        />
      );
    }

    return (
      <div className="w-20 h-20 bg-[#7C3AED] text-white border-2 border-[#171717] flex items-center justify-center text-2xl font-bold" style={fonts.display}>
        {initials || partner.name[0] || "P"}
      </div>
    );
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <BrutalBadge color="bg-[#7C3AED]" className="mb-4 inline-flex items-center gap-1">
          <Heart size={10} /> SPONSORS & PARTNERS
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Our Partners
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We're grateful to our partners who support our mission to empower students through data science
        </p>
      </div>

      {/* Featured Partner */}
      {partners.filter(p => p.featured).map((partner, idx) => (
        <BrutalCard key={idx} color="bg-[#FFE800]" className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Star size={20} className="text-[#FB7185] fill-[#FB7185]" />
            <BrutalBadge color="bg-[#FB7185]">FEATURED PARTNER</BrutalBadge>
          </div>
          <div className="md:flex md:items-center md:gap-8">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="bg-white border-2 border-[#171717] p-8 flex items-center justify-center h-48">
                {renderPartnerLogo(partner)}
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold uppercase mb-2" style={fonts.display}>{partner.name}</h2>
              <BrutalBadge color="bg-[#2563EB]" className="mb-4">{partner.category}</BrutalBadge>
              <p className="text-slate-700 mb-4 text-lg">{partner.description}</p>
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#171717] text-white border-2 border-[#171717] font-bold uppercase tracking-widest text-sm hover:bg-[#000] transition-all"
              >
                Visit Website <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </BrutalCard>
      ))}

      {/* Other Partners */}
      <h2 className="text-3xl uppercase mb-8" style={fonts.display}>All Partners</h2>
      {partners.length === 0 ? (
        <BrutalCard color="bg-white" className="mb-12 text-center">
          <Handshake size={44} className="mx-auto mb-4 text-[#7C3AED]" />
          <h3 className="text-2xl uppercase mb-2" style={fonts.display}>No partners published yet</h3>
          <p className="text-sm text-slate-600">Partners added by admins will appear here.</p>
        </BrutalCard>
      ) : (
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {partners.filter(p => !p.featured).map((partner, idx) => (
          <BrutalCard key={idx}>
            <div className="h-28 bg-white border-2 border-[#171717] mb-4 p-5 flex items-center justify-center">
              {renderPartnerLogo(partner)}
            </div>
            <BrutalBadge color="bg-[#7C3AED]" className="mb-3">{partner.category}</BrutalBadge>
            <h3 className="text-2xl font-bold uppercase mb-2" style={fonts.display}>{partner.name}</h3>
            <p className="text-sm text-slate-600 mb-4">{partner.description}</p>
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1"
              >
                Learn More <ExternalLink size={12} />
              </a>
            )}
          </BrutalCard>
        ))}
      </div>
      )}

      {/* Become a Partner CTA */}
      <BrutalCard color="bg-[#2563EB]" className="text-white text-center">
        <Zap size={48} className="mx-auto mb-4" />
        <h3 className="text-3xl uppercase mb-4" style={fonts.display}>Become a Partner</h3>
        <p className="mb-6 max-w-2xl mx-auto">
          Interested in supporting our mission? We're always looking for partners who share our passion for empowering students through data science education.
        </p>
        <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2563EB] border-2 border-[#171717] font-bold uppercase tracking-widest text-sm brutal-shadow brutal-shadow-hover transition-all">
          <Mail size={16} /> Contact Us
        </a>
      </BrutalCard>
    </div>
  );
}
