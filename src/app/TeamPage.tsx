import React from "react";
import { ExternalLink, Github, Mail, Users } from "lucide-react";
import { useSiteSettings } from "../lib/siteSettings";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
};

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

const profileUrl = (value: string | undefined, platform: "github" | "linkedin") => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const cleaned = value.replace(/^@/, "").replace(/^\/+/, "");
  return platform === "github"
    ? `https://github.com/${cleaned}`
    : `https://linkedin.com/in/${cleaned}`;
};

export function TeamPage() {
  const settings = useSiteSettings();
  const titleForGroup = (group: string) => {
    if (group === "executive") return "Executive Board";
    if (group === "faculty") return "Faculty Advisors";
    if (group === "member") return "Members";
    return group
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(" ");
  };
  const groups = Array.from(new Set(settings.teamMembers.map((member) => member.group || "member"))).map((group, index) => ({
    id: group,
    title: titleForGroup(group),
    color: group === "faculty" || index % 3 === 1 ? "bg-[#7C3AED] text-white" : "bg-white",
  }));

  const renderTeamMember = (member: any, color: string) => {
    const inverted = color.includes("7C3AED");

    return (
      <BrutalCard key={member.id} color={color} className="flex h-full min-h-[420px] flex-col">
        <div className="mb-4 aspect-[4/3] overflow-hidden border-2 border-[#171717] bg-slate-200">
          <img src={member.image || "/assets/dsc-logo.png"} alt={member.name} className="h-full w-full object-cover" />
        </div>
        <BrutalBadge color={inverted ? "bg-white" : "bg-[#2563EB]"} text={inverted ? "text-[#171717]" : "text-white"} className="mb-3 w-max">
          {member.position}
        </BrutalBadge>
        <h3 className="mb-1 text-2xl font-bold uppercase leading-tight" style={fonts.display}>{member.name}</h3>
        {member.meta && <p className={`mb-3 text-sm ${inverted ? "opacity-90" : "text-slate-600"}`}>{member.meta}</p>}
        {member.bio && <p className={`mb-5 line-clamp-4 text-sm ${inverted ? "opacity-90" : "text-slate-700"}`}>{member.bio}</p>}
        <div className="mt-auto flex gap-2 border-t-2 border-slate-200 pt-4">
          {member.email && (
            <a href={`mailto:${member.email}`} className="border-2 border-[#171717] bg-[#FFE800] p-2 text-[#171717]" title="Email">
              <Mail size={16} />
            </a>
          )}
        {member.linkedin && (
          <a href={profileUrl(member.linkedin, "linkedin")} target="_blank" rel="noopener noreferrer" className="border-2 border-[#171717] bg-[#2563EB] p-2 text-white" title="LinkedIn">
            <ExternalLink size={16} />
          </a>
        )}
        {member.github && (
          <a href={profileUrl(member.github, "github")} target="_blank" rel="noopener noreferrer" className="border-2 border-[#171717] bg-[#171717] p-2 text-white" title="GitHub">
            <Github size={16} />
          </a>
        )}
        {(member.profileLinks || []).map((link: any, index: number) => (
          <a
            key={`${link.label}-${index}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-[#171717] bg-white p-2 text-[#171717]"
            title={link.label || "Link"}
          >
            <ExternalLink size={16} />
          </a>
        ))}
      </div>
      </BrutalCard>
    );
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-flex items-center gap-1">
          <Users size={10} /> OUR TEAM
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Meet The Team
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          The people building and supporting the Data Science Club community.
        </p>
      </div>

      {groups.map((group) => {
        const members = settings.teamMembers.filter((member) => member.group === group.id);
        if (members.length === 0) return null;

        return (
          <section key={group.id} className="mb-20">
            <h2 className="text-3xl md:text-4xl uppercase mb-8" style={fonts.display}>
              {group.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {members.map((member) => renderTeamMember(member, group.color))}
            </div>
          </section>
        );
      })}

      {settings.teamMembers.length === 0 && (
        <BrutalCard color="bg-white" className="text-center">
          <Users size={42} className="mx-auto mb-4 text-[#2563EB]" />
          <h2 className="text-3xl uppercase mb-2" style={fonts.display}>No Team Members Added Yet</h2>
          <p className="text-slate-600">Admins can add team members from Admin Settings.</p>
        </BrutalCard>
      )}
    </div>
  );
}
