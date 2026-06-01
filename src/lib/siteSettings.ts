import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    discord: string;
  };
}

export const defaultSiteSettings: SiteSettings = {
  siteName: "Data Science Club - SMS TU",
  tagline: "Empowering Students Through Data",
  contactEmail: "contact@datascienceclub.sms.tu.edu.np",
  contactPhone: "+977-1-4331976",
  address: "School of Mathematical Sciences, SMS, TU, Kathmandu, Nepal",
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
  return {
    ...defaultSiteSettings,
    ...(value || {}),
    socialLinks: {
      ...defaultSiteSettings.socialLinks,
      ...(value?.socialLinks || {}),
    },
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
