import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { BrutalCard } from "../../components/ui/brutal";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured || !supabase) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        setStatus("blocked");
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setStatus(data.user ? "allowed" : "blocked");
      localStorage.setItem("dsc-auth-state", data.user ? "logged-in" : "logged-out");
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-slate-500">Checking account...</p>
        </BrutalCard>
      </div>
    );
  }

  if (status === "blocked") {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
