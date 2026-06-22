import React, { useState } from "react";
import { ChevronDown, Globe, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { useSiteSettings } from "../lib/siteSettings";
import { apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput, BrutalTextarea } from "../components/ui/brutal";
import { fonts } from "../config/fonts";

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
