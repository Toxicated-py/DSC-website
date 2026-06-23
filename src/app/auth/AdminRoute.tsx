import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { BrutalCard } from "../../components/ui/brutal";
import { fonts } from "../../config/fonts";


export const getRoleSet = (profile: any) => {
  const roles = new Set<string>();
  if (typeof profile?.role === "string") roles.add(profile.role.toLowerCase());
  if (Array.isArray(profile?.roles)) {
    profile.roles.forEach((role: unknown) => {
      if (typeof role === "string") roles.add(role.toLowerCase());
    });
  }
  return roles;
};

export const isFullAdminRole = (profile: any) => {
  const roles = getRoleSet(profile);
  return roles.has("admin") || roles.has("president");
};

export const canOpenAdminPanel = (profile: any) => {
  const roles = getRoleSet(profile);
  return isFullAdminRole(profile) || roles.has("event_manager");
};

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "login" | "forbidden">("checking");

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus("login");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!userData.user) {
        setStatus("login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,roles")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!mounted) return;
      setStatus(canOpenAdminPanel(profile) ? "allowed" : "forbidden");
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-slate-500">Checking admin access...</p>
        </BrutalCard>
      </div>
    );
  }

  if (status === "login") {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (status === "forbidden") {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <BrutalCard color="bg-[#FFE800]" className="max-w-xl text-center">
          <Shield size={40} className="mx-auto mb-4" />
          <h1 className="text-3xl uppercase mb-3" style={fonts.display}>Admin Access Required</h1>
          <p className="text-sm font-mono text-slate-700">
            Your account needs the admin, president, or event manager role to open this panel.
          </p>
        </BrutalCard>
      </div>
    );
  }

  return <>{children}</>;
}
