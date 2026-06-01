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
  socialLinks: Record<string, string>;
}

export interface ContactItem {
  id: string;
  type: "email" | "phone" | "address" | "other";
  label: string;
  value: string;
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

  return {
    ...defaultSiteSettings,
    ...(value || {}),
    contactEmail: primaryEmail,
    contactPhone: primaryPhone,
    address: primaryAddress,
    officeHours,
    contactItems,
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
