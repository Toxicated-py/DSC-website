import React from "react";
import { ExternalLink, Github, Mail, Users } from "lucide-react";
import { motion } from "motion/react";
import { useSiteSettings } from "../lib/siteSettings";
import { DSC_LOGO_SRC } from "../config/assets";


import { BrutalCard, BrutalBadge } from "../components/ui";
import { fonts } from "../config/fonts";
import { defaultViewport, scaleIn, slideLeft, staggerContainer } from "../utils/animations";

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
    color: group === "faculty" || index % 3 === 1 ? "bg-violet-600 text-white" : "bg-white",
  }));

  const renderTeamMember = (member: any, color: string) => {
    const inverted = color.includes("text-white");

    return (
      <BrutalCard key={member.id} variants={scaleIn} color={color} className="flex h-full min-h-[300px] w-full max-w-xs flex-col !p-3">
        <div className="mb-3 aspect-square overflow-hidden border-2 border-foreground bg-slate-200">
          <img loading="lazy" src={member.image || DSC_LOGO_SRC} alt={member.name} className="h-full w-full object-cover" />
        </div>
        <BrutalBadge color={inverted ? "bg-white" : "bg-primary"} text={inverted ? "text-foreground" : "text-white"} className="mb-2 w-max text-xs">
          {member.position}
        </BrutalBadge>
        <h3 className="mb-1 text-lg font-bold uppercase leading-tight" style={fonts.display}>{member.name}</h3>
        {member.meta && <p className={`mb-2 text-sm ${inverted ? "opacity-90" : "text-muted-foreground"}`}>{member.meta}</p>}
        {member.bio && <p className={`mb-3 line-clamp-2 text-sm ${inverted ? "opacity-90" : "text-slate-700"}`}>{member.bio}</p>}
        <div className="mt-auto flex gap-2 border-t-2 border-slate-200 pt-3">
          {member.email && (
            <a href={`mailto:${member.email}`} className="border-2 border-foreground bg-highlight p-2 text-foreground" title="Email">
              <Mail size={14} />
            </a>
          )}
        {member.linkedin && (
          <a href={profileUrl(member.linkedin, "linkedin")} target="_blank" rel="noopener noreferrer" className="border-2 border-foreground bg-primary p-2 text-white" title="LinkedIn">
            <ExternalLink size={14} />
          </a>
        )}
        {member.github && (
          <a href={profileUrl(member.github, "github")} target="_blank" rel="noopener noreferrer" className="border-2 border-foreground bg-foreground p-2 text-white" title="GitHub">
            <Github size={14} />
          </a>
        )}
        {(member.profileLinks || []).map((link: any, index: number) => (
          <a
            key={`${link.label}-${index}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-foreground bg-white p-2 text-foreground"
            title={link.label || "Link"}
          >
            <ExternalLink size={14} />
          </a>
        ))}
      </div>
      </BrutalCard>
    );
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <BrutalBadge color="bg-primary" className="mb-4 inline-flex items-center gap-1">
          <Users size={10} /> OUR TEAM
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Meet The Team
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The people building and supporting the Data Science Club community.
        </p>
      </div>

      {groups.map((group) => {
        const members = settings.teamMembers.filter((member) => member.group === group.id);
        if (members.length === 0) return null;

        return (
          <section key={group.id} className="mb-20">
            <motion.h2 variants={slideLeft} initial="hidden" whileInView="visible" viewport={defaultViewport} className="text-3xl md:text-4xl uppercase mb-8" style={fonts.display}>
              {group.title}
            </motion.h2>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={defaultViewport} className="grid justify-items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((member) => renderTeamMember(member, group.color))}
            </motion.div>
          </section>
        );
      })}

      {settings.teamMembers.length === 0 && (
        <BrutalCard color="bg-white" className="text-center">
          <Users size={42} className="mx-auto mb-4 text-primary" />
          <motion.h2 variants={slideLeft} initial="hidden" whileInView="visible" viewport={defaultViewport} className="text-3xl uppercase mb-2" style={fonts.display}>No Team Members Added Yet</motion.h2>
          <p className="text-muted-foreground">Admins can add team members from Admin Settings.</p>
        </BrutalCard>
      )}
    </div>
  );
}
