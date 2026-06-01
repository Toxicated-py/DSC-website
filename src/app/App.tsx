import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Database, Menu, X, Users, ArrowRight, ArrowLeft, Search, Camera, Check, Calendar, MapPin, Tag, QrCode, Trophy, TrendingUp, Bell, Zap, Target, Star, Award, Clock, BookOpen, Code, GitBranch, Home, Github, Linkedin, Twitter, Instagram, Mail, Facebook, UserCheck, GraduationCap, Shield, ChevronDown, Image, Handshake, LogOut, User, FileText, BookMarked } from "lucide-react";
import { NewLoginPage, AdminPanelPage, UserBadge } from "./AuthAndAdmin";
import { ComprehensiveAdminPanel } from "./ComprehensiveAdmin";
// New Pages
import { TeamPage, ContactPage, ResourcesPage, CommentSection } from "./NewPages";
import { MyCertificates } from "./MyCertificates";
import { CertificateVerifyPage } from "./CertificateVerifyPage";
import { GalleryPage, UserProfilePage, AchievementsPage, PartnersPage } from "./NewPages2";
import { UpdatedAboutPage } from "./UpdatedAbout";
import { UpdatedFooter } from "./UpdatedFooter";
import { getPersistenceLabel, publishBlogPost, submitEventProposal, submitProject } from "../lib/contentApi";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

// ─── Custom Discord Icon ───────────────────────────────────────────────────────
const DiscordIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// ─── Font Configuration ────────────────────────────────────────────────────────
const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

// ─── Global Styles ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes scan {
      0%, 100% { top: 0%; }
      50% { top: 100%; }
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .brutal-shadow {
      box-shadow: 6px 6px 0px #171717;
    }
    .brutal-shadow-hover:hover {
      box-shadow: 2px 2px 0px #171717;
      transform: translate(4px, 4px);
    }
    .brutal-shadow-lg {
      box-shadow: 12px 12px 0px #171717;
    }
  `}</style>
);

// ─── Shared Components ─────────────────────────────────────────────────────────

const BrutalButton = ({ children, color = "bg-[#FFE800]", text = "text-[#171717]", className = "", ...props }: any) => (
  <button 
    className={`inline-flex max-w-full items-center justify-center gap-2 px-6 py-3 text-center ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest whitespace-normal break-words brutal-shadow brutal-shadow-hover transition-all ${className}`} 
    {...props}
  >
    {children}
  </button>
);

const BrutalCard = ({ children, className = "", color = "bg-white", rotate = "rotate-0", ...props }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${rotate} ${className}`} {...props}>
    {children}
  </div>
);

const BrutalBadge = ({ children, color = "bg-[#FB7185]", text="text-white", className = "" }: any) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

const createCertificateCode = () => {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 12).toUpperCase();
};

const formatCertificateError = (message: string) =>
  ["verification_code", "recipient_name_snapshot", "event_title_snapshot", "template_style", "revoked_at", "signature_data"].some((field) => message.includes(field))
    ? "Certificate verification is not installed in Supabase yet. Run the latest certificate migration, then try again."
    : message.toLowerCase().includes("row-level security")
      ? "Certificate issuing is blocked by Supabase permissions. Run the latest certificate event-manager policy migration, then try again."
    : message;

function requireLoginForAction(navigate: ReturnType<typeof useNavigate>, returnTo: string) {
  if (localStorage.getItem("dsc-auth-state") !== "logged-in") {
    navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
    return false;
  }
  return true;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus(localStorage.getItem("dsc-auth-state") === "logged-out" ? "blocked" : "allowed");
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

function AdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "login" | "forbidden">("checking");

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus(localStorage.getItem("dsc-auth-state") === "logged-in" ? "allowed" : "login");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!userData.user) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        setStatus("login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!mounted) return;
      setStatus(profile?.role === "admin" || profile?.role === "organizer" ? "allowed" : "forbidden");
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
            Your account needs the admin or organizer role to open this panel.
          </p>
        </BrutalCard>
      </div>
    );
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ─── Layout Components ─────────────────────────────────────────────────────────

type NavDropdownItem = { label: string; path: string; icon: React.ReactNode };
type NavItem =
  | { label: string; path: string; icon?: React.ReactNode; dropdown?: undefined }
  | { label: string; path?: undefined; icon?: React.ReactNode; dropdown: NavDropdownItem[] };

