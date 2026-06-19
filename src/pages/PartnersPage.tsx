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
  Image, User, Edit, Save, Trophy, Star, Award, Target, Heart, Search, X, ChevronLeft, ChevronRight,
  Calendar, MapPin, Mail, Github, Linkedin, ExternalLink, Zap,
  TrendingUp, Users, Code, BookOpen, Shield, Crown, GraduationCap, UserCheck, Handshake
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { submitGallery } from "../lib/contentApi";


import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput, BrutalTextarea } from "../components/ui/brutal";
import { fonts } from "../config/fonts";

// âââ 5. GALLERY PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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
