import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookMarked,
  BookOpen,
  Calendar,
  ChevronDown,
  Code,
  FileText,
  Handshake,
  Home,
  Image,
  LogOut,
  Mail,
  Menu,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { UserBadge } from "../auth/AuthAndAdmin";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { canOpenAdminPanel } from "../../app/auth/AdminRoute";
import { DSC_LOGO_SRC } from "../../config/assets";

const fonts = {
  sans: { fontFamily: "'Inter', sans-serif" },
};

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

export function Nav() {
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
    return false;
  });
  const [currentUser, setCurrentUser] = useState({
    name: "Member",
    role: "student",
    roles: [] as string[],
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
      setCurrentUser({ name: "Member", role: "student", roles: [], verified: false, designation: "" });
    };
    const syncSession = async (session: Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["getSession"]>>["data"]["session"]) => {
      if (!mounted) return;
      if (!isSupabaseConfigured) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        setIsLoggedIn(false);
        return;
      }
      if (!session?.user) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        setIsLoggedIn(false);
        setCurrentUser({ name: "Member", role: "student", roles: [], verified: false, designation: "" });
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
        .select("full_name,email,role,roles,membership_status,designation,designation_status")
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
        roles: Array.isArray(profile?.roles) ? profile.roles : [],
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

  const canOpenAdmin = canOpenAdminPanel(currentUser);

  const dropdownActivePaths: Record<string, string[]> = {
    Resources: ["/resources"],
    Community: ["/about", "/gallery", "/partners", "/contact"],
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#F4EFEB] border-b-2 border-[#171717] py-3 px-4 sm:px-6 md:px-8"
          : "bg-[#F4EFEB] py-4 sm:py-5 px-4 sm:px-6 md:px-8"
      }`}
      style={{ ["--dsc-header-height" as string]: scrolled ? "74px" : "88px" }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 flex items-center justify-center bg-white p-1.5">
            <img src={DSC_LOGO_SRC} alt="Data Science Club logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm tracking-widest text-[#171717] uppercase hidden xl:block" style={fonts.sans}>
            Data Science Club
          </span>
        </Link>

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

        <button
          className="md:hidden p-2 text-[#171717] border-2 border-[#171717] bg-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu-panel fixed left-0 right-0 w-full bg-[#F4EFEB] border-y-2 border-[#171717] p-5 flex flex-col gap-4 md:hidden z-40 overflow-y-auto shadow-[0_8px_0_#171717]">
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
                    className="w-full flex items-center justify-between text-sm font-bold text-[#171717] uppercase tracking-widest py-3 border-b border-[#171717]/15"
                  >
                    {item.label}
                    <ChevronDown size={15} className={`transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="mt-2 ml-4 flex flex-col gap-3 border-l-2 border-[#171717] pl-4">
                      {item.dropdown.map((sub) => (
                        <Link key={sub.path + sub.label} to={sub.path} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-widest hover:text-[#2563EB] py-1">
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
                className="text-sm font-bold text-[#171717] uppercase tracking-widest flex items-center gap-2 hover:text-[#2563EB] py-2 border-b border-[#171717]/15">
                {item.icon} {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t-2 border-[#171717] flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <button className="w-full py-3 bg-[#171717] text-white text-sm font-bold uppercase tracking-widest border-2 border-[#171717] flex items-center justify-center gap-2">
                    <Home size={15} /> Dashboard
                  </button>
                </Link>
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