function DropdownMenu({
  items,
  label,
  openDropdown,
  onEnter,
  onLeave,
  activePaths,
  location,
}: {
  items: NavDropdownItem[];
  label: string;
  openDropdown: string | null;
  onEnter: (l: string) => void;
  onLeave: () => void;
  activePaths: string[];
  location: { pathname: string };
}) {
  const isActive = activePaths.includes(location.pathname);
  return (
    <div className="relative" onMouseEnter={() => onEnter(label)} onMouseLeave={onLeave}>
      <button
        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors pb-1 ${
          isActive ? "text-[#171717] border-b-2 border-[#171717]" : "text-slate-500 hover:text-[#171717]"
        }`}
      >
        {label}
        <ChevronDown size={12} className={`transition-transform ${openDropdown === label ? "rotate-180" : ""}`} />
      </button>
      {openDropdown === label && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-[#F4EFEB] border-2 border-[#171717] brutal-shadow z-50"
          onMouseEnter={() => onEnter(label)}
          onMouseLeave={onLeave}
        >
          {items.map((sub, i) => (
            <Link
              key={`${sub.path}-${sub.label}`}
              to={sub.path}
              onClick={() => onLeave()}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors
                ${i < items.length - 1 ? "border-b-2 border-[#171717]" : ""}
                ${location.pathname === sub.path ? "bg-[#171717] text-white" : "hover:bg-[#2563EB] hover:text-white"}`}
            >
              {sub.icon}
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (isSupabaseConfigured) return false;
    return localStorage.getItem("dsc-auth-state") !== "logged-out";
  });
  const [currentUser, setCurrentUser] = useState({
    name: "Member",
    role: "student",
    verified: false,
    designation: "",
  });

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    let mounted = true;
    const clearStaleSession = () => {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-") && key.includes("auth-token"))
        .forEach((key) => localStorage.removeItem(key));
      localStorage.setItem("dsc-auth-state", "logged-out");
      setIsLoggedIn(false);
      setCurrentUser({ name: "Member", role: "student", verified: false, designation: "" });
    };
    const syncSession = async (session: Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["getSession"]>>["data"]["session"]) => {
      if (!mounted) return;
      if (!isSupabaseConfigured) {
        setIsLoggedIn(localStorage.getItem("dsc-auth-state") !== "logged-out");
        return;
      }
      if (!session?.user) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        setIsLoggedIn(false);
        setCurrentUser({ name: "Member", role: "student", verified: false, designation: "" });
        return;
      }

      const displayName =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        session.user.email ||
        "Member";
      localStorage.setItem("dsc-auth-state", "logged-in");
      setIsLoggedIn(true);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name,email,role,membership_status,designation,designation_status")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!mounted) return;
      if (profileError) {
        clearStaleSession();
        return;
      }
      setCurrentUser({
        name: profile?.full_name || profile?.email || displayName,
        role: profile?.role || "student",
        verified: profile?.membership_status === "approved",
        designation: profile?.designation_status === "approved" ? profile?.designation || "" : "",
      });
    };

    supabase?.auth
      .getSession()
      .then(({ data }) => {
        void syncSession(data.session);
      })
      .catch(() => {
        if (mounted) clearStaleSession();
      });
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });
    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const navItems: NavItem[] = [
    { label: "Home", path: "/", icon: <Home size={13} /> },
    { label: "Events", path: "/events", icon: <Calendar size={13} /> },
    { label: "Projects", path: "/projects", icon: <Code size={13} /> },
    { label: "Blog", path: "/blog", icon: <FileText size={13} /> },
    ...(isLoggedIn
      ? [
          {
            label: "Resources",
            path: "/resources",
            icon: <BookOpen size={13} />,
          } as NavItem,
        ]
      : [{ label: "Resources", path: "/resources", icon: <BookOpen size={13} /> } as NavItem]),
    {
      label: "Community",
      dropdown: [
        { label: "About Us", path: "/about", icon: <BookMarked size={14} /> },
        { label: "Team", path: "/team", icon: <Users size={14} /> },
        { label: "Gallery", path: "/gallery", icon: <Image size={14} /> },
        { label: "Partners", path: "/partners", icon: <Handshake size={14} /> },
        { label: "Contact", path: "/contact", icon: <Mail size={14} /> },
      ],
    },
  ];

  const handleEnter = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setOpenDropdown(label);
  };
  const handleLeave = () => {
    dropdownTimer.current = setTimeout(() => setOpenDropdown(null), 130);
  };

  const handleUserEnter = () => {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current);
    setUserMenuOpen(true);
  };
  const handleUserLeave = () => {
    userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 130);
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    localStorage.setItem("dsc-auth-state", "logged-out");
    setIsLoggedIn(false);
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const canOpenAdmin = currentUser.role === "admin" || currentUser.role === "organizer";

  const dropdownActivePaths: Record<string, string[]> = {
    Resources: ["/resources"],
    Community: ["/about", "/team", "/gallery", "/partners", "/contact"],
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#F4EFEB] border-b-2 border-[#171717] py-3 px-6 md:px-8"
          : "bg-[#F4EFEB] py-5 px-6 md:px-8"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 flex items-center justify-center bg-white p-1.5">
            <img src="/assets/dsc-logo.png" alt="Data Science Club logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm tracking-widest text-[#171717] uppercase hidden xl:block" style={fonts.sans}>
            Data Science Club
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 flex-1 justify-center" style={fonts.sans}>
          {navItems.map((item) => {
            if (item.dropdown) {
              return (
                <DropdownMenu
                  key={item.label}
                  label={item.label}
                  items={item.dropdown}
                  openDropdown={openDropdown}
                  onEnter={handleEnter}
                  onLeave={handleLeave}
                  activePaths={dropdownActivePaths[item.label] || []}
                  location={location}
                />
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors pb-1 ${
                  location.pathname === item.path
                    ? "text-[#171717] border-b-2 border-[#171717]"
                    : "text-slate-500 hover:text-[#171717]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <>
              {canOpenAdmin && (
                <Link to="/admin">
                  <button className="px-3 py-2 bg-[#FB7185] text-white text-xs font-bold uppercase tracking-widest border-2 border-transparent hover:border-[#171717] transition-all flex items-center gap-1">
                    <Shield size={11} /> Admin
                  </button>
                </Link>
              )}
              {/* User menu */}
              <div className="relative" onMouseEnter={handleUserEnter} onMouseLeave={handleUserLeave}>
                <button className="flex items-center gap-2 px-3 py-2 border-2 border-[#171717] bg-white hover:bg-[#F4EFEB] transition-all">
                  <UserBadge role={currentUser.role} verified={currentUser.verified} designation={currentUser.designation} />
                  <ChevronDown size={11} className={`transition-transform text-slate-500 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-44 bg-[#F4EFEB] border-2 border-[#171717] brutal-shadow z-50"
                    onMouseEnter={handleUserEnter}
                    onMouseLeave={handleUserLeave}
                  >
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-[#171717] hover:bg-[#2563EB] hover:text-white transition-colors">
                      <User size={13} /> View Profile
                    </Link>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-[#171717] hover:bg-[#2563EB] hover:text-white transition-colors">
                      <Home size={13} /> Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#FB7185] hover:bg-[#FB7185] hover:text-white transition-colors">
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <button className="px-5 py-2 bg-[#FB7185] text-white text-xs font-bold uppercase tracking-widest border-2 border-transparent hover:border-[#171717] transition-all">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-[#171717]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="fixed top-full left-0 w-full bg-[#F4EFEB] border-b-2 border-[#171717] p-6 flex flex-col gap-4 md:hidden z-40 max-h-[80vh] overflow-y-auto">
          {isLoggedIn && (
            <div className="pb-4 border-b-2 border-[#171717] flex items-center justify-between">
              <div>
                <UserBadge role={currentUser.role} verified={currentUser.verified} designation={currentUser.designation} />
                <p className="text-sm font-bold mt-2">{currentUser.name}</p>
                {currentUser.designation && (
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{currentUser.designation}</p>
                )}
              </div>
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className="p-2 border-2 border-[#171717] hover:bg-[#2563EB] hover:text-white transition-colors">
                <User size={16} />
              </Link>
            </div>
          )}

          {navItems.map((item) => {
            if (item.dropdown) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between text-sm font-bold text-[#171717] uppercase tracking-widest py-1"
                  >
                    {item.label}
                    <ChevronDown size={15} className={`transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="mt-2 ml-4 flex flex-col gap-3 border-l-2 border-[#171717] pl-4">
                      {item.dropdown.map((sub) => (
                        <Link key={sub.path + sub.label} to={sub.path} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-widest hover:text-[#2563EB]">
                          {sub.icon} {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.path} to={item.path!} onClick={() => setMobileOpen(false)}
                className="text-sm font-bold text-[#171717] uppercase tracking-widest flex items-center gap-2 hover:text-[#2563EB]">
                {item.icon} {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t-2 border-[#171717] flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                {canOpenAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 bg-[#FB7185] text-white text-sm font-bold uppercase tracking-widest border-2 border-[#171717] flex items-center justify-center gap-2">
                      <Shield size={15} /> Admin Panel
                    </button>
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="w-full py-3 bg-white text-[#FB7185] text-sm font-bold uppercase tracking-widest border-2 border-[#171717] flex items-center justify-center gap-2">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full py-3 bg-[#FB7185] text-white text-sm font-bold uppercase tracking-widest border-2 border-[#171717]">
                  Login / Join
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const socialLinks = [
    { icon: <Github size={18} />, url: "https://github.com/datascienceclub", label: "GitHub" },
    { icon: <Linkedin size={18} />, url: "https://linkedin.com/company/datascienceclub", label: "LinkedIn" },
    { icon: <Twitter size={18} />, url: "https://twitter.com/datascienceclub", label: "Twitter" },
    { icon: <Facebook size={18} />, url: "https://facebook.com/datascienceclub", label: "Facebook" },
    { icon: <Instagram size={18} />, url: "https://instagram.com/datascienceclub", label: "Instagram" },
    { icon: <DiscordIcon size={18} />, url: "https://discord.gg/datascienceclub", label: "Discord" },
    { icon: <Mail size={18} />, url: "mailto:contact@datascienceclub.sms.tu.edu.np", label: "Email" },
  ];

  return (
    <footer className="bg-[#F4EFEB] py-12 px-6 md:px-10 border-t-2 border-[#171717]">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-3 gap-10 items-start">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4 w-max hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-white flex items-center justify-center p-1.5">
              <img src="/assets/dsc-logo.png" alt="Data Science Club logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg uppercase tracking-widest text-[#171717]" style={fonts.display}>Data Science Club</span>
          </Link>
          <p className="text-sm text-slate-600 max-w-xs mb-4" style={fonts.sans}>
            School of Mathematical Sciences, SMS, TU.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-3 mt-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white border-2 border-[#171717] flex items-center justify-center hover:bg-[#2563EB] hover:text-white transition-all brutal-shadow hover:brutal-shadow-hover"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-sm font-bold uppercase tracking-widest text-[#171717]">
          <Link to="/about" className="hover:text-[#2563EB] w-max">About</Link>
          <Link to="/events" className="hover:text-[#2563EB] w-max">Events</Link>
          <Link to="/projects" className="hover:text-[#FB7185] w-max">Projects Gallery</Link>
          <Link to="/blog" className="hover:text-[#2563EB] w-max">Blog</Link>
        </div>
        
        <div className="md:text-right text-[#171717]">
          <h3 className="text-3xl" style={fonts.display}>DATA SARATHI</h3>
          <p className="text-xs text-slate-500 mt-4 font-mono">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
          <div className="mt-4 flex md:justify-end items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Domain &amp; hosting by</span>
            <a
              href="https://www.bisup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#171717] text-white border-2 border-[#171717] hover:bg-white hover:text-[#171717] transition-colors"
              style={fonts.sans}
            >
              Bisup
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-[#F4EFEB] text-[#171717] flex flex-col">
      <GlobalStyles />
      <ScrollToTop />
      <Nav />
      <main className="flex-1 pt-[68px]">
        <Outlet />
      </main>
      <UpdatedFooter />
    </div>
  );
}

// ─── Pages ─────────────────────────────────────────────────────────────────────

function HomePage() {
  const [homeEvents, setHomeEvents] = useState<any[]>([]);
  const [homeProject, setHomeProject] = useState<any>(null);
  const [homeStats, setHomeStats] = useState({
    members: 0,
    events: 0,
    projects: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadHomePageData() {
      if (!isSupabaseConfigured || !supabase) return;

      const [eventsList, eventCount, projectCount, memberCount, latestProject] = await Promise.all([
        supabase
          .from("events")
          .select("id,title,event_type,start_time,capacity")
          .in("status", ["approved", "published"])
          .order("start_time", { ascending: true })
          .limit(4),
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .in("status", ["approved", "published"]),
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .in("status", ["approved", "published"]),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("membership_status", ["approved", "published"]),
        supabase
          .from("projects")
          .select("id,title,category,technologies")
          .in("status", ["approved", "published"])
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(1),
      ]);

      if (!mounted) return;

      const colors = ["bg-[#2563EB]", "bg-[#FB7185]", "bg-[#171717]", "bg-[#7C3AED]"];
      setHomeEvents((eventsList.data || []).map((event, index) => {
        const start = event.start_time ? new Date(event.start_time) : null;
        return {
          id: event.id,
          num: start ? start.toLocaleDateString(undefined, { day: "2-digit" }) : "--",
          month: start ? start.toLocaleDateString(undefined, { month: "short", year: "numeric" }).toUpperCase() : "DATE TBD",
          label: event.title,
          type: (event.event_type || "EVENT").toUpperCase(),
          capacity: event.capacity,
          color: colors[index % colors.length],
        };
      }));
      setHomeProject(latestProject.data?.[0] || null);
      setHomeStats({
        members: memberCount.count || 0,
        events: eventCount.count || 0,
        projects: projectCount.count || 0,
      });
    }

    loadHomePageData();

    return () => {
      mounted = false;
    };
  }, []);

  const nextEvent = homeEvents[0];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-16 pb-0 md:pt-20 overflow-hidden min-h-screen flex flex-col border-b-2 border-[#171717]">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-[#E0DEF4]/60 mix-blend-multiply" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 80%)" }} />
          <div className="absolute -top-10 -left-10 w-[500px] h-[500px] bg-[#FADEE1]/50 mix-blend-multiply" style={{ clipPath: "polygon(0 0, 80% 10%, 100% 100%, 10% 80%)" }} />
          <div className="absolute top-32 right-32 md:right-64 w-24 h-24 rounded-full border-2 border-dashed border-[#FB7185]/60" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 w-full flex-1 grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Left: title + tagline */}
          <div className="flex flex-col justify-center">
            <div className="relative inline-block select-none max-w-max">
              <h1
                className="text-7xl sm:text-[9rem] md:text-[11rem] lg:text-[13rem] leading-[0.85] text-[#171717]"
                style={{ ...fonts.display, textShadow: "8px 8px 0px #2563EB, 16px 16px 0px #FB7185" }}
              >
                DATA<br />SARATHI
              </h1>
            </div>

            <div className="mt-10 md:mt-14 max-w-xl relative">
              <div className="hidden md:block absolute -top-12 right-0 text-slate-400">
                <svg width="56" height="36" viewBox="0 0 60 40" fill="none">
                  <path d="M2 38C15 20 40 10 58 10M58 10L48 2M58 10L52 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-xl md:text-2xl text-[#171717] leading-snug" style={fonts.serif}>
                Student-run. Kathmandu-made. Data-driven with <i className="text-[#FB7185]">soul.</i>
              </p>
              <div className="mt-8 flex gap-4 flex-wrap">
                <Link to="/register">
                  <BrutalButton color="bg-[#FFE800]">Join the Club</BrutalButton>
                </Link>
                <Link to="/events">
                  <BrutalButton color="bg-white">See Events</BrutalButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: floating UI cards */}
          <div className="hidden lg:flex flex-col gap-4 pt-8 pb-8">
            {/* Success / membership card */}
            <div className="bg-[#FB7185] border-2 border-[#171717] p-5 brutal-shadow rotate-1 relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80" style={fonts.sans}>Membership</span>
                <div className="w-7 h-7 rounded-full bg-white border-2 border-[#171717] flex items-center justify-center">
                  <Check size={14} className="text-[#171717]" strokeWidth={3} />
                </div>
              </div>
              <p className="text-white font-bold text-lg leading-none" style={fonts.display}>COMMUNITY</p>
              <p className="text-white/70 text-xs font-mono mt-1">Members, organizers, and builders</p>
            </div>

            {/* Upcoming event card */}
            <Link
              to={nextEvent ? `/events/${nextEvent.id}` : "/events"}
              className="block bg-white border-2 border-[#171717] p-5 brutal-shadow brutal-shadow-hover -rotate-1 transition-all group"
              aria-label={nextEvent ? `Open event ${nextEvent.label}` : "Open events"}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400" style={fonts.sans}>Next Up</span>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-[#2563EB] leading-none" style={fonts.display}>{nextEvent?.num || "--"}</p>
                  <p className="text-xs font-bold uppercase text-slate-500 mt-1">{nextEvent?.month || "No event yet"}</p>
                </div>
                <BrutalBadge color="bg-[#2563EB]">{nextEvent?.type || "Event"}</BrutalBadge>
              </div>
              <p className="text-sm font-bold mt-3 text-[#171717] uppercase" style={fonts.display}>{nextEvent?.label || "Approved events will appear here"}</p>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-400 mt-1">
                <Users size={12} /> {nextEvent?.capacity ? `${nextEvent.capacity} spots` : "Club event"}
              </div>
            </Link>

            {/* Projects teaser */}
            <Link
              to={homeProject ? `/projects/${homeProject.id}` : "/projects"}
              className="block bg-[#7C3AED] border-2 border-[#171717] p-5 brutal-shadow brutal-shadow-hover rotate-1 transition-all group cursor-pointer"
              aria-label={homeProject ? `Open project ${homeProject.title}` : "Open projects"}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70" style={fonts.sans}>Projects</span>
              <p className="text-white font-bold text-xl leading-tight mt-2" style={fonts.display}>{homeProject?.title || "PUBLISHED PROJECTS"}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {(homeProject?.technologies?.length ? homeProject.technologies : [homeProject?.category || "Admin approved"]).map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase border border-white/30">{t}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80">
                View Project <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom event stat cards */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 w-full mt-12 md:mt-16">
          <div className="border-t-2 border-[#171717] pt-1">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {homeEvents.length === 0 ? (
                <div className="col-span-2 md:col-span-4 bg-white p-6 text-center">
                  <p className="font-bold uppercase">No published events yet.</p>
                  <p className="mt-1 text-xs font-mono text-slate-500">Approved events will appear here automatically.</p>
                </div>
              ) : homeEvents.map((ev, i) => (
                <Link
                  to={`/events/${ev.id}`}
                  key={i}
                  className={`relative ${ev.color} border-r-2 border-[#171717] last:border-r-0 p-5 md:p-6 flex flex-col text-white hover:opacity-90 transition-opacity group`}
                  style={{ borderBottomWidth: 0 }}
                >
                  {ev.hot && (
                    <span className="absolute top-3 right-3 bg-[#FFE800] text-[#171717] text-[9px] font-bold uppercase px-1.5 py-0.5 border border-[#171717]">HOT</span>
                  )}
                  <span className="text-5xl font-bold leading-none mb-1" style={fonts.display}>{ev.num}</span>
                  <span className="text-[10px] font-bold tracking-widest opacity-70 mb-1" style={fonts.sans}>{ev.month}</span>
                  <span className="text-[10px] font-bold tracking-widest opacity-70 mb-3" style={fonts.sans}>{ev.type}</span>
                  <span className="text-sm font-bold leading-tight uppercase mt-auto" style={fonts.sans}>{ev.label}</span>
                  <ArrowRight size={14} className="mt-2 opacity-60 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section className="py-24 border-b-2 border-[#171717] bg-[#F4EFEB]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-block">About Us</BrutalBadge>
              <h2 className="text-5xl md:text-7xl text-[#171717] uppercase leading-none" style={fonts.display}>
                More than<br/>just a club.
              </h2>
            </div>
            <Link to="/about" className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-[#2563EB] hover:text-[#171717] transition-colors group shrink-0">
              Our Full Story <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border-2 border-[#171717]">
            <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-[#171717] bg-white">
              <p className="text-4xl font-bold text-[#2563EB] mb-2" style={fonts.display}>{homeStats.members}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4" style={fonts.sans}>Active Members</p>
              <p className="text-sm text-slate-600 leading-relaxed" style={fonts.sans}>
                Members added through the connected account system will make up the active club community.
              </p>
            </div>
            <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-[#171717] bg-[#2563EB] text-white">
              <p className="text-4xl font-bold mb-2" style={fonts.display}>{homeStats.events}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-4" style={fonts.sans}>Events Run</p>
              <p className="text-sm opacity-80 leading-relaxed" style={fonts.sans}>
                Approved events added by admins will power the public events page and member dashboard.
              </p>
            </div>
            <div className="p-8 bg-[#F4EFEB]">
              <p className="text-4xl font-bold text-[#FB7185] mb-2" style={fonts.display}>{homeStats.projects}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4" style={fonts.sans}>Student Projects</p>
              <p className="text-sm text-slate-600 leading-relaxed" style={fonts.sans}>
                Published student projects will appear in the showcase after admin review.
              </p>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-10 items-center">
            <p className="text-xl md:text-2xl text-[#171717] leading-relaxed" style={fonts.serif}>
              We started as a handful of students at SMS who wanted to do{" "}
              <i className="text-[#FB7185]">more than just pass exams.</i> Today, we host hackathons, conduct workshops, and maintain an open-source culture — proudly student-run and deeply passionate about the future of AI in Nepal.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: <Users size={18}/>, title: "Student-Run", desc: "Every decision, event, and project is led by students, for students." },
                { icon: <Database size={18}/>, title: "Open-Source First", desc: "All our tooling and project repos are publicly available on GitHub." },
                { icon: <MapPin size={18}/>, title: "Kathmandu-Made", desc: "Rooted at SMS TU, Kirtipur — but thinking global." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border-2 border-[#171717] bg-white brutal-shadow">
                  <div className="w-9 h-9 bg-[#FFE800] border-2 border-[#171717] flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest" style={fonts.sans}>{item.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5" style={fonts.sans}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-[#2563EB] text-white text-center border-b-2 border-[#171717] relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h2 className="text-6xl md:text-8xl mb-8 uppercase" style={fonts.display}>Ready to build?</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90" style={fonts.serif}>
            Join the community of builders, researchers, and data enthusiasts at SMS TU.
          </p>
          <BrutalButton
            color="bg-[#FFE800]"
            onClick={() => alert("Sorry, currently we're not accepting applications. We'll announce it when we'll accept it.")}
          >
            Apply For Membership
          </BrutalButton>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  const socialLinks = [
    { icon: <Github size={20} />, url: "https://github.com/datascienceclub", label: "GitHub", color: "bg-[#171717]", textColor: "text-white" },
    { icon: <Linkedin size={20} />, url: "https://linkedin.com/company/datascienceclub", label: "LinkedIn", color: "bg-[#2563EB]", textColor: "text-white" },
    { icon: <Twitter size={20} />, url: "https://twitter.com/datascienceclub", label: "Twitter", color: "bg-[#1DA1F2]", textColor: "text-white" },
    { icon: <Facebook size={20} />, url: "https://facebook.com/datascienceclub", label: "Facebook", color: "bg-[#1877F2]", textColor: "text-white" },
    { icon: <Instagram size={20} />, url: "https://instagram.com/datascienceclub", label: "Instagram", color: "bg-[#FB7185]", textColor: "text-white" },
    { icon: <DiscordIcon size={20} />, url: "https://discord.gg/datascienceclub", label: "Discord", color: "bg-[#5865F2]", textColor: "text-white" },
    { icon: <Mail size={20} />, url: "mailto:contact@datascienceclub.sms.tu.edu.np", label: "Email", color: "bg-[#FFE800]", textColor: "text-[#171717]" },
  ];

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <Link to="/" className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-12 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-6xl md:text-8xl uppercase mb-8" style={fonts.display}>Our Story</h1>
      
      <div className="prose prose-lg max-w-none text-[#171717]">
        <p className="text-2xl font-serif italic mb-8">
          Data Sarathi started as a small group of students at the School of Mathematical Sciences who wanted to do more than just pass exams.
        </p>
        <p>
          We realized that theoretical knowledge wasn't enough to tackle real-world problems. We needed practical experience, datasets, and a community to share our struggles with algorithmic complexities and model training over coffee.
        </p>
        <BrutalCard className="my-10 bg-[#FFE800] rotate-1">
          <h3 className="text-2xl uppercase mb-2" style={fonts.display}>The Mission</h3>
          <p className="m-0 font-bold">To demystify data science and provide a sandbox for Tu's brightest minds to innovate.</p>
        </BrutalCard>
        <p>
          Today, we host hackathons, conduct workshops, and maintain an open-source culture. We are proudly student-run, completely independent, and deeply passionate about the future of AI in Nepal.
        </p>
      </div>

      {/* Connect With Us Section */}
      <div className="mt-16 border-t-2 border-[#171717] pt-12">
        <h2 className="text-4xl md:text-5xl uppercase mb-6" style={fonts.display}>Connect With Us</h2>
        <p className="text-lg text-slate-600 mb-8" style={fonts.sans}>
          Stay updated with our latest events, projects, and community highlights.
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${social.color} ${social.textColor} border-2 border-[#171717] p-6 flex flex-col items-center justify-center gap-3 brutal-shadow brutal-shadow-hover transition-all group`}
            >
              <div className="transform group-hover:scale-110 transition-transform">
                {social.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={fonts.sans}>
                {social.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("date-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let mounted = true;
    async function loadEvents() {
      setLoadingEvents(true);
      if (!isSupabaseConfigured || !supabase) {
        setAllEvents([]);
        setLoadingEvents(false);
        return;
      }
      const { data } = await supabase
        .from("events")
        .select("id,title,description,event_type,start_time,capacity,status,created_at")
        .in("status", ["approved", "published"])
        .order("start_time", { ascending: true });
      if (!mounted) return;
      const colors = ["bg-[#2563EB]", "bg-[#FB7185]", "bg-[#171717]", "bg-[#7C3AED]"];
      const today = new Date();
      setAllEvents((data || []).map((event, index) => {
        const start = event.start_time ? new Date(event.start_time) : new Date(event.created_at || Date.now());
        return {
          id: event.id,
          title: event.title,
          date: start.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
          dateSort: start.toISOString().slice(0, 10),
          type: (event.event_type || "EVENT").toUpperCase(),
          total: event.capacity || 0,
          filled: 0,
          color: colors[index % colors.length],
          status: start >= today ? "upcoming" : "past",
        };
      }));
      setLoadingEvents(false);
    }
    loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = allEvents
    .filter(ev => {
      const matchesTab = activeTab === "all" || ev.status === activeTab;
      const matchesType = typeFilter === "all" || ev.type === typeFilter;
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "date-asc") return a.dateSort.localeCompare(b.dateSort);
      if (sortOrder === "date-desc") return b.dateSort.localeCompare(a.dateSort);
      if (sortOrder === "popular") return b.filled - a.filled;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-[#171717] pb-8 mb-10 gap-6">
        <div>
          <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-block">Events Sandbox</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Events</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} event{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <BrutalButton
          color="bg-[#2563EB]"
          text="text-white"
          className="w-full self-stretch text-sm sm:w-auto md:self-start"
          onClick={() => navigate("/events/propose")}
        >
          <Calendar size={14} className="inline mr-2" />
          Propose Event
        </BrutalButton>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
          className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["upcoming", "past", "all"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); resetPage(); }}
              className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === tab ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {["all", "WORKSHOP", "SEMINAR", "COMPETITION", "COMMUNITY"].map(type => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); resetPage(); }}
              className={`px-3 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-[10px] transition-all ${
                typeFilter === type ? "bg-[#2563EB] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
          <select
            value={sortOrder}
            onChange={e => { setSortOrder(e.target.value); resetPage(); }}
            className="px-3 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-[10px] bg-white focus:outline-none cursor-pointer"
          >
            <option value="date-asc">Date ↑</option>
            <option value="date-desc">Date ↓</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingEvents ? "Loading events" : "No events found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingEvents ? "Please wait..." : "Approved events will appear here after admin review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map(ev => {
            const pct = Math.round((ev.filled / ev.total) * 100);
            return (
              <div
                key={ev.id}
                onClick={() => navigate(`/events/${ev.id}`)}
                className={`relative cursor-pointer ${ev.color} border-2 border-[#171717] p-6 flex flex-col text-white brutal-shadow-lg brutal-shadow-hover transition-all group`}
              >
                {(ev as any).hot && (
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full border-2 border-[#171717] flex items-center justify-center text-[#171717] bg-[#FFE800] text-xs font-bold rotate-12">HOT</div>
                )}
                {ev.status === "past" && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 border border-white/30 text-[9px] font-bold uppercase tracking-widest">PAST</div>
                )}
                <div className="text-6xl font-bold leading-none mb-1" style={fonts.display}>{ev.date.split(" ")[0]}</div>
                <div className="text-sm font-bold tracking-widest mb-5 opacity-80">{ev.date.split(" ").slice(1).join(" ")}</div>
                <h3 className="text-xl font-bold leading-tight mb-4 flex-1" style={fonts.sans}>{ev.title}</h3>
                <div className="flex items-center justify-between mb-3">
                  <BrutalBadge color="bg-white" text="text-[#171717]">{ev.type}</BrutalBadge>
                  <span className="text-xs font-mono opacity-80">{ev.filled}/{ev.total}</span>
                </div>
                <div className="w-full bg-white/20 h-1.5">
                  <div className="bg-white h-1.5 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 text-[10px] font-mono opacity-60">{pct}% filled</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-[#171717] font-bold text-sm transition-all ${
                currentPage === page ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reserveStatus, setReserveStatus] = useState("");
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [canManageEvent, setCanManageEvent] = useState(false);
  const [managerStatus, setManagerStatus] = useState("");
  const [loadingEvent, setLoadingEvent] = useState(true);

  const isUuidEvent = Boolean(id && /^[0-9a-f-]{36}$/i.test(id));

  useEffect(() => {
    let mounted = true;

    async function loadEventWorkspace() {
      if (!isUuidEvent || !isSupabaseConfigured || !supabase || !id) {
        setLoadingEvent(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const [{ data: eventRow }, { count }] = await Promise.all([
        supabase
          .from("events")
          .select("id,title,event_type,description,short_description,start_time,end_time,venue,capacity,status,registration_open,created_by")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", id)
          .eq("status", "registered"),
      ]);
      if (!mounted) return;
      if (!eventRow) {
        setLoadingEvent(false);
        return;
      }

      setEventInfo({ ...eventRow, registeredCount: count || 0 });
      setLoadingEvent(false);

      if (!userData.user) return;

      const [{ data: profile }, { data: staffRows }] = await Promise.all([
        supabase.from("profiles").select("role,email").eq("id", userData.user.id).maybeSingle(),
        supabase.from("event_staff").select("id,email,staff_role,can_scan").eq("event_id", id),
      ]);

      const isManager =
        profile?.role === "admin" ||
        eventRow.created_by === userData.user.id ||
        (staffRows || []).some((staff) => {
          const staffEmail = staff.email?.toLowerCase();
          return staff.can_scan && staffEmail && staffEmail === (profile?.email || userData.user.email || "").toLowerCase();
        });

      setCanManageEvent(Boolean(isManager));

      if (isManager) {
        const { data: registrations } = await supabase
          .from("event_registrations")
          .select("id,user_id,ticket_code,status,registered_at,checked_in_at,profiles:user_id(full_name,email)")
          .eq("event_id", id)
          .order("registered_at", { ascending: false });

        if (!mounted) return;
        setAttendees(registrations || []);
      }
    }

    loadEventWorkspace();

    return () => {
      mounted = false;
    };
  }, [id, isUuidEvent]);

  const checkInAttendee = async (registrationId: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    setManagerStatus("");
    const { error } = await supabase
      .from("event_registrations")
      .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
      .eq("id", registrationId);
    if (error) {
      setManagerStatus(error.message);
      return;
    }
    setAttendees(attendees.map((attendee) => attendee.id === registrationId ? {
      ...attendee,
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
    } : attendee));
  };

  const issueBulkCertificates = async () => {
    if (!isSupabaseConfigured || !supabase || !id) return;
    const checkedIn = attendees.filter((attendee) => attendee.status === "checked_in" || attendee.checked_in_at);
    if (!checkedIn.length) {
      setManagerStatus("No checked-in attendees found.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const rows = checkedIn.map((attendee) => ({
      recipient_id: attendee.profiles?.id || attendee.user_id,
      event_id: id,
      issued_by: userData.user?.id || null,
      title: `${eventInfo?.title || "Event"} Participation Certificate`,
      certificate_type: "Event",
      issuer_name: "Data Science Club",
      issued_at: new Date().toISOString().slice(0, 10),
      verification_code: createCertificateCode(),
      recipient_name_snapshot: attendee.profiles?.full_name || attendee.profiles?.email || "Participant",
      event_title_snapshot: eventInfo?.title || "Event",
      template_style: "event",
      signature_data: [
        { name: "INSTRUCTOR_NAME", title: "INSTRUCTOR" },
        { name: "DIRECTOR_NAME", title: "DIRECTOR" },
        { name: "CLUB_PRESIDENT_NAME", title: "PRESIDENT" },
      ],
      description: `This certifies participation in ${eventInfo?.title || "the event"}.`,
      status: "approved",
    })).filter((row) => row.recipient_id);
    if (!rows.length) {
      setManagerStatus("Could not find attendee profile IDs for certificates.");
      return;
    }
    const recipientIds = rows.map((row) => row.recipient_id);
    const { data: existingCerts, error: existingError } = await supabase
      .from("certificates")
      .select("recipient_id")
      .eq("event_id", id)
      .in("recipient_id", recipientIds)
      .neq("status", "archived");
    if (existingError) {
      setManagerStatus(formatCertificateError(existingError.message));
      return;
    }
    const existingRecipients = new Set((existingCerts || []).map((certificate) => certificate.recipient_id));
    const newRows = rows.filter((row) => !existingRecipients.has(row.recipient_id));
    if (!newRows.length) {
      setManagerStatus("Certificates were already issued for all checked-in attendees.");
      return;
    }

    const { error } = await supabase.from("certificates").insert(newRows);
    if (error) {
      setManagerStatus(formatCertificateError(error.message));
      return;
    }
    const skipped = rows.length - newRows.length;
    setManagerStatus(`Issued ${newRows.length} certificate${newRows.length === 1 ? "" : "s"}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}` : ""}.`);
  };

  const reserveSpot = async () => {
    setReserveStatus("");
    if (!requireLoginForAction(navigate, `/events/${id}`)) return;
    if (!id) {
      setReserveStatus("Invalid event.");
      return;
    }
    if (!isSupabaseConfigured || !supabase || !isUuidEvent) {
      navigate("/ticket");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }

    const [{ data: eventRow }, { count }] = await Promise.all([
      supabase.from("events").select("id,capacity,registration_open,start_time,status").eq("id", id).maybeSingle(),
      supabase.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", id).eq("status", "registered"),
    ]);

    if (!eventRow) {
      setReserveStatus("Event not found.");
      return;
    }
    if (!eventRow.registration_open || eventRow.status === "archived") {
      setReserveStatus("Registration is closed for this event.");
      return;
    }
    if (eventRow.start_time && new Date(eventRow.start_time).getTime() < Date.now()) {
      setReserveStatus("This event has ended.");
      return;
    }
    if ((count || 0) >= eventRow.capacity) {
      setReserveStatus("This event is full.");
      return;
    }

    const { error } = await supabase.from("event_registrations").insert({
      event_id: id,
      user_id: userData.user.id,
      status: "registered",
    });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      setReserveStatus(error.message);
      return;
    }
    navigate("/ticket");
  };

  const displayEvent = eventInfo;

  if (loadingEvent) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-slate-500">Loading event...</p>
        </BrutalCard>
      </div>
    );
  }

  if (!displayEvent) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
        <button onClick={() => navigate("/events")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
          <ArrowLeft size={16} /> Back to Events
        </button>
        <BrutalCard color="bg-white">
          <h1 className="text-4xl uppercase mb-3" style={fonts.display}>Event not found</h1>
          <p className="text-sm text-slate-600">Only approved events are visible publicly.</p>
        </BrutalCard>
      </div>
    );
  }

  const startDate = displayEvent.start_time ? new Date(displayEvent.start_time) : null;
  const eventEnded = Boolean(displayEvent.end_time && new Date(displayEvent.end_time).getTime() < Date.now());

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <BrutalCard color="bg-[#2563EB]" className="text-white mb-12 border-4">
        <div className="flex justify-between items-start mb-10">
           <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{displayEvent.event_type || "WORKSHOP"}</BrutalBadge>
           <div className="text-right">
             <div className="text-5xl" style={fonts.display}>{startDate ? startDate.getDate() : "24"}</div>
             <div className="font-bold tracking-widest">{startDate ? startDate.toLocaleString("en", { month: "short" }).toUpperCase() : "FEB"}</div>
           </div>
        </div>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-6" style={fonts.display}>{displayEvent.title}</h1>
        <div className="flex flex-wrap gap-6 font-mono text-sm opacity-90">
          <span className="flex items-center gap-2"><MapPin size={16}/> {displayEvent.venue || "TBA"}</span>
          <span className="flex items-center gap-2"><Calendar size={16}/> {startDate ? startDate.toLocaleString() : "Date TBA"}</span>
          <span className="flex items-center gap-2"><Users size={16}/> {displayEvent.registeredCount || 0}/{displayEvent.capacity || 0} Spots Filled</span>
        </div>
      </BrutalCard>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 prose prose-lg text-[#171717]">
          <h2 className="uppercase font-bold tracking-widest text-xl mb-4">About The Event</h2>
          <p>{displayEvent.description || displayEvent.short_description || "Event details will be updated soon."}</p>
        </div>
        <div>
          <BrutalCard className="sticky top-32">
            <h3 className="uppercase font-bold tracking-widest text-lg mb-6">Registration</h3>
            <p className="text-sm font-mono text-slate-500 mb-6">Registration closes in 48 hours.</p>
            {reserveStatus && <p className="mb-4 text-xs font-bold text-[#FB7185]">{reserveStatus}</p>}
            <BrutalButton onClick={reserveSpot} className="w-full" color="bg-[#FB7185]" text="text-white">Reserve Spot</BrutalButton>
            {canManageEvent && isUuidEvent && (
              <div className="mt-4 pt-4 border-t-2 border-[#171717] space-y-3">
                <BrutalButton onClick={() => navigate(`/scanner?event=${id}`)} className="w-full text-xs" color="bg-[#171717]" text="text-white">
                  <QrCode size={14} className="inline mr-2" /> Scan Tickets
                </BrutalButton>
                <BrutalButton onClick={issueBulkCertificates} className="w-full text-xs" color="bg-[#FFE800]">
                  <Award size={14} className="inline mr-2" /> Bulk Certificates
                </BrutalButton>
              </div>
            )}
          </BrutalCard>
        </div>
      </div>

      {canManageEvent && isUuidEvent && (
        <BrutalCard color="bg-white" className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl uppercase" style={fonts.display}>Organizer Workspace</h2>
            <BrutalBadge color={eventEnded ? "bg-slate-400" : "bg-green-500"}>{eventEnded ? "Ended" : "Active"}</BrutalBadge>
          </div>
          {managerStatus && <p className="mb-4 text-xs font-bold text-[#2563EB]">{managerStatus}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#171717]">
                  <th className="text-left p-3 uppercase text-xs">Attendee</th>
                  <th className="text-left p-3 uppercase text-xs">Ticket</th>
                  <th className="text-left p-3 uppercase text-xs">Status</th>
                  <th className="text-right p-3 uppercase text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => {
                  const profile = Array.isArray(attendee.profiles) ? attendee.profiles[0] : attendee.profiles;
                  return (
                    <tr key={attendee.id} className="border-b border-slate-200">
                      <td className="p-3 font-bold">{profile?.full_name || profile?.email || "Member"}</td>
                      <td className="p-3 font-mono text-xs">{attendee.ticket_code}</td>
                      <td className="p-3">{attendee.checked_in_at ? "Checked in" : attendee.status}</td>
                      <td className="p-3 text-right">
                        {!attendee.checked_in_at && (
                          <button onClick={() => checkInAttendee(attendee.id)} className="px-3 py-2 border-2 border-[#171717] bg-green-500 text-white text-xs font-bold uppercase">
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {attendees.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-slate-500 font-mono" colSpan={4}>No registrations yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </BrutalCard>
      )}
    </div>
  );
}

function EventProposalPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("dsc-event-proposal-draft");
    return saved ? JSON.parse(saved) : {
      title: "",
      type: "WORKSHOP",
      proposedDate: "",
      proposedTime: "",
      venue: "",
      capacity: "40",
      host: "",
      coordinators: "",
      summary: "",
      prerequisites: "",
      outcomes: "",
    };
  });
  const [status, setStatus] = useState("");
  const [submittingProject, setSubmittingProject] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem("dsc-event-proposal-draft", JSON.stringify(next));
  };

  const submitProposal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingProposal) return;
    if (!requireLoginForAction(navigate, "/events/propose")) return;
    if (!form.title.trim() || !form.summary.trim() || !form.host.trim()) {
      setStatus("Title, host, and summary are required before submitting.");
      return;
    }
    const coordinatorEmails = form.coordinators
      .split(/[,\n]/)
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean);
    const invalidCoordinator = coordinatorEmails.find((email: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidCoordinator) {
      setStatus(`Invalid coordinator email: ${invalidCoordinator}`);
      return;
    }
    try {
      setSubmittingProposal(true);
      const result = await submitEventProposal({
        title: form.title,
        event_type: form.type,
        proposed_date: form.proposedDate || null,
        proposed_time: form.proposedTime || null,
        venue: form.venue,
        capacity: Number(form.capacity) || null,
        host: form.host,
        coordinator_emails: coordinatorEmails,
        summary: form.summary,
        prerequisites: form.prerequisites,
        outcomes: form.outcomes,
        status: "pending",
      });
      localStorage.removeItem("dsc-event-proposal-draft");
      setStatus(`Event proposal submitted. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit proposal.");
    } finally {
      setSubmittingProposal(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/events")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#2563EB]" className="mb-4 inline-block">Event Proposal</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Propose Event</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Suggest a workshop, seminar, competition, or community session for Data Science Club.</p>
      </div>

      <form onSubmit={submitProposal} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Event Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Intro to Computer Vision" />
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-widest mb-2">Event Type</span>
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
              >
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="COMPETITION">Competition</option>
                <option value="COMMUNITY">Community</option>
              </select>
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <BrutalField label="Proposed Date" type="date" value={form.proposedDate} onChange={(value) => updateField("proposedDate", value)} />
            <BrutalField label="Time" type="time" value={form.proposedTime} onChange={(value) => updateField("proposedTime", value)} />
            <BrutalField label="Capacity" type="number" value={form.capacity} onChange={(value) => updateField("capacity", value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Venue" value={form.venue} onChange={(value) => updateField("venue", value)} placeholder="SMS Lab 3" />
            <BrutalField label="Host / Speaker" value={form.host} onChange={(value) => updateField("host", value)} placeholder="Your name or proposed speaker" />
          </div>

          <BrutalTextArea
            label="Event Coordinators"
            rows={3}
            value={form.coordinators}
            onChange={(value) => updateField("coordinators", value)}
            placeholder="Add coordinator emails, separated by commas or new lines. Non-members are allowed."
          />
          <BrutalTextArea label="Short Summary" rows={4} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="What is this event about and who should attend?" />
          <BrutalTextArea label="Prerequisites" rows={4} value={form.prerequisites} onChange={(value) => updateField("prerequisites", value)} placeholder="Python basics, laptop required, dataset links..." />
          <BrutalTextArea label="Expected Outcomes" rows={5} value={form.outcomes} onChange={(value) => updateField("outcomes", value)} placeholder="Students will build..., understand..., submit..." />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-[#FFE800]">
            <h2 className="text-3xl uppercase mb-4" style={fonts.display}>Proposal Preview</h2>
            <div className="border-2 border-[#171717] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB]">{form.type}</p>
              <h3 className="text-2xl uppercase leading-tight mt-2" style={fonts.display}>{form.title || "Event title"}</h3>
              <p className="text-sm text-slate-600 mt-2">{form.summary || "Your event summary preview will appear here."}</p>
              <div className="mt-4 text-xs font-mono text-slate-500">
                {form.proposedDate || "Date TBD"} {form.proposedTime && `at ${form.proposedTime}`} · {form.venue || "Venue TBD"}
              </div>
            </div>
            <p className="mt-4 text-xs font-mono text-slate-700">Draft autosaves locally after each edit.</p>
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#2563EB]" text="text-white" className="w-full" disabled={submittingProposal}>
              {submittingProposal ? "Submitting..." : "Submit Proposal"}
            </BrutalButton>
            <BrutalButton
              type="button"
              color="bg-white"
              className="w-full"
              onClick={() => {
                if (!requireLoginForAction(navigate, "/events/propose")) return;
                setStatus("Draft saved in this browser.");
              }}
            >
              Save Draft
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}

function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      setLoadingProjects(true);
      if (!isSupabaseConfigured || !supabase) {
        setAllProjects([]);
        setLoadingProjects(false);
        return;
      }
      const { data } = await supabase
        .from("projects")
        .select("id,title,category,technologies,summary,published_at,submitted_at,status")
        .in("status", ["approved", "published"])
        .order("published_at", { ascending: false, nullsFirst: false });
      if (!mounted) return;
      const styles = [
        { color: "bg-[#F4EFEB]", text: "text-[#171717]" },
        { color: "bg-[#2563EB]", text: "text-white" },
        { color: "bg-[#FB7185]", text: "text-white" },
        { color: "bg-[#FFE800]", text: "text-[#171717]" },
        { color: "bg-[#7C3AED]", text: "text-white" },
        { color: "bg-[#171717]", text: "text-white" },
      ];
      setAllProjects((data || []).map((project, index) => {
        const style = styles[index % styles.length];
        const date = project.published_at || project.submitted_at;
        return {
          id: project.id,
          title: project.title,
          tags: project.technologies?.length ? project.technologies : [project.category || "Project"],
          author: "Club Member",
          year: date ? new Date(date).getFullYear() : new Date().getFullYear(),
          color: style.color,
          text: style.text,
          desc: project.summary || "Project details will be updated soon.",
        };
      }));
      setLoadingProjects(false);
    }
    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const allTags = ["all", ...Array.from(new Set(allProjects.flatMap((project) => project.tags)))];

  const filtered = allProjects
    .filter(p => {
      const matchesTag = activeTag === "all" || p.tags.includes(activeTag);
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return b.year - a.year || b.id.localeCompare(a.id);
      if (sortOrder === "oldest") return a.year - b.year || a.id.localeCompare(b.id);
      if (sortOrder === "az") return a.title.localeCompare(b.title);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const resetPage = () => setCurrentPage(1);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-[#171717] pb-8 mb-10 gap-6">
        <div>
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Student Projects</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Showcase</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} project{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <BrutalButton
          color="bg-[#FB7185]"
          text="text-white"
          className="w-full self-stretch sm:w-auto md:self-start"
          onClick={() => navigate("/projects/submit")}
        >
          Submit Project
        </BrutalButton>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, description, or tech..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A → Z</option>
        </select>
      </div>

      {/* Tag Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); resetPage(); }}
            className={`px-3 py-1.5 border-2 border-[#171717] font-bold uppercase tracking-widest text-[10px] transition-all ${
              activeTag === tag ? "bg-[#FB7185] text-white" : "bg-white hover:bg-[#F4EFEB]"
            }`}
          >
            {tag === "all" ? "All Tech" : tag}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingProjects ? "Loading projects" : "No projects found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingProjects ? "Please wait..." : "Published projects will appear here after admin review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map(proj => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}`)}
              className={`cursor-pointer border-2 border-[#171717] flex flex-col brutal-shadow brutal-shadow-hover transition-all group ${proj.color} ${proj.text}`}
            >
              <div className="w-full aspect-video border-b-2 border-[#171717] relative overflow-hidden flex items-center justify-center bg-black/10">
                <Database size={48} className="opacity-20" />
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/20 border border-white/30 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">{proj.year}</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold uppercase leading-tight mb-2" style={fonts.display}>{proj.title}</h3>
                <p className="text-xs font-mono opacity-70 mb-3">By {proj.author}</p>
                <p className="text-sm opacity-80 leading-relaxed mb-4 flex-1" style={fonts.sans}>{proj.desc}</p>
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-current/20">
                  {proj.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 border border-current/30 bg-white/10 text-[9px] font-bold uppercase tracking-widest">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-[#171717] font-bold text-sm transition-all ${
                currentPage === page ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProject() {
      if (!isSupabaseConfigured || !supabase || !id) {
        setProject(null);
        setLoadingProject(false);
        return;
      }
      const { data } = await supabase
        .from("projects")
        .select("id,title,category,technologies,summary,content,published_at,status")
        .eq("id", id)
        .in("status", ["approved", "published"])
        .maybeSingle();
      if (!mounted) return;
      setProject(data);
      setLoadingProject(false);
    }
    loadProject();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {loadingProject ? (
        <BrutalCard><p className="font-mono text-sm text-slate-500">Loading project...</p></BrutalCard>
      ) : !project ? (
        <BrutalCard><p className="font-bold uppercase">Project not found or not published yet.</p></BrutalCard>
      ) : (
        <>
        <div className="w-full aspect-video bg-[#2563EB] border-4 border-[#171717] brutal-shadow-lg mb-12 flex items-center justify-center p-8">
          <h1 className="text-5xl md:text-8xl text-white uppercase text-center" style={fonts.display}>{project.title}</h1>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {(project.technologies?.length ? project.technologies : [project.category || "Project"]).map((tag: string) => (
            <BrutalBadge key={tag}>{tag}</BrutalBadge>
          ))}
        </div>

        <div className="prose prose-lg max-w-none text-[#171717]">
          <p className="text-2xl font-serif italic mb-8">{project.summary || "Project details will be updated soon."}</p>
          <div className="whitespace-pre-wrap text-base leading-relaxed">{project.content || project.summary}</div>
        </div>
        </>
      )}
    </div>
  );
}

function ProjectSubmissionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("dsc-project-draft");
    return saved ? JSON.parse(saved) : {
      title: "",
      category: "Machine Learning",
      team: "",
      technologies: "",
      summary: "",
      content: "# Problem\n\n# Methodology\n\n# Results\n",
    };
  });
  const [status, setStatus] = useState("");

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem("dsc-project-draft", JSON.stringify(next));
  };

  const submitProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingProject) return;
    if (!requireLoginForAction(navigate, "/projects/submit")) return;
    if (!form.title.trim() || !form.summary.trim()) {
      setStatus("Add a title and short summary before submitting.");
      return;
    }
    try {
      setSubmittingProject(true);
      const result = await submitProject({
        title: form.title,
        category: form.category,
        team: form.team,
        technologies: form.technologies.split(",").map((item: string) => item.trim()).filter(Boolean),
        summary: form.summary,
        content: form.content,
        status: "submitted",
      });
      localStorage.removeItem("dsc-project-draft");
      setStatus(`Project submitted for review. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit project.");
    } finally {
      setSubmittingProject(false);
    }
  };

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/projects")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Project Submission</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Submit Project</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Create a full project case study for the public gallery. Drafts save automatically in this browser.</p>
      </div>

      <form onSubmit={submitProjectForm} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Project Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Kathmandu Air Quality Predictor" />
            <BrutalField label="Category" value={form.category} onChange={(value) => updateField("category", value)} placeholder="Machine Learning" />
          </div>
          <BrutalField label="Team Members" value={form.team} onChange={(value) => updateField("team", value)} placeholder="S. Sharma, B. Thapa" />
          <BrutalField label="Technologies" value={form.technologies} onChange={(value) => updateField("technologies", value)} placeholder="Python, XGBoost, Streamlit" />
          <BrutalTextArea label="Short Summary" rows={4} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="A 2-3 sentence summary for the gallery card." />
          <BrutalTextArea label="Full Case Study Markdown" rows={14} value={form.content} onChange={(value) => updateField("content", value)} />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-[#FFE800]">
            <h2 className="text-3xl uppercase mb-4" style={fonts.display}>Preview</h2>
            <div className="border-2 border-[#171717] bg-white p-4 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FB7185]">{form.category || "Category"}</p>
              <h3 className="text-2xl uppercase leading-tight mt-2" style={fonts.display}>{form.title || "Project title"}</h3>
              <p className="text-sm text-slate-600 mt-2">{form.summary || "Your summary preview will appear here."}</p>
            </div>
            <p className="text-xs font-mono text-slate-700">Draft autosaves locally after each edit.</p>
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#FB7185]" text="text-white" className="w-full" disabled={submittingProject}>
              {submittingProject ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
            <BrutalButton
              type="button"
              color="bg-white"
              className="w-full"
              onClick={() => {
                if (!requireLoginForAction(navigate, "/projects/submit")) return;
                setStatus("Draft saved in this browser.");
              }}
            >
              Save Draft
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}

function BlogPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    let mounted = true;
    async function loadPosts() {
      setLoadingPosts(true);
      if (!isSupabaseConfigured || !supabase) {
        setAllPosts([]);
        setLoadingPosts(false);
        return;
      }
      const { data } = await supabase
        .from("blog_posts")
        .select("id,title,summary,tags,content,cover_image_url,published_at,status")
        .in("status", ["approved", "published"])
        .order("published_at", { ascending: false, nullsFirst: false });
      if (!mounted) return;
      setAllPosts((data || []).map((post) => {
        const date = post.published_at;
        const words = `${post.summary || ""} ${post.content || ""}`.trim().split(/\s+/).filter(Boolean).length;
        return {
          id: post.id,
          title: post.title,
          date: date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }) : "",
          dateSort: date ? new Date(date).toISOString().slice(0, 10) : "",
          category: (post.tags?.[0] || "NEWS").toUpperCase(),
          author: "Data Science Club",
          readTime: `${Math.max(1, Math.ceil(words / 220))} min`,
          excerpt: post.summary || post.content?.slice(0, 180) || "Post details will be updated soon.",
          coverImageUrl: post.cover_image_url,
        };
      }));
      setLoadingPosts(false);
    }
    loadPosts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = ["all", ...Array.from(new Set(allPosts.map((post) => post.category)))];
  const categoryColors: Record<string, string> = {
    TUTORIAL: "bg-[#2563EB]",
    EVENT: "bg-[#FB7185]",
    DESIGN: "bg-[#7C3AED]",
    NEWS: "bg-[#FFE800] text-[#171717]",
    OPINION: "bg-[#171717]",
  };

  const filtered = allPosts
    .filter(p => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return b.dateSort.localeCompare(a.dateSort);
      if (sortOrder === "oldest") return a.dateSort.localeCompare(b.dateSort);
      if (sortOrder === "readtime") return parseInt(a.readTime) - parseInt(b.readTime);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const resetPage = () => setCurrentPage(1);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-[#171717] pb-8 mb-10 gap-6">
        <div>
          <BrutalBadge color="bg-[#171717]" className="mb-4 inline-block">Blog</BrutalBadge>
          <h1 className="text-6xl md:text-8xl uppercase leading-none" style={fonts.display}>Club Blog</h1>
          <p className="mt-2 text-sm font-mono text-slate-500">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <BrutalButton
          color="bg-[#171717]"
          text="text-white"
          className="w-full self-stretch sm:w-auto md:self-start"
          onClick={() => navigate("/blog/write")}
        >
          Write a Post
        </BrutalButton>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts by title, author, or content..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full border-2 border-[#171717] p-3 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#171717]/20 transition-all"
          />
        </div>
        <select
          value={sortOrder}
          onChange={e => { setSortOrder(e.target.value); resetPage(); }}
          className="px-4 py-3 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs bg-white focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="readtime">Shortest Read</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); resetPage(); }}
            className={`px-4 py-2 border-2 border-[#171717] font-bold uppercase tracking-widest text-xs transition-all ${
              activeCategory === cat
                ? "bg-[#171717] text-white"
                : "bg-white hover:bg-[#F4EFEB]"
            }`}
          >
            {cat === "all" ? "All Posts" : cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-[#171717]">
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-400" style={fonts.display}>
            {loadingPosts ? "Loading posts" : "No posts found"}
          </p>
          <p className="text-sm font-mono text-slate-400 mt-2">
            {loadingPosts ? "Please wait..." : "Published blog posts will appear here after review."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-0 border-2 border-[#171717]">
          {paginated.map((post, i) => (
            <div
              key={post.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/blog/${post.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/blog/${post.id}`);
                }
              }}
              className={`p-8 cursor-pointer group hover:bg-[#171717] hover:text-white transition-all border-[#171717] ${
                i % 2 === 0 && i < paginated.length - 1 ? "border-r-2" : ""
              } ${i < paginated.length - 2 ? "border-b-2" : ""} ${
                paginated.length % 2 !== 0 && i === paginated.length - 1 ? "md:col-span-2 md:border-r-0" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 border-2 border-[#171717] text-[9px] font-bold uppercase tracking-widest group-hover:border-white/50 ${
                  categoryColors[post.category] || "bg-[#2563EB] text-white"
                }`}>
                  {post.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white/60">{post.readTime} read</span>
              </div>
              <h2
                className="text-2xl md:text-3xl uppercase leading-tight mb-3 group-hover:text-white transition-colors"
                style={fonts.display}
              >
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 group-hover:text-white/80 mb-6 transition-colors" style={fonts.sans}>
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400 group-hover:text-white/60">
                  {post.author} · {post.date}
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-[#171717] font-bold text-sm transition-all ${
                currentPage === page ? "bg-[#171717] text-white" : "bg-white hover:bg-[#F4EFEB]"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-[#171717] font-bold text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-[#F4EFEB] transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function BlogDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadPost() {
      setLoadingPost(true);
      if (!id || !isSupabaseConfigured || !supabase) {
        setPost(null);
        setLoadingPost(false);
        return;
      }

      const { data } = await supabase
        .from("blog_posts")
        .select("id,title,summary,tags,cover_image_url,content,published_at,status,profiles:author_id(full_name,email)")
        .eq("id", id)
        .in("status", ["approved", "published"])
        .maybeSingle();

      if (!mounted) return;
      setPost(data);
      setLoadingPost(false);
    }
    loadPost();
    return () => {
      mounted = false;
    };
  }, [id]);

  const author = post ? (Array.isArray(post.profiles) ? post.profiles[0] : post.profiles) : null;
  const words = post ? `${post.summary || ""} ${post.content || ""}`.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = `${Math.max(1, Math.ceil(words / 220))} min read`;
  const publishedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" })
    : "";
  const paragraphs = String(post?.content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1100px] mx-auto min-h-screen">
      <button onClick={() => navigate("/blog")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Blog
      </button>

      {loadingPost ? (
        <BrutalCard color="bg-white">
          <p className="font-bold uppercase tracking-widest text-sm">Loading post...</p>
        </BrutalCard>
      ) : !post ? (
        <BrutalCard color="bg-white">
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-block">Not Found</BrutalBadge>
          <h1 className="text-4xl md:text-6xl uppercase mb-4" style={fonts.display}>Post unavailable</h1>
          <p className="text-slate-600">This post is not published yet or has been removed.</p>
        </BrutalCard>
      ) : (
        <article>
          <div className="border-b-4 border-[#171717] pb-8 mb-8">
            <div className="flex flex-wrap gap-2 mb-5">
              {(post.tags || ["Blog"]).map((tag: string) => (
                <BrutalBadge key={tag} color="bg-[#2563EB]">{tag}</BrutalBadge>
              ))}
            </div>
            <h1 className="text-5xl md:text-8xl uppercase leading-none mb-5" style={fonts.display}>{post.title}</h1>
            <p className="text-xl md:text-2xl text-slate-700 max-w-3xl" style={fonts.serif}>{post.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-slate-500">
              <span>{author?.full_name || author?.email || "Data Science Club"}</span>
              <span>{publishedDate}</span>
              <span>{readTime}</span>
            </div>
          </div>

          {post.cover_image_url && (
            <div className="mb-10 border-2 border-[#171717] brutal-shadow-lg overflow-hidden bg-[#2563EB]">
              <img src={post.cover_image_url} alt={post.title} className="w-full max-h-[480px] object-cover" />
            </div>
          )}

          <BrutalCard color="bg-white" className="max-w-none">
            <div className="space-y-6 text-lg leading-8 text-[#171717]" style={fonts.serif}>
              {paragraphs.map((block, index) => {
                if (block.startsWith("## ")) {
                  return <h2 key={index} className="pt-4 text-3xl md:text-4xl uppercase leading-tight" style={fonts.display}>{block.replace(/^##\s+/, "")}</h2>;
                }
                if (block.startsWith("# ")) {
                  return <h2 key={index} className="pt-4 text-4xl md:text-5xl uppercase leading-tight" style={fonts.display}>{block.replace(/^#\s+/, "")}</h2>;
                }
                return <p key={index} className="whitespace-pre-line">{block}</p>;
              })}
            </div>
          </BrutalCard>
        </article>
      )}
    </div>
  );
}

function BlogEditorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("dsc-blog-draft");
    return saved ? JSON.parse(saved) : {
      title: "",
      summary: "",
      tags: "",
      coverImage: "",
      content: "## Introduction\n\nWrite your post here...\n",
    };
  });
  const [preview, setPreview] = useState(true);
  const [status, setStatus] = useState("");
  const [publishingPost, setPublishingPost] = useState(false);
  const [authorName, setAuthorName] = useState("Member");

  useEffect(() => {
    let mounted = true;
    async function loadAuthorName() {
      if (!isSupabaseConfigured || !supabase) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const fallbackName =
        userData.user.user_metadata?.full_name ||
        userData.user.email ||
        "Member";
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!mounted) return;
      setAuthorName(profile?.full_name || profile?.email || fallbackName);
    }

    loadAuthorName();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem("dsc-blog-draft", JSON.stringify(next));
  };

  const publishPostForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (publishingPost) return;
    if (!requireLoginForAction(navigate, "/blog/write")) return;
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) {
      setStatus("Title, summary, and content are required before submitting.");
      return;
    }
    try {
      setPublishingPost(true);
      const result = await publishBlogPost({
        title: form.title,
        summary: form.summary,
        tags: form.tags.split(",").map((item: string) => item.trim()).filter(Boolean),
        cover_image_url: form.coverImage || null,
        content: form.content,
        status: "submitted",
      });
      localStorage.removeItem("dsc-blog-draft");
      setStatus(`Post submitted for admin review. ${getPersistenceLabel(result.mode)}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit post.");
    } finally {
      setPublishingPost(false);
    }
  };

  const previewTags = form.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
  const previewBlocks = String(form.content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const previewWords = `${form.summary || ""} ${form.content || ""}`.trim().split(/\s+/).filter(Boolean).length;
  const previewReadTime = `${Math.max(1, Math.ceil(previewWords / 220))} min read`;
  const previewDate = new Date().toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1200px] mx-auto min-h-screen">
      <button onClick={() => navigate("/blog")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Blog
      </button>

      <div className="border-b-4 border-[#171717] pb-8 mb-10">
        <BrutalBadge color="bg-[#171717]" className="mb-4 inline-block">Blog Editor</BrutalBadge>
        <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>Write a Post</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Draft, preview, and publish club updates, tutorials, and event recaps.</p>
      </div>

      <form onSubmit={publishPostForm} className="grid lg:grid-cols-[1fr_380px] gap-8">
        <BrutalCard color="bg-white" className="space-y-5">
          <BrutalField label="Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Building Data Sarathi: A Neo-Brutalist Case Study" />
          <BrutalTextArea label="Summary" rows={3} value={form.summary} onChange={(value) => updateField("summary", value)} placeholder="Short excerpt for the blog listing." />
          <div className="grid md:grid-cols-2 gap-4">
            <BrutalField label="Tags" value={form.tags} onChange={(value) => updateField("tags", value)} placeholder="Tutorial, Event, NLP" />
            <BrutalField label="Cover Image URL" value={form.coverImage} onChange={(value) => updateField("coverImage", value)} placeholder="https://..." />
          </div>
          <BrutalTextArea label="Markdown Content" rows={18} value={form.content} onChange={(value) => updateField("content", value)} />
        </BrutalCard>

        <div className="space-y-6">
          <BrutalCard color="bg-white">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-3xl uppercase" style={fonts.display}>{preview ? "Final Preview" : "Preview"}</h2>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="px-3 py-2 border-2 border-[#171717] bg-white text-[#171717] text-xs font-bold uppercase tracking-widest"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <article className="space-y-5">
                <div className="border-b-4 border-[#171717] pb-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(previewTags.length ? previewTags : ["Blog"]).map((tag: string) => (
                      <BrutalBadge key={tag} color="bg-[#2563EB]">{tag}</BrutalBadge>
                    ))}
                  </div>
                  <h3 className="text-4xl md:text-5xl uppercase leading-none mb-4" style={fonts.display}>
                    {form.title || "Post Title"}
                  </h3>
                  <p className="text-lg text-slate-700" style={fonts.serif}>
                    {form.summary || "Post summary preview."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    <span>{authorName}</span>
                    <span>{previewDate}</span>
                    <span>{previewReadTime}</span>
                  </div>
                </div>

                {form.coverImage && (
                  <div className="border-2 border-[#171717] brutal-shadow overflow-hidden bg-[#2563EB]">
                    <img src={form.coverImage} alt={form.title || "Blog cover"} className="w-full max-h-56 object-cover" />
                  </div>
                )}

                <div className="space-y-4 text-base leading-7 text-[#171717]" style={fonts.serif}>
                  {(previewBlocks.length ? previewBlocks : ["Write your post here..."]).map((block: string, index: number) => {
                    if (block.startsWith("## ")) {
                      return <h4 key={index} className="pt-2 text-2xl md:text-3xl uppercase leading-tight" style={fonts.display}>{block.replace(/^##\s+/, "")}</h4>;
                    }
                    if (block.startsWith("# ")) {
                      return <h4 key={index} className="pt-2 text-3xl md:text-4xl uppercase leading-tight" style={fonts.display}>{block.replace(/^#\s+/, "")}</h4>;
                    }
                    return <p key={index} className="whitespace-pre-line">{block}</p>;
                  })}
                </div>
              </article>
            ) : (
              <p className="text-sm font-mono text-slate-700">Use preview to inspect your title, summary, tags, and markdown before publishing.</p>
            )}
          </BrutalCard>

          {status && (
            <div className="border-2 border-[#171717] bg-white p-4 text-sm font-bold">
              {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <BrutalButton type="submit" color="bg-[#171717]" text="text-white" className="w-full" disabled={publishingPost}>
              {publishingPost ? "Submitting..." : "Submit for Review"}
            </BrutalButton>
            <BrutalButton
              type="button"
              color="bg-white"
              className="w-full"
              onClick={() => {
                if (!requireLoginForAction(navigate, "/blog/write")) return;
                setStatus("Draft saved in this browser.");
              }}
            >
              Save Draft
            </BrutalButton>
          </div>
        </div>
      </form>
    </div>
  );
}

function BrutalField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all"
      />
    </label>
  );
}

function BrutalTextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all resize-y"
      />
    </label>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Any valid email is accepted
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#2563EB]">
      <div className="w-full max-w-4xl bg-white border-4 border-[#171717] brutal-shadow-lg flex flex-col md:flex-row overflow-hidden mt-16">
        
        <div className="md:w-1/2 p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-[#171717] flex flex-col justify-center bg-[#FFE800]">
          <h2 className="text-5xl uppercase mb-6" style={fonts.display}>Members Only</h2>
          <p className="font-serif italic text-lg mb-8">Access the hub, register for exclusive events, and submit your projects.</p>
          <div className="font-mono text-sm font-bold p-4 bg-white border-2 border-[#171717]">
            Sign in with any email address.
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full border-2 border-[#171717] p-4 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all brutal-shadow-hover"
                required
              />
              {error && <p className="text-xs font-bold text-[#FB7185] mt-2">{error}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full border-2 border-[#171717] p-4 font-mono focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all brutal-shadow-hover"
                required
              />
            </div>
            <BrutalButton type="submit" color="bg-[#171717]" text="text-white" className="w-full">Authenticate</BrutalButton>
          </form>
        </div>

      </div>
    </div>
  );
}

function TicketPage() {
  const navigate = useNavigate();
  const [attendeeName, setAttendeeName] = useState("Member");

  useEffect(() => {
    let mounted = true;

    async function loadAttendee() {
      if (!isSupabaseConfigured || !supabase) return;
      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!mounted) return;
      setAttendeeName(data?.full_name || data?.email || userData.user.email || "Member");
    }

    loadAttendee();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="pt-16 pb-20 px-6 flex flex-col items-center justify-center min-h-screen bg-[#F4EFEB]">
      <button onClick={() => navigate(-1)} className="absolute top-24 left-6 inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="relative w-full max-w-sm bg-white border-2 border-[#171717] p-6 brutal-shadow-lg rotate-1">
        <div className="absolute -top-4 -right-4 bg-[#FFE800] border-2 border-[#171717] w-12 h-12 rounded-full flex items-center justify-center rotate-12 font-bold text-xs">
          VIP
        </div>
        
        <div className="text-center mb-6 border-b-2 border-[#171717] pb-6 border-dashed">
          <h2 className="text-5xl uppercase leading-none mb-2" style={fonts.display}>Admit One</h2>
          <p className="font-bold font-mono tracking-widest text-sm">Your reserved event</p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="w-56 h-56 bg-[#171717] flex items-center justify-center p-4 relative">
             <QrCode size={180} className="text-white" />
          </div>
        </div>
        
        <div className="space-y-4 font-mono text-sm border-t-2 border-[#171717] border-dashed pt-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Attendee</span>
            <span className="font-bold">{attendeeName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ID</span>
            <span className="font-bold">Assigned after reservation</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-bold">Event date</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScannerPage() {
  const navigate = useNavigate();
  const eventId = new URLSearchParams(window.location.search).get("event") || "";
  const [ticketCode, setTicketCode] = useState("");
  const [scannerStatus, setScannerStatus] = useState("Checking scanner access...");
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkScannerAccess() {
      if (!eventId || !/^[0-9a-f-]{36}$/i.test(eventId)) {
        setScannerStatus("Open scanner from an event page.");
        return;
      }
      if (!isSupabaseConfigured || !supabase) {
        setScannerReady(false);
        setScannerStatus("Scanner is unavailable right now.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!userData.user) {
        navigate(`/login?redirect=/scanner?event=${eventId}`);
        return;
      }

      const [{ data: eventRow }, { data: profile }, { data: staffRows }] = await Promise.all([
        supabase.from("events").select("id,title,end_time,created_by,status").eq("id", eventId).maybeSingle(),
        supabase.from("profiles").select("role,email").eq("id", userData.user.id).maybeSingle(),
        supabase.from("event_staff").select("email,user_id,can_scan").eq("event_id", eventId),
      ]);

      if (!mounted) return;
      if (!eventRow) {
        setScannerStatus("Event not found.");
        return;
      }
      if (eventRow.end_time && new Date(eventRow.end_time).getTime() < Date.now()) {
        setScannerStatus("Scanner closed because this event has ended.");
        return;
      }

      const canScan =
        profile?.role === "admin" ||
        eventRow.created_by === userData.user.id ||
        (staffRows || []).some((staff) =>
          staff.can_scan &&
          (staff.user_id === userData.user?.id || staff.email?.toLowerCase() === (profile?.email || userData.user?.email || "").toLowerCase())
        );

      setScannerReady(Boolean(canScan));
      setScannerStatus(canScan ? `Scanner active for ${eventRow.title}.` : "You are not allowed to scan for this event.");
    }

    checkScannerAccess();

    return () => {
      mounted = false;
    };
  }, [eventId, navigate]);

  const scanTicket = async () => {
    if (!scannerReady || !eventId || !ticketCode.trim()) return;
    if (!isSupabaseConfigured || !supabase) {
      setScannerStatus("Scanner is unavailable right now.");
      return;
    }
    const { data, error } = await supabase
      .from("event_registrations")
      .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
      .eq("event_id", eventId)
      .eq("ticket_code", ticketCode.trim())
      .select("id")
      .maybeSingle();

    if (error) {
      setScannerStatus(error.message);
      return;
    }
    if (!data) {
      setScannerStatus("Ticket not found for this event.");
      return;
    }
    setTicketCode("");
    setScannerStatus("Ticket checked in.");
  };

  return (
    <div className="min-h-screen bg-[#171717] pt-12 pb-20 px-6 flex flex-col items-center justify-center text-white relative">
      <div className="text-center mb-8">
        <h1 className="text-5xl uppercase" style={fonts.display}>Scanner Protocol</h1>
        <p className="font-mono text-slate-400 mt-2">{scannerStatus}</p>
      </div>
      
      <div className="relative w-full max-w-sm aspect-square bg-black border-4 border-[#2563EB] mb-12 overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]">
        {/* Viewfinder brackets */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#FFE800]" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#FFE800]" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#FFE800]" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#FFE800]" />
        
        {/* Scanning line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FB7185] shadow-[0_0_15px_#FB7185] animate-[scan_2s_ease-in-out_infinite]" />
        
        <p className="font-mono text-slate-600 text-sm flex items-center gap-2">
          <Camera size={16} /> FEED ACTIVE
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <input
          value={ticketCode}
          onChange={(event) => setTicketCode(event.target.value)}
          placeholder="Ticket code"
          disabled={!scannerReady}
          className="flex-1 border-2 border-[#FFE800] bg-black p-3 font-mono text-sm text-white focus:outline-none disabled:opacity-40"
        />
        <BrutalButton onClick={scanTicket} disabled={!scannerReady} color="bg-[#FFE800]" className="flex-1">Check In</BrutalButton>
      </div>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState({
    name: "Member",
    batchYear: "",
    memberSince: "New member",
  });
  const [counts, setCounts] = useState({
    eventProposals: 0,
    projects: 0,
    blogPosts: 0,
  });
  const [dashboardEvents, setDashboardEvents] = useState<any[]>([]);
  const [dashboardProjects, setDashboardProjects] = useState<any[]>([]);
  const [dashboardPosts, setDashboardPosts] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;

      const fallbackName =
        userData.user.user_metadata?.full_name ||
        userData.user.user_metadata?.name ||
        userData.user.email ||
        "Member";

      const [{ data: profile }, eventProposalCount, projectCount, blogCount, publicEvents, publicProjects, publicPosts] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,email,batch_year,created_at")
          .eq("id", userData.user.id)
          .maybeSingle(),
        supabase
          .from("event_proposals")
          .select("id", { count: "exact", head: true })
          .eq("proposed_by", userData.user.id),
        supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userData.user.id),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userData.user.id),
        supabase
          .from("events")
          .select("id,title,event_type,start_time,capacity")
          .in("status", ["approved", "published"])
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(1),
        supabase
          .from("projects")
          .select("id,title,category,technologies,summary,published_at")
          .in("status", ["approved", "published"])
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(1),
        supabase
          .from("blog_posts")
          .select("id,title,tags,published_at")
          .in("status", ["approved", "published"])
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(4),
      ]);

      if (!mounted) return;
      setMember({
        name: profile?.full_name || profile?.email || fallbackName,
        batchYear: profile?.batch_year ? String(profile.batch_year) : "",
        memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "New member",
      });
      setCounts({
        eventProposals: eventProposalCount.count || 0,
        projects: projectCount.count || 0,
        blogPosts: blogCount.count || 0,
      });
      setDashboardEvents(publicEvents.data || []);
      setDashboardProjects(publicProjects.data || []);
      setDashboardPosts(publicPosts.data || []);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const userStats = [
    { label: "Event Proposals", value: String(counts.eventProposals), icon: <Calendar size={20} />, color: "bg-[#2563EB]", trend: "Awaiting review" },
    { label: "Projects Submitted", value: String(counts.projects), icon: <Code size={20} />, color: "bg-[#FB7185]", trend: "Your submissions" },
    { label: "Blog Posts", value: String(counts.blogPosts), icon: <FileText size={20} />, color: "bg-[#FFE800]", trend: "Published by you" },
    { label: "Member Since", value: member.memberSince, icon: <Zap size={20} />, color: "bg-[#7C3AED]", trend: "Account created" },
  ];

  const nextEvent = dashboardEvents[0];
  const featuredProject = dashboardProjects[0];
  const announcements = dashboardPosts.map((post) => ({
    id: post.id,
    title: post.title,
    date: post.published_at ? new Date(post.published_at).toLocaleDateString() : "",
    type: (post.tags?.[0] || "POST").toUpperCase(),
    important: false,
  }));

  const quickActions = [
    { label: "Register for Event", icon: <Calendar size={18} />, onClick: () => navigate("/events"), color: "bg-[#2563EB]" },
    { label: "Submit Project", icon: <Code size={18} />, onClick: () => navigate("/projects"), color: "bg-[#FB7185]" },
    { label: "My Certificates", icon: <Award size={18} />, onClick: () => navigate("/certificates"), color: "bg-[#7C3AED]" },
    { label: "View Tickets", icon: <QrCode size={18} />, onClick: () => navigate("/ticket"), color: "bg-[#FFE800]" },
  ];

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]" className="mb-4 inline-block">Member Dashboard</BrutalBadge>
          <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>
            Welcome back,<br />{member.name.split(" ")[0] || "Member"}!
          </h1>
          <p className="mt-4 font-mono text-sm text-slate-500">Member since: {member.memberSince}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <BrutalButton color="bg-white" className="text-xs px-4 py-2">
            <Bell size={14} className="inline mr-2" />
            Notifications (3)
          </BrutalButton>
          <BrutalButton color="bg-[#171717]" text="text-white" className="text-xs px-4 py-2" onClick={() => navigate("/profile")}>
            Edit Profile
          </BrutalButton>
        </div>
      </div>

      {/* Top Section: Membership Card - Full Width on Mobile */}
      <div className="mb-10">
        <BrutalCard color="bg-[#FB7185]" className="text-white relative">
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border-2 border-[#171717] flex items-center justify-center">
              <Check size={20} className="text-[#171717]" strokeWidth={3} />
            </div>
          </div>
          <div className="pr-16 md:pr-20">
            <div className="text-xs font-bold uppercase tracking-widest mb-3 md:mb-4 opacity-90">MEMBERSHIP</div>
            <h2 className="text-3xl md:text-5xl uppercase mb-2 md:mb-3" style={fonts.display}>You're In</h2>
            <p className="text-sm md:text-base opacity-90 font-mono">
              {member.batchYear ? `Batch ${member.batchYear}` : "Batch not set"} - Data Science Club
            </p>
          </div>
        </BrutalCard>
      </div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        {userStats.map((stat, i) => (
          <BrutalCard key={i} color="bg-white" className="hover:scale-105 transition-transform cursor-pointer">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} border-2 border-[#171717] flex items-center justify-center mb-3 md:mb-4 ${stat.color === "bg-[#FFE800]" ? "text-[#171717]" : "text-white"}`}>
              {stat.icon}
            </div>
            <div className="text-3xl md:text-4xl font-bold mb-1" style={fonts.display}>{stat.value}</div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2" style={fonts.sans}>
              {stat.label}
            </div>
            <div className="text-[9px] md:text-[10px] font-mono text-[#2563EB]">{stat.trend}</div>
          </BrutalCard>
        ))}
      </div>

      {/* Certificates Strip */}
      <div
        onClick={() => navigate("/certificates")}
        className="mb-10 border-2 border-[#171717] bg-[#FFE800] p-5 flex items-center justify-between cursor-pointer brutal-shadow brutal-shadow-hover transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#171717] flex items-center justify-center shrink-0">
            <Award size={24} className="text-[#FFE800]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#171717]/60" style={fonts.sans}>Your Achievements</p>
            <p className="text-xl md:text-2xl font-bold uppercase leading-none" style={fonts.display}>
              Certificates & Achievements
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-[#171717] group-hover:gap-4 transition-all">
          View All <ArrowRight size={16} />
        </div>
      </div>

      {/* Main Content Grid - Stacks on mobile, side-by-side on desktop */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-6 md:gap-10 mb-10">
        {/* Left Column: Next Up & Announcements */}
        <div className="space-y-6 md:space-y-10">
          {/* Next Up - Event Card */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Next Up</h2>
            </div>
            <BrutalCard color="bg-white" className="p-0 overflow-hidden">
              {nextEvent ? (
              <div className="p-5 md:p-6 cursor-pointer" onClick={() => navigate(`/events/${nextEvent.id}`)}>
                <div className="flex items-start justify-between gap-4 mb-5 md:mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">NEXT UP</div>
                    <div className="text-5xl md:text-6xl font-bold text-[#2563EB] mb-1" style={fonts.display}>
                      {new Date(nextEvent.start_time).toLocaleDateString(undefined, { day: "2-digit" })}
                    </div>
                    <div className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-400">
                      {new Date(nextEvent.start_time).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <BrutalBadge color="bg-[#2563EB]" className="text-xs md:text-sm px-3 md:px-4 py-2">
                    {(nextEvent.event_type || "EVENT").toUpperCase()}
                  </BrutalBadge>
                </div>
                <h3 className="text-xl md:text-2xl font-bold uppercase mb-3 md:mb-4" style={fonts.display}>{nextEvent.title}</h3>
                <div className="flex items-center gap-2 text-xs md:text-sm font-mono text-slate-600">
                  <Users size={14} className="text-[#2563EB]" />
                  <span className="font-bold">{nextEvent.capacity || "Open"}</span>
                  <BrutalBadge color="bg-[#2563EB]" className="text-[10px]">spots</BrutalBadge>
                  <span className="text-slate-400">available</span>
                </div>
              </div>
              ) : (
                <div className="p-5 md:p-6">
                  <p className="font-bold uppercase">No upcoming events yet.</p>
                  <p className="mt-2 text-sm font-mono text-slate-500">Approved events will appear here.</p>
                </div>
              )}
            </BrutalCard>
          </div>

          {/* Announcements Feed */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Announcements</h2>
              <BrutalBadge color="bg-[#FB7185]">Live Feed</BrutalBadge>
            </div>
            <div className="space-y-3 md:space-y-4">
              {announcements.length === 0 ? (
                <BrutalCard color="bg-white">
                  <p className="font-bold uppercase">No announcements yet.</p>
                  <p className="mt-2 text-sm font-mono text-slate-500">Published blog posts will appear here.</p>
                </BrutalCard>
              ) : announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className={`border-2 border-[#171717] p-4 md:p-5 bg-white brutal-shadow hover:brutal-shadow-hover transition-all cursor-pointer ${announcement.important ? "border-l-4 md:border-l-8 border-l-[#FB7185]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3 md:gap-4 mb-2">
                    <h3 className="text-sm md:text-lg font-bold leading-tight" style={fonts.sans}>
                      {announcement.title}
                    </h3>
                    <BrutalBadge 
                      color={announcement.type === "EVENT" ? "bg-[#2563EB]" : "bg-[#171717]"} 
                      className="shrink-0 text-[9px] md:text-[10px]"
                    >
                      {announcement.type}
                    </BrutalBadge>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-slate-500 font-mono">
                    <Clock size={12} />
                    {announcement.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Projects & Leaderboard - Full width on mobile */}
        <div className="space-y-6 md:space-y-10">
          {/* Projects Card */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Projects</h2>
            </div>
            <BrutalCard color="bg-[#7C3AED]" className="text-white cursor-pointer" onClick={() => featuredProject && navigate(`/projects/${featuredProject.id}`)}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3 md:mb-4 opacity-90">PROJECTS</div>
              <h3 className="text-2xl md:text-3xl uppercase mb-4 md:mb-5" style={fonts.display}>
                {featuredProject?.title || "No published projects yet"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(featuredProject?.technologies?.length ? featuredProject.technologies : [featuredProject?.category || "Publish from admin"]).map((tag: string) => (
                  <BrutalBadge key={tag} color="bg-white/20 backdrop-blur" text="text-white" className="text-[10px] md:text-xs border-white/30">
                    {tag}
                  </BrutalBadge>
                ))}
              </div>
            </BrutalCard>
          </div>

          {/* Club Activity */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl uppercase" style={fonts.display}>Club Activity</h2>
              <Trophy size={20} className="text-[#FFE800]" />
            </div>
            <BrutalCard color="bg-white" className="p-0 overflow-hidden">
              <div className="divide-y-2 divide-[#171717]">
                <div className="flex items-center justify-between p-3 md:p-4 bg-[#F4EFEB]">
                  <div>
                    <div className="text-xs md:text-sm font-bold" style={fonts.sans}>Published Events</div>
                    <div className="text-[9px] md:text-[10px] font-mono text-slate-500">Visible on events page</div>
                  </div>
                  <div className="text-base md:text-lg font-bold" style={fonts.display}>{dashboardEvents.length}</div>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-white">
                  <div>
                    <div className="text-xs md:text-sm font-bold" style={fonts.sans}>Latest Projects</div>
                    <div className="text-[9px] md:text-[10px] font-mono text-slate-500">Visible on projects page</div>
                  </div>
                  <div className="text-base md:text-lg font-bold" style={fonts.display}>{dashboardProjects.length}</div>
                </div>
                <div className="flex items-center justify-between p-3 md:p-4 bg-white">
                  <div>
                    <div className="text-xs md:text-sm font-bold" style={fonts.sans}>Latest Posts</div>
                    <div className="text-[9px] md:text-[10px] font-mono text-slate-500">Visible on blog page</div>
                  </div>
                  <div className="text-base md:text-lg font-bold" style={fonts.display}>{dashboardPosts.length}</div>
                </div>
              </div>
            </BrutalCard>
          </div>

          {/* Quick Actions - Better spacing on mobile */}
          <div>
            <h2 className="text-2xl md:text-3xl uppercase mb-4 md:mb-6" style={fonts.display}>Quick Actions</h2>
            <div className="space-y-3 md:space-y-4">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`w-full ${action.color} ${action.color === "bg-[#FFE800]" ? "text-[#171717]" : "text-white"} border-2 border-[#171717] p-3 md:p-4 font-bold uppercase tracking-widest text-xs md:text-sm brutal-shadow brutal-shadow-hover transition-all flex items-center justify-center md:justify-start gap-2 md:gap-3`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom CTA - Better responsive text */}
      <BrutalCard color="bg-[#2563EB]" className="text-white text-center border-4">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-3xl md:text-4xl lg:text-5xl uppercase mb-3 md:mb-4" style={fonts.display}>Find your next event</h3>
          <p className="text-sm md:text-lg opacity-90 mb-4 md:mb-6" style={fonts.serif}>
            Browse approved events, reserve your spot, or propose something new for the club.
          </p>
          <BrutalButton color="bg-[#FFE800]" onClick={() => navigate("/events")} className="w-full sm:w-auto">
            Explore Events
          </BrutalButton>
        </div>
      </BrutalCard>
    </div>
  );
}

// ─── Main App Router ───────────────────────────────────────────────────────────

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<UpdatedAboutPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/propose" element={<EventProposalPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/submit" element={<ProjectSubmissionPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:id" element={<BlogDetailPage />} />
          <Route path="blog/write" element={<BlogEditorPage />} />
          <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="admin" element={<AdminRoute><ComprehensiveAdminPanel /></AdminRoute>} />
          <Route path="admin/:adminTab" element={<AdminRoute><ComprehensiveAdminPanel /></AdminRoute>} />
          
          {/* New Pages */}
          <Route path="certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
          <Route path="verify/:code" element={<CertificateVerifyPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
          <Route path="partners" element={<PartnersPage />} />
        </Route>
        
        {/* Auth & Utility routes without standard Nav/Footer for immersion */}
        <Route path="/login" element={<NewLoginPage />} />
        <Route path="/register" element={<NewLoginPage />} />
        <Route path="/ticket" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="/scanner" element={<ScannerPage />} />
      </Routes>
    </Router>
  );
}
