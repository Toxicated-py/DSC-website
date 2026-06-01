import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  officeHours: string;
  contactItems: ContactItem[];
  faqs: FAQItem[];
  teamMembers: TeamMember[];
  socialLinks: Record<string, string>;
}

export interface ContactItem {
  id: string;
  type: "email" | "phone" | "address" | "other";
  label: string;
  value: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface TeamMember {
  id: string;
  group: "executive" | "faculty" | "member";
  name: string;
  position: string;
  meta: string;
  image: string;
  bio: string;
  email: string;
  linkedin: string;
  github: string;
}

export const defaultSiteSettings: SiteSettings = {
  siteName: "Data Science Club - SMS TU",
  tagline: "Empowering Students Through Data",
  contactEmail: "contact@datascienceclub.sms.tu.edu.np",
  contactPhone: "+977-1-4331976",
  address: "School of Mathematical Sciences, SMS, TU, Kathmandu, Nepal",
  officeHours: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed",
  contactItems: [
    { id: "email-primary", type: "email", label: "Email", value: "contact@datascienceclub.sms.tu.edu.np" },
    { id: "phone-primary", type: "phone", label: "Phone", value: "+977-1-4331976" },
    { id: "address-primary", type: "address", label: "Address", value: "School of Mathematical Sciences, SMS, TU, Kathmandu, Nepal" },
  ],
  faqs: [
    {
      id: "membership",
      question: "How do I become a member?",
      answer: "Simply register on our website using any valid email address. Once registered, you can attend events, submit projects, and access exclusive resources. To become a verified Club Member, attend at least 3 events and submit one project.",
    },
    {
      id: "event-cost",
      question: "Are events free for members?",
      answer: "Yes! All our workshops, talks, and regular events are completely free for registered members. Some special competitions may have nominal registration fees to cover logistics.",
    },
    {
      id: "experience",
      question: "Do I need prior experience in data science?",
      answer: "Not at all! We welcome students from all backgrounds and skill levels. We have beginner-friendly workshops and resources to help you get started, as well as advanced sessions for experienced members.",
    },
    {
      id: "event-frequency",
      question: "How often do you organize events?",
      answer: "We typically organize 2-3 events per month, including workshops, guest lectures, hackathons, and social gatherings. Check our Events page for the latest schedule.",
    },
    {
      id: "collaboration",
      question: "Can I collaborate on projects with other members?",
      answer: "Absolutely! We encourage collaboration. You can find teammates through our Discord server, project boards, or at our events. Many of our featured projects are team efforts.",
    },
    {
      id: "tools",
      question: "What tools and technologies do you focus on?",
      answer: "We primarily focus on Python, R, SQL, data visualization, machine learning, statistics, and real-world data applications.",
    },
    {
      id: "contribute",
      question: "How can I contribute to the club?",
      answer: "Attend events, submit projects, help organize workshops, create content, mentor juniors, or apply for leadership positions. We value every contribution.",
    },
    {
      id: "certificates",
      question: "Do you offer certificates?",
      answer: "Yes. We provide certificates for selected workshops, competitions, event participation, and approved club activities.",
    },
  ],
  teamMembers: [
    {
      id: "president",
      group: "executive",
      name: "Ashish Adhikari",
      position: "President",
      meta: "Data Science Club",
      image: "/assets/dsc-logo.png",
      bio: "Leading the club community, events, and data-driven initiatives.",
      email: "",
      linkedin: "",
      github: "",
    },
    {
      id: "faculty-advisor",
      group: "faculty",
      name: "Faculty Advisor",
      position: "Advisor",
      meta: "SMS, TU",
      image: "/assets/sms-tu-logo.png",
      bio: "Guiding the club with academic support and institutional coordination.",
      email: "",
      linkedin: "",
      github: "",
    },
  ],
  socialLinks: {
    github: "https://github.com/datascienceclub",
    linkedin: "https://linkedin.com/company/datascienceclub",
    twitter: "https://twitter.com/datascienceclub",
    facebook: "https://facebook.com/datascienceclub",
    instagram: "https://instagram.com/datascienceclub",
    discord: "https://discord.gg/datascienceclub",
  },
};

export function mergeSiteSettings(value?: Partial<SiteSettings> | null): SiteSettings {
  const hasSavedSocialLinks = Boolean(value && Object.prototype.hasOwnProperty.call(value, "socialLinks"));
  const hasSavedContactItems = Boolean(value && Object.prototype.hasOwnProperty.call(value, "contactItems"));
  const contactItems = hasSavedContactItems
    ? [...(value?.contactItems || [])]
    : [
        { id: "email-primary", type: "email" as const, label: "Email", value: value?.contactEmail || defaultSiteSettings.contactEmail },
        { id: "phone-primary", type: "phone" as const, label: "Phone", value: value?.contactPhone || defaultSiteSettings.contactPhone },
        { id: "address-primary", type: "address" as const, label: "Address", value: value?.address || defaultSiteSettings.address },
      ];
  const primaryEmail = contactItems.find((item) => item.type === "email")?.value || value?.contactEmail || defaultSiteSettings.contactEmail;
  const primaryPhone = contactItems.find((item) => item.type === "phone")?.value || value?.contactPhone || defaultSiteSettings.contactPhone;
  const primaryAddress = contactItems.find((item) => item.type === "address")?.value || value?.address || defaultSiteSettings.address;
  const officeHours = value?.officeHours || defaultSiteSettings.officeHours;
  const faqs = value?.faqs?.length ? value.faqs : defaultSiteSettings.faqs;
  const teamMembers = value?.teamMembers?.length ? value.teamMembers : defaultSiteSettings.teamMembers;

  return {
    ...defaultSiteSettings,
    ...(value || {}),
    contactEmail: primaryEmail,
    contactPhone: primaryPhone,
    address: primaryAddress,
    officeHours,
    contactItems,
    faqs,
    teamMembers,
    socialLinks: hasSavedSocialLinks ? { ...(value?.socialLinks || {}) } : defaultSiteSettings.socialLinks,
  };
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured || !supabase) return defaultSiteSettings;

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "site")
    .maybeSingle();

  if (error || !data?.value) return defaultSiteSettings;
  return mergeSiteSettings(data.value as Partial<SiteSettings>);
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    let mounted = true;

    loadSiteSettings().then((nextSettings) => {
      if (mounted) setSettings(nextSettings);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}
