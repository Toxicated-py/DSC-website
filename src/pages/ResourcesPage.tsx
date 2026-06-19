/**
 * New Pages for Data Science Club Website
 *
 * PAGES INCLUDED:
 * 1. Certificate Page - View/download certificates
 * 2. Team Page - Leadership, faculty, members
 * 3. Contact Page - Form + info
 * 4. Resources Page - Learning materials
 * 5. Gallery Page - Event photos
 * 6. User Profile Page - View/edit profile
 * 7. Achievements Page - Club milestones
 * 8. Partners Page - Sponsors like Bisup
 *
 * COMPONENTS:
 * - Comment System (for blogs & projects)
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Award, Download, Calendar, Check, Users, Mail, Phone, MapPin, Globe,
  BookOpen, Code, Database, TrendingUp, Image, User, Edit, Save, X,
  Trophy, Star, Target, Zap, Heart, MessageSquare, Send, ThumbsUp,
  FileText, ExternalLink, Search, Filter, ChevronDown, Shield, GraduationCap,
  UserCheck, Crown
} from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { useSiteSettings } from "../lib/siteSettings";
import { apiGet, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { DSC_LOGO_SRC, SMS_TU_LOGO_SRC } from "../config/assets";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

const certificateTemplates: Record<string, { accent: string; surface: string; text: string; label: string }> = {
  workshop: { accent: "bg-[#2563EB]", surface: "bg-[#F4EFEB]", text: "text-[#171717]", label: "Workshop" },
  competition: { accent: "bg-[#FB7185]", surface: "bg-[#171717]", text: "text-white", label: "Competition" },
  participation: { accent: "bg-[#FFE800]", surface: "bg-white", text: "text-[#171717]", label: "Participation" },
  event: { accent: "bg-[#2563EB]", surface: "bg-[#F4EFEB]", text: "text-[#171717]", label: "Event" },
};

import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput, BrutalTextarea } from "../components/ui/brutal";

const certificateSelect =
  "id,recipient_id,title,certificate_type,issuer_name,status,issued_at,verification_code,recipient_name_snapshot,event_title_snapshot,template_style,signature_data,revoked_at,certificate_url,thumbnail_url,description,events:event_id(title,start_time)";

const certificateLegacySelect =
  "id,recipient_id,title,certificate_type,issuer_name,status,issued_at,certificate_url,thumbnail_url,description,events:event_id(title,start_time)";

const isCertificateSchemaError = (message = "") =>
  ["verification_code", "recipient_name_snapshot", "event_title_snapshot", "template_style", "revoked_at", "signature_data"].some((field) =>
    message.includes(field)
  );

const certificateSchemaMessage = "Certificate verification is not installed in the database yet. Ask an admin to run the latest Supabase migration.";

const defaultCertificateSignatures = [
  { name: "INSTRUCTOR_NAME", title: "INSTRUCTOR" },
  { name: "DIRECTOR_NAME", title: "DIRECTOR" },
  { name: "CLUB_PRESIDENT_NAME", title: "PRESIDENT" },
];

const contactFallbackMessage = "Could not send message right now. Please email us directly.";

const submitContactMessage = async (payload: { name: string; email: string; subject: string; message: string }) => {
  try {
    await apiPost("/api/contact-messages", payload);
    return "api";
  } catch (error: any) {
    if (error?.status !== 503 || !isSupabaseConfigured || !supabase) {
      throw error;
    }

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert(payload);

    if (insertError) throw insertError;
    return "supabase";
  }
};

const getCertificateDetails = (certificate: any) => {
  const event = certificate ? (Array.isArray(certificate.events) ? certificate.events[0] : certificate.events) : null;
  const recipientName = certificate?.recipient_name_snapshot || "Certificate Holder";
  const eventTitle = certificate?.event_title_snapshot || event?.title || certificate?.title || "Program";
  const issuedDate = certificate?.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" })
    : "Date pending";
  const description = certificate?.description || "For actively participating in this program and demonstrating commitment and enthusiasm.";
  const template = certificateTemplates[certificate?.template_style || "participation"] || certificateTemplates.participation;
  const signatures = Array.isArray(certificate?.signature_data) && certificate.signature_data.length
    ? certificate.signature_data
    : defaultCertificateSignatures;

  return { event, recipientName, eventTitle, issuedDate, description, template, signatures };
};

const CertificateCanvas = ({ certificate, compact = false }: { certificate: any; compact?: boolean }) => {
  const { recipientName, eventTitle, issuedDate, description, signatures } = getCertificateDetails(certificate);
  const certificateType = certificate?.certificate_type || "Participation";

  return (
    <div className={`certificate-print-area relative mx-auto overflow-hidden bg-white text-[#073B91] ${compact ? "aspect-video w-full" : "aspect-[16/9] w-full max-w-6xl"}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F8FCFF] to-[#EAF6FF]" />
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#9FC4E2]" />
      <div className="absolute -bottom-36 -left-28 h-72 w-72 rotate-45 bg-[#0066B3]" />
      <div className="absolute -bottom-40 left-10 h-80 w-80 rotate-45 bg-[#0B85C8]" />
      <div className="absolute -top-40 -right-20 h-80 w-80 rotate-45 bg-[#0783C2]" />
      <div className="absolute -right-28 top-28 h-64 w-64 rounded-full bg-[#9FC4E2]" />
      <div className="absolute right-20 top-24 h-[120%] w-20 rotate-45 bg-[#E2F2FD]" />
      <div className="absolute right-64 -bottom-28 h-[95%] w-16 rotate-45 bg-white/80" />
      <div className="relative z-10 flex h-full flex-col px-[8%] py-[6%]">
        <div className="flex items-start justify-between">
          <img src={DSC_LOGO_SRC} alt="Data Science Club logo" className={`${compact ? "h-12 w-20" : "h-28 w-36"} object-contain`} />
          <div className="text-center">
            <h1 className={`${compact ? "text-3xl" : "text-7xl"} font-black uppercase tracking-[0.12em] text-[#073B91]`} style={fonts.sans}>Certificate</h1>
            <p className={`${compact ? "text-base" : "text-4xl"} mt-2 italic uppercase text-[#0B65AE]`} style={fonts.sans}>of {certificateType}</p>
          </div>
          <img src={SMS_TU_LOGO_SRC} alt="SMS TU logo" className={`${compact ? "h-14 w-14" : "h-28 w-28"} object-contain`} />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className={`${compact ? "text-sm" : "text-3xl"} text-[#073B91]`}>This certificate is proudly presented to</p>
          <p className={`${compact ? "mt-3 text-4xl" : "mt-8 text-8xl"} leading-none text-[#0066B3]`} style={fonts.serif}>{recipientName}</p>
          <p className={`${compact ? "mt-4 max-w-xl text-sm" : "mt-10 max-w-4xl text-3xl"} leading-snug text-[#073B91]`}>
            {description.replace("DATE", issuedDate).replace("PROGRAM", eventTitle)}
          </p>
          <p className={`${compact ? "mt-2 text-xs" : "mt-5 text-lg"} font-bold uppercase tracking-widest text-[#0B65AE]`}>{eventTitle} - {issuedDate}</p>
        </div>

        <div className={`grid gap-8 ${signatures.length > 3 ? "grid-cols-4" : "grid-cols-3"}`}>
          {signatures.slice(0, 4).map((signature: any, index: number) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3 h-0.5 w-[80%] bg-[#0B65AE]" />
              <p className={`${compact ? "text-xs" : "text-2xl"} font-semibold uppercase tracking-wider text-[#0066B3]`}>{signature.name || "SIGNER_NAME"}</p>
              <p className={`${compact ? "text-[10px]" : "text-xl"} mt-1 uppercase text-[#073B91]`}>{signature.title || "SIGNER"}</p>
            </div>
          ))}
        </div>
        {certificate?.verification_code && (
          <p className="absolute bottom-4 right-6 font-mono text-[10px] uppercase tracking-widest text-[#073B91]">
            Verify: {window.location.origin}/verify/{certificate.verification_code}
          </p>
        )}
      </div>
    </div>
  );
};

const CertificatePrintStyles = () => (
  <style>{`
    @media print {
      @page { size: landscape; margin: 0; }
      body * { visibility: hidden !important; }
      .certificate-print-area, .certificate-print-area * { visibility: visible !important; }
      .certificate-print-area {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        margin: 0 !important;
        box-shadow: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print { display: none !important; }
    }
  `}</style>
);

// ─── COMMENT SYSTEM COMPONENT ──────────────────────────────────────────────────

export function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadLearningMaterials() {
      const data = await apiGet<any[]>("/api/learning-materials").catch(() => []);
      if (!mounted) return;
      setResources((data || []).map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category?.toLowerCase() || "beginner",
        type: "Link",
        description: item.description || "Learning material added by the club.",
        size: null,
        downloads: 0,
        date: item.created_at ? item.created_at.slice(0, 10) : "",
        url: item.resource_url,
      })));
    }
    loadLearningMaterials();
    return () => {
      mounted = false;
    };
  }, []);

  const typeColors: Record<string, string> = {
    PDF: "bg-[#2563EB]",
    Video: "bg-[#FB7185]",
    Link: "bg-[#FFE800]",
    Notebook: "bg-[#7C3AED]",
  };
  const typeTextColors: Record<string, string> = {
    PDF: "text-white",
    Video: "text-white",
    Link: "text-[#171717]",
    Notebook: "text-white",
  };

  const filtered = resources
    .filter(r => {
      const matchesCat = selectedCategory === "all" || r.category === selectedCategory;
      const matchesType = selectedType === "all" || r.type === selectedType;
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "popular") return b.downloads - a.downloads;
      if (sortOrder === "newest") return b.date.localeCompare(a.date);
      if (sortOrder === "oldest") return a.date.localeCompare(b.date);
      if (sortOrder === "az") return a.title.localeCompare(b.title);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const resetPage = () => setCurrentPage(1);

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 border-b-4 border-[#171717] pb-8">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-flex items-center gap-1">
          <BookOpen size={10} /> LEARNING MATERIALS
        </BrutalBadge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl uppercase leading-none mb-2" style={fonts.display}>Resources</h1>
            <p className="text-slate-600 font-mono text-sm">{filtered.length} resource{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex gap-4 text-center">
            {[
              { val: resources.reduce((s, r) => s + r.downloads, 0).toLocaleString(), label: "Total Downloads", color: "bg-[#2563EB]" },
              { val: resources.length.toString(), label: "Total Resources", color: "bg-[#FB7185]" },
            ].map(s => (
              <div key={s.label} className={`${s.color} border-2 border-[#171717] px-6 py-3 text-white`}>
                <div className="text-2xl font-bold" style={fonts.display}>{s.val}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="popular">Most Downloaded</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A → Z</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="flex gap-2 flex-wrap">
          {["all", "beginner", "intermediate", "advanced"].map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); resetPage(); }}
              className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
                selectedCategory === cat ? "bg-[#2563EB] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {cat === "all" ? "All Levels" : cat}
            </button>
          ))}
        </div>
        <div className="w-px bg-[#171717] mx-1 hidden sm:block" />
        <div className="flex gap-2 flex-wrap">
          {["all", "PDF", "Video", "Notebook", "Link"].map(type => (
            <button
              key={type}
              onClick={() => { setSelectedType(type); resetPage(); }}
              className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
                selectedType === type ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>No resources found</p>
          <p className="text-sm font-mono text-slate-400 mt-2">Admin-added learning materials will appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {paginated.map(resource => (
            <BrutalCard key={resource.id} color="bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <BrutalBadge
                    color={resource.category === "beginner" ? "bg-green-500" : resource.category === "intermediate" ? "bg-[#FFE800]" : "bg-[#FB7185]"}
                    text={resource.category === "intermediate" ? "text-[#171717]" : "text-white"}
                  >
                    {resource.category.toUpperCase()}
                  </BrutalBadge>
                </div>
                <BrutalBadge color={typeColors[resource.type] || "bg-[#2563EB]"} text={typeTextColors[resource.type] || "text-white"}>
                  {resource.type}
                </BrutalBadge>
              </div>
              <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>{resource.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{resource.description}</p>
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  {resource.size && <span>{resource.size}</span>}
                  <span className="flex items-center gap-1">
                    <Download size={11} /> {resource.downloads.toLocaleString()}
                  </span>
                </div>
                <BrutalButton
                  color="bg-[#2563EB]"
                  text="text-white"
                  className="text-xs px-4 py-2"
                  onClick={() => {
                    if ((resource as any).url) window.open((resource as any).url, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Download size={12} className="inline mr-1" />
                  {resource.type === "Link" ? "Open" : "Download"}
                </BrutalButton>
              </div>
            </BrutalCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-[#171717] font-bold text-sm transition-all ${
                currentPage === page ? "bg-[#2563EB] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* External Links */}
      <div className="mt-16">
        <h2 className="text-3xl uppercase mb-6" style={fonts.display}>Recommended Platforms</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <BrutalCard color="bg-[#FB7185]" className="text-white text-center">
            <Code size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Kaggle</h3>
            <p className="text-sm mb-4 opacity-90">Competitions & Datasets</p>
            <a href="https://kaggle.com" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-[#FB7185] border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#F4EFEB] transition-all">
              Visit Kaggle
            </a>
          </BrutalCard>
          <BrutalCard color="bg-[#7C3AED]" className="text-white text-center">
            <Database size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>Coursera</h3>
            <p className="text-sm mb-4 opacity-90">Online Courses</p>
            <a href="https://coursera.org" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-[#7C3AED] border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#F4EFEB] transition-all">
              Visit Coursera
            </a>
          </BrutalCard>
          <BrutalCard color="bg-[#2563EB]" className="text-white text-center">
            <TrendingUp size={32} className="mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase mb-2" style={fonts.display}>GitHub</h3>
            <p className="text-sm mb-4 opacity-90">Code Repositories</p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-white text-[#2563EB] border-2 border-[#171717] font-bold uppercase text-xs hover:bg-[#F4EFEB] transition-all">
              Visit GitHub
            </a>
          </BrutalCard>
        </div>
      </div>
    </div>
  );
}

// Continue with Gallery, Profile, Achievements, and Partners pages...
// (Character limit reached - will continue in next section)
