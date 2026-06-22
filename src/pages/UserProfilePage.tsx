import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, ExternalLink, Github, Linkedin, Save, User } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch, userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput, BrutalTextarea } from "../components/ui/brutal";
import { fonts } from "../config/fonts";

function splitPhone(value: string) {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\+\d{1,4})(\d*)$/);
  return {
    code: match?.[1] || "+977",
    number: match?.[2] || cleaned.replace(/\D/g, "").slice(0, 10),
  };
}

export function UserProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newProfileLink, setNewProfileLink] = useState({ label: "", url: "" });
  const [phoneCode, setPhoneCode] = useState("+977");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    name: "Member",
    email: "",
    phone: "",
    bio: "",
    designation: "",
    designationStatus: "pending",
    memberSince: "New member",
    year: "",
    major: "",
    skills: [] as string[],
    github: "",
    linkedin: "",
    profileLinks: [] as Array<{ id?: string; label: string; url: string }>,
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
        navigate("/login?redirect=/profile");
        return;
      }

      const fallbackName =
        userData.user.user_metadata?.full_name ||
        userData.user.user_metadata?.name ||
        userData.user.email ||
        "Member";

      try {
        const [data, options, submissionRows] = await Promise.all([
          apiGet<any>("/api/me", { auth: true }),
          Promise.resolve([]),
          apiGet<any>("/api/me/submissions", { auth: true }),
        ]);

        if (!mounted) return;
        const parsedPhone = splitPhone(data?.phone || "");
        setPhoneCode(parsedPhone.code);
        setPhoneNumber(parsedPhone.number);
        setProfile((current) => ({
          ...current,
          name: data?.full_name || fallbackName,
          email: data?.email || userData.user.email || "",
          phone: data?.phone || "",
          bio: data?.bio || "",
          designation: data?.designation || "",
          designationStatus: data?.designation_status || "pending",
          memberSince: data?.created_at ? new Date(data.created_at).toLocaleDateString() : "New member",
          year: data?.batch_year ? String(data.batch_year) : "",
          major: data?.major || "",
          github: data?.github_username || "",
          linkedin: data?.linkedin_username || "",
          profileLinks: Array.isArray(data?.profile_links) ? data.profile_links : [],
          skills: Array.isArray(data?.skills) ? data.skills : [],
        }));
        setSubmissions([
          ...(submissionRows.projects || []).map((item: any) => ({ ...item, type: "Project", date: item.submitted_at || item.published_at })),
          ...(submissionRows.blog_posts || []).map((item: any) => ({ ...item, type: "Blog", date: item.published_at })),
          ...(submissionRows.event_proposals || []).map((item: any) => ({ ...item, type: "Event Proposal", date: item.submitted_at })),
          ...(submissionRows.gallery_submissions || []).map((item: any) => ({ ...item, type: "Gallery", date: item.created_at })),
          ...(submissionRows.certificates || []).map((item: any) => ({ ...item, title: item.certificate_title || item.title, type: "Certificate", date: item.created_at })),
        ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      } catch (error) {
        if (mounted) setSaveStatus(userFriendlyErrorMessage(error, "Could not load your profile. Please refresh and try again."));
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleEditToggle = async () => {
    if (isSaving) return;
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
      const fullPhone = phoneNumber ? `${phoneCode}${phoneNumber}` : "";
      setIsSaving(true);
      setSaveStatus("Saving profile...");
      try {
        await apiPatch("/api/me", {
          data: {
          full_name: profile.name,
          phone: fullPhone,
          bio: profile.bio,
          batch_year: Number.isFinite(parsedYear) ? parsedYear : null,
          major: profile.major,
          github_username: profile.github,
          linkedin_username: profile.linkedin,
          profile_links: profile.profileLinks
            .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
            .filter((link) => link.label && link.url),
          skills: profile.skills,
          },
        }, { auth: true });
        setProfile((current) => ({ ...current, phone: fullPhone }));
      } catch (error: any) {
        setSaveStatus(userFriendlyErrorMessage(error, "Could not save profile. Please check your details and try again."));
        return;
      } finally {
        setIsSaving(false);
      }
      setSaveStatus("Profile saved.");
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

  const addProfileLink = () => {
    const label = newProfileLink.label.trim();
    const url = newProfileLink.url.trim();
    if (!label || !url) return;
    setProfile({
      ...profile,
      profileLinks: [...profile.profileLinks, { id: `link-${Date.now()}`, label, url }],
    });
    setNewProfileLink({ label: "", url: "" });
  };

  const updateProfileLink = (index: number, patch: Partial<{ label: string; url: string }>) => {
    setProfile({
      ...profile,
      profileLinks: profile.profileLinks.map((link, linkIndex) => linkIndex === index ? { ...link, ...patch } : link),
    });
  };

  const removeProfileLink = (index: number) => {
    setProfile({
      ...profile,
      profileLinks: profile.profileLinks.filter((_, linkIndex) => linkIndex !== index),
    });
  };

  const ensureUrl = (url: string) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const stats = {
    eventsAttended: 0,
    projectsSubmitted: submissions.filter((item) => item.type === "Project").length,
    certificatesEarned: submissions.filter((item) => item.type === "Certificate" && ["approved", "published"].includes(item.status)).length,
    memberSince: profile.memberSince
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>
            Profile
          </h1>
          <BrutalButton
            color={isEditing ? "bg-green-500" : "bg-[#2563EB]"}
            text="text-white"
            onClick={handleEditToggle}
            className="text-xs sm:text-sm px-4 py-2 sm:px-6 sm:py-3 w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving ? (
              <><Save size={14} className="inline mr-1" /> Saving...</>
            ) : isEditing ? (
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
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-2">Phone</label>
                      <div className="flex border-2 border-[#171717] focus-within:ring-4 focus-within:ring-[#FB7185]/30 transition-all">
                        <input
                          type="tel"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(`+${e.target.value.replace(/\D/g, "").slice(0, 4)}`)}
                          className="w-20 border-r-2 border-[#171717] bg-[#F4EFEB] px-3 py-3 font-mono text-sm text-slate-600 focus:outline-none"
                          aria-label="Country code"
                        />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="98XXXXXXXX"
                          className="min-w-0 flex-1 p-3 font-mono text-sm focus:outline-none"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold uppercase mb-1" style={fonts.display}>{profile.name}</h2>
                    <p className="text-slate-600 font-mono text-sm mb-2">{profile.email}</p>
                    {profile.phone && <p className="text-slate-600 font-mono text-sm mb-2">{profile.phone}</p>}
                    <div className="flex gap-2">
                      <BrutalBadge color="bg-[#2563EB]">MEMBER</BrutalBadge>
                      <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">SIGNED IN</BrutalBadge>
                      {profile.designation && profile.designationStatus === "approved" && (
                        <BrutalBadge color="bg-[#7C3AED]">{profile.designation}</BrutalBadge>
                      )}
                    </div>
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
                    <span className="font-bold">Phone:</span> {profile.phone || "Not set"}
                  </div>
                  <div>
                    <span className="font-bold">Designation:</span>{" "}
                    {profile.designationStatus === "approved" ? profile.designation || "Not set" : "Not set"}
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
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Custom Links</p>
                  {profile.profileLinks.map((link, index) => (
                    <div key={link.id || index} className="grid md:grid-cols-[180px_1fr_auto] gap-3 items-end border-2 border-[#171717] bg-[#F4EFEB] p-3">
                      <BrutalInput
                        label="Label"
                        value={link.label}
                        onChange={(e: any) => updateProfileLink(index, { label: e.target.value })}
                        placeholder="YouTube, Website, Portfolio"
                      />
                      <BrutalInput
                        label="URL"
                        value={link.url}
                        onChange={(e: any) => updateProfileLink(index, { url: e.target.value })}
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => removeProfileLink(index)}
                        className="h-[52px] px-4 border-2 border-[#171717] bg-[#FB7185] text-white font-bold uppercase tracking-widest text-xs brutal-shadow"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="grid md:grid-cols-[180px_1fr_auto] gap-3 items-end border-2 border-dashed border-[#171717] bg-white p-3">
                    <BrutalInput
                      label="New Label"
                      value={newProfileLink.label}
                      onChange={(e: any) => setNewProfileLink({ ...newProfileLink, label: e.target.value })}
                      placeholder="YouTube"
                    />
                    <BrutalInput
                      label="New URL"
                      value={newProfileLink.url}
                      onChange={(e: any) => setNewProfileLink({ ...newProfileLink, url: e.target.value })}
                      onKeyDown={(event: any) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addProfileLink();
                        }
                      }}
                      placeholder="https://youtube.com/@yourchannel"
                    />
                    <button
                      type="button"
                      onClick={addProfileLink}
                      className="h-[52px] px-4 border-2 border-[#171717] bg-[#22C55E] text-white font-bold uppercase tracking-widest text-xs brutal-shadow"
                    >
                      Add Link
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profile.github && (
                  <a
                    href={ensureUrl(profile.github.startsWith("http") ? profile.github : `github.com/${profile.github.replace(/^@/, "")}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#171717] text-white border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#000] transition-all flex items-center gap-2"
                  >
                    <Github size={14} /> GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={ensureUrl(profile.linkedin.startsWith("http") ? profile.linkedin : `linkedin.com/in/${profile.linkedin.replace(/^@/, "")}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#2563EB] text-white border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#1D4ED8] transition-all flex items-center gap-2"
                  >
                    <Linkedin size={14} /> LinkedIn
                  </a>
                )}
                {profile.profileLinks.map((link, index) => (
                  <a
                    key={link.id || `${link.label}-${index}`}
                    href={ensureUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-[#171717] border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#FFE800] transition-all flex items-center gap-2"
                  >
                    <ExternalLink size={14} /> {link.label}
                  </a>
                ))}
                {!profile.github && !profile.linkedin && profile.profileLinks.length === 0 && (
                  <p className="text-sm font-mono text-slate-500">No links added yet.</p>
                )}
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

// âââ 7. ACHIEVEMENTS PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
