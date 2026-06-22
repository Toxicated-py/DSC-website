import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseKey) &&
  (supabaseUrl.startsWith("https://") ||
    supabaseUrl.startsWith("http://127.0.0.1") ||
    supabaseUrl.startsWith("http://localhost")) &&
  !supabaseUrl.includes("your-project-ref") &&
  !supabaseKey.includes("your-anon-key") &&
  !supabaseKey.includes("your-anon-public-key") &&
  !supabaseKey.includes("your-publishable-key");

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
