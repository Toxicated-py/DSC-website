import type { NavigateFunction } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export async function requireLoginForAction(navigate: NavigateFunction, returnTo: string) {
  if (!isSupabaseConfigured || !supabase) {
    navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
    return false;
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) return true;

  navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
  return false;
}
