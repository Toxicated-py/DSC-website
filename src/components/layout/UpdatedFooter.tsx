import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Github, Globe, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { useSiteSettings } from "../../lib/siteSettings";
import { DSC_LOGO_SRC } from "../../config/assets";
import { fonts } from "../../config/fonts";


const DiscordIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const getSocialIcon = (platform: string) => {
  const key = platform.toLowerCase();
  if (key.includes("github")) return <Github size={18} />;
  if (key.includes("linkedin")) return <Linkedin size={18} />;
  if (key.includes("twitter") || key === "x") return <Twitter size={18} />;
  if (key.includes("facebook")) return <Facebook size={18} />;
  if (key.includes("instagram")) return <Instagram size={18} />;
  if (key.includes("discord")) return <DiscordIcon size={18} />;
  return <Globe size={18} />;
};

const formatSocialLabel = (platform: string) =>
  platform
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function UpdatedFooter() {
  const settings = useSiteSettings();

  const socialLinks = [
    ...Object.entries(settings.socialLinks || {}).map(([platform, url]) => ({
      icon: getSocialIcon(platform),
      url,
      label: formatSocialLabel(platform),
    })),
    { icon: <Mail size={18} />, url: `mailto:${settings.contactEmail}`, label: "Email" },
  ].filter((social) => social.url && social.url !== "#" && social.url !== "mailto:");

  return (
    <footer className="bg-[#F4EFEB] py-12 px-6 md:px-10 border-t-2 border-[#171717]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          {/* Brand + Socials */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 w-max hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full p-[2px]">
                <img loading="lazy" src={DSC_LOGO_SRC} alt="Data Science Club logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-lg uppercase tracking-widest text-[#171717]" style={fonts.display}>
                {settings.siteName.replace(" - SMS TU", "")}
              </span>
            </Link>
            <p className="text-sm text-slate-600 max-w-xs mb-4" style={fonts.sans}>
              {settings.address}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white border-2 border-[#171717] flex items-center justify-center hover:bg-[#2563EB] hover:text-white transition-all brutal-shadow hover:brutal-shadow-hover"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm font-bold uppercase tracking-widest text-[#171717]">
            <div className="col-span-2">
              <h3 className="text-lg mb-3" style={fonts.display}>Quick Links</h3>
            </div>
            <Link to="/" className="hover:text-[#2563EB] w-max">Home</Link>
            <Link to="/events" className="hover:text-[#2563EB] w-max">Events</Link>
            <Link to="/projects" className="hover:text-[#FB7185] w-max">Projects</Link>
            <Link to="/blog" className="hover:text-[#2563EB] w-max">Blog</Link>
            <Link to="/resources" className="hover:text-[#2563EB] w-max">Resources</Link>
            <Link to="/verify" className="hover:text-[#2563EB] w-max">Verify Certificate</Link>
            <Link to="/about" className="hover:text-[#2563EB] w-max">About Us</Link>
            <Link to="/gallery" className="hover:text-[#7C3AED] w-max">Gallery</Link>
            <Link to="/partners" className="hover:text-[#FB7185] w-max">Partners</Link>
            <Link to="/contact" className="hover:text-[#FB7185] w-max">Contact</Link>
          </div>

          {/* Brand + Credit */}
          <div className="md:text-right text-[#171717]">
            <h3 className="text-3xl" style={fonts.display}>{settings.siteName}</h3>
            <p className="text-xs text-slate-500 mt-4 font-mono">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {settings.tagline}
            </p>
            <p className="text-xs text-slate-500 mt-4">
              Made by{" "}
              <a
                href="https://github.com/Toxicated-py"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#2563EB] hover:text-[#171717] transition-colors"
              >
                Ashish Adhikari
              </a>
            </p>
            <div className="mt-6 flex md:justify-end items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Domain &amp; hosting by
              </span>
              <a
                href="https://www.bisup.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#171717] text-white border-2 border-[#171717] hover:bg-white hover:text-[#171717] transition-colors"
                style={fonts.sans}
              >
                Bisup
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
