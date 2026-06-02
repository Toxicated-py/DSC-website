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
import {
  ArrowLeft, Github, Linkedin, Mail
} from "lucide-react";
import { useSiteSettings } from "../lib/siteSettings";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const BrutalCard = ({ children, className = "", color = "bg-white", rotate = "rotate-0", ...props }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${rotate} ${className}`} {...props}>
    {children}
  </div>
);

const BrutalBadge = ({ children, color = "bg-[#FB7185]", text = "text-white", className = "" }: any) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

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
            <img
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
