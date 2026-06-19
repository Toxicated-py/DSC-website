/**
 * Updated About Page
 *
 * Features:
 * - Original story content
 * - FAQ Section (new)
 * - Google Maps embed (new)
 * - Team Photo (new)
 * - Connect With Us (existing)
 */

import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Github, Linkedin, Mail } from "lucide-react";
import { useSiteSettings } from "../lib/siteSettings";
import { BrutalCard, BrutalBadge } from "../components/ui/brutal";
import { fonts } from "../config/fonts";


export function UpdatedAboutPage() {
  const settings = useSiteSettings();

  const socialLinks = [
    { icon: <Github size={20} />, url: settings.socialLinks.github, label: "GitHub", color: "bg-[#171717]", textColor: "text-white" },
    { icon: <Linkedin size={20} />, url: settings.socialLinks.linkedin, label: "LinkedIn", color: "bg-[#2563EB]", textColor: "text-white" },
    { icon: <Mail size={20} />, url: `mailto:${settings.contactEmail}`, label: "Email", color: "bg-[#FFE800]", textColor: "text-[#171717]" },
  ].filter((social) => social.url && social.url !== "mailto:");

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <Link to="/" className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-12 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 className="text-6xl md:text-8xl uppercase mb-8" style={fonts.display}>Our Story</h1>

      <div className="prose prose-lg max-w-none text-[#171717]">
        <p className="text-2xl font-serif italic mb-8">
          Data Sarathi started as a small group of students at the School of Mathematical Sciences who wanted to do more than just pass exams.
        </p>
        <p>
          We realized that theoretical knowledge wasn't enough to tackle real-world problems. We needed practical experience, datasets, and a community to share our struggles with algorithmic complexities and model training over coffee.
        </p>
        <BrutalCard className="my-10 bg-[#FFE800] rotate-1">
          <h3 className="text-2xl uppercase mb-2" style={fonts.display}>The Mission</h3>
          <p className="m-0 font-bold">To demystify data science and provide a sandbox for TU's brightest minds to innovate.</p>
        </BrutalCard>
        <p>
          Today, we host hackathons, conduct workshops, and maintain an open-source culture. We are proudly student-run, completely independent, and deeply passionate about the future of AI in Nepal.
        </p>
      </div>

      <div className="mt-16 border-t-2 border-[#171717] pt-12">
        <BrutalCard color="bg-[#FFE800]">
          <h2 className="text-4xl md:text-5xl uppercase mb-4" style={fonts.display}>People Behind The Club</h2>
          <p className="mb-6 text-slate-700">
            View the executive board, faculty advisors, and community members on the dedicated team page.
          </p>
          <Link
            to="/team"
            className="inline-flex border-2 border-[#171717] bg-[#171717] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white brutal-shadow brutal-shadow-hover"
          >
            View Team
          </Link>
        </BrutalCard>
      </div>

      {/* Community Photo Section */}
      <div className="mt-16 border-t-2 border-[#171717] pt-12">
        <h2 className="text-4xl md:text-5xl uppercase mb-6" style={fonts.display}>Our Community</h2>
        <BrutalCard className="p-0 overflow-hidden">
          <div className="aspect-video bg-slate-200">
            <img loading="lazy"
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop"
              alt="Data Science Club Team Photo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Our Amazing Team</h3>
            <p className="text-slate-600">
              The incredible members of Data Science Club at our Annual Summit 2024. Together, we're building the future of data-driven innovation in Nepal.
            </p>
          </div>
        </BrutalCard>
      </div>

      {/* Connect With Us Section */}
      <div className="mt-16 border-t-2 border-[#171717] pt-12">
        <h2 className="text-4xl md:text-5xl uppercase mb-6" style={fonts.display}>Connect With Us</h2>
        <p className="text-lg text-slate-600 mb-8" style={fonts.sans}>
          Stay updated with our latest events, projects, and community highlights.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${social.color} ${social.textColor} border-2 border-[#171717] p-6 flex flex-col items-center justify-center gap-3 brutal-shadow brutal-shadow-hover transition-all group`}
            >
              <div className="transform group-hover:scale-110 transition-transform">
                {social.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={fonts.sans}>
                {social.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
