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


const certificateTemplates: Record<string, { accent: string; surface: string; text: string; label: string }> = {
  workshop: { accent: "bg-[#2563EB]", surface: "bg-[#F4EFEB]", text: "text-[#171717]", label: "Workshop" },
  competition: { accent: "bg-[#FB7185]", surface: "bg-[#171717]", text: "text-white", label: "Competition" },
  participation: { accent: "bg-[#FFE800]", surface: "bg-white", text: "text-[#171717]", label: "Participation" },
  event: { accent: "bg-[#2563EB]", surface: "bg-[#F4EFEB]", text: "text-[#171717]", label: "Event" },
};

import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput, BrutalTextarea } from "../components/ui/brutal";
import { fonts } from "../config/fonts";

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
          <img loading="lazy" src={DSC_LOGO_SRC} alt="Data Science Club logo" className={`${compact ? "h-12 w-20" : "h-28 w-36"} object-contain`} />
          <div className="text-center">
            <h1 className={`${compact ? "text-3xl" : "text-7xl"} font-black uppercase tracking-[0.12em] text-[#073B91]`} style={fonts.sans}>Certificate</h1>
            <p className={`${compact ? "text-base" : "text-4xl"} mt-2 italic uppercase text-[#0B65AE]`} style={fonts.sans}>of {certificateType}</p>
          </div>
          <img loading="lazy" src={SMS_TU_LOGO_SRC} alt="SMS TU logo" className={`${compact ? "h-14 w-14" : "h-28 w-28"} object-contain`} />
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

// âââ COMMENT SYSTEM COMPONENT ââââââââââââââââââââââââââââââââââââââââââââââââââ

export function ContactPage() {
  const settings = useSiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [contactStatus, setContactStatus] = useState("");
  const [contactStatusType, setContactStatusType] = useState<"success" | "error">("success");

  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setContactStatusType("error");
      setContactStatus("Please fill out every field before sending.");
      return;
    }

    setSubmittingMessage(true);
    try {
      await submitContactMessage(payload);
      setContactStatusType("success");
      setContactStatus("Message sent. We will get back to you soon.");
      toast.success("Message sent.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      const message = userFriendlyErrorMessage(error, contactFallbackMessage);
      setContactStatusType("error");
      setContactStatus(message);
      toast.error(message);
    } finally {
      setSubmittingMessage(false);
    }
  };

  const FAQItem = ({ question, answer, isOpen, onClick }: any) => (
    <div className="border-2 border-[#171717] mb-4">
      <button
        onClick={onClick}
        className="w-full p-4 flex items-center justify-between bg-white hover:bg-[#F4EFEB] transition-all text-left"
      >
        <span className="font-bold uppercase tracking-wide text-sm pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-[#F4EFEB] border-t-2 border-[#171717]">
          <p className="text-sm text-slate-700">{answer}</p>
        </div>
      )}
    </div>
  );

  const contactColorClasses = ["bg-[#2563EB]", "bg-[#7C3AED]", "bg-[#FB7185]", "bg-[#FFE800] text-[#171717]"];
  const getContactIcon = (type: string) => {
    if (type === "email") return <Mail size={24} className="flex-shrink-0" />;
    if (type === "phone") return <Phone size={24} className="flex-shrink-0" />;
    if (type === "address") return <MapPin size={24} className="flex-shrink-0" />;
    return <Globe size={24} className="flex-shrink-0" />;
  };
  const getContactHref = (type: string, value: string) => {
    if (type === "email") return `mailto:${value}`;
    if (type === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
    return "";
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-flex items-center gap-1">
          <Mail size={10} /> GET IN TOUCH
        </BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-4" style={fonts.display}>
          Contact Us
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Contact Form */}
        <BrutalCard>
          <h2 className="text-2xl uppercase mb-6" style={fonts.display}>Send Message</h2>
          <form onSubmit={handleSubmit}>
            <BrutalInput
              label="Your Name"
              type="text"
              value={formData.name}
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <BrutalInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <BrutalInput
              label="Subject"
              type="text"
              value={formData.subject}
              onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <BrutalTextarea
              label="Message"
              value={formData.message}
              onChange={(e: any) => setFormData({ ...formData, message: e.target.value })}
              required
            />
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full" disabled={submittingMessage}>
              <Send size={16} className="inline mr-2" /> {submittingMessage ? "Sending..." : "Send Message"}
            </BrutalButton>
            {contactStatus && (
              <div className={`mt-4 border-2 border-[#171717] p-3 text-xs font-bold uppercase tracking-widest ${
                contactStatusType === "success" ? "bg-[#FFE800]" : "bg-[#FB7185] text-white"
              }`}>
                {contactStatus}
              </div>
            )}
          </form>
        </BrutalCard>

        {/* Contact Info */}
        <div className="space-y-6">
          {settings.contactItems.map((item, index) => {
            const href = getContactHref(item.type, item.value);
            return (
              <BrutalCard
                key={item.id || `${item.type}-${index}`}
                color={contactColorClasses[index % contactColorClasses.length]}
                className={index % contactColorClasses.length === 3 ? "" : "text-white"}
              >
                <div className="flex items-start gap-4">
                  {getContactIcon(item.type)}
                  <div>
                    <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>{item.label}</h3>
                    {href ? (
                      <a href={href} className="font-mono text-sm hover:underline break-all">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{item.value}</p>
                    )}
                  </div>
                </div>
              </BrutalCard>
            );
          })}

          <BrutalCard color="bg-[#FFE800]">
            <div className="flex items-start gap-4">
              <Globe size={24} className="flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold uppercase mb-2" style={fonts.display}>Office Hours</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{settings.officeHours}</p>
              </div>
            </div>
          </BrutalCard>
        </div>
      </div>

      {/* Location */}
      <BrutalCard className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl uppercase mb-2" style={fonts.display}>Our Location</h2>
            <p className="text-sm text-slate-600">Open the club location directly in Google Maps.</p>
          </div>
          <a
            href="https://maps.app.goo.gl/c1rvMgY3tpjtVwcUA"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFE800] text-[#171717] border-2 border-[#171717] font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover"
          >
            <MapPin size={16} /> SMS, TU
          </a>
        </div>
      </BrutalCard>

      {/* FAQ Section */}
      <div className="mt-16 border-t-2 border-[#171717] pt-12">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare size={32} />
          <h2 className="text-4xl md:text-5xl uppercase" style={fonts.display}>
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-lg text-slate-600 mb-8">
          Everything you need to know about joining and participating in our community
        </p>

        <div>
          {settings.faqs.map((faq, index) => (
            <FAQItem
              key={faq.id || index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === index}
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
            />
          ))}
        </div>

        <BrutalCard color="bg-[#2563EB]" className="mt-8 text-white text-center">
          <h3 className="text-2xl uppercase mb-2" style={fonts.display}>Still Have Questions?</h3>
          <p className="mb-4 opacity-90">
            Feel free to use the contact form above or reach out directly. We're here to help!
          </p>
        </BrutalCard>
      </div>
    </div>
  );
}

// âââ 4. RESOURCES PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
