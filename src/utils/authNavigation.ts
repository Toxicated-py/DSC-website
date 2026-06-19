import type { NavigateFunction } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export function requireLoginForAction(navigate: NavigateFunction, returnTo: string) {
  if (!isSupabaseConfigured || !supabase || localStorage.getItem("dsc-auth-state") !== "logged-in") {
    localStorage.setItem("dsc-auth-state", "logged-out");
    navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
    return false;
  }
  return true;
}
