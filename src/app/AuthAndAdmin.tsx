/**
 * Authentication and Admin Panel Components
 * 
 * USER ROLES & BADGES:
 * - "Member" (default) - Any logged-in user, shown with gray badge
 * - "Club Member" (verified) - Verified club member, shown with blue badge
 * - "Teacher" - Faculty member, shown with purple badge
 * - "Admin" - Administrator access, shown with pink badge, gets Admin Panel access
 * 
 * TESTING:
 * - To test different roles, edit the `currentUser` object in the Nav component (App.tsx line 87-92)
 * - Set `isLoggedIn` to false to see the logged-out state
 * - Set role to "Admin" to see the Admin Panel button in navigation
 * 
 * BACKEND INTEGRATION:
 * - Authentication is handled through the configured auth provider.
 * - Implement Google OAuth using a library like @react-oauth/google
 * - Fetch user data from the configured profile store.
 * - Store JWT tokens in localStorage or httpOnly cookies
 * - Implement role-based access control on backend
 */

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Shield, User, UserCheck, GraduationCap, Settings, Search, Edit, Trash2, Crown, X, Eye, EyeOff } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { userFriendlyErrorMessage } from "../lib/apiClient";

const fonts = {
  display: { fontFamily: "'Anton', sans-serif" },
  serif: { fontFamily: "'Playfair Display', serif" },
  sans: { fontFamily: "'Inter', sans-serif" },
};

const BrutalButton = ({ children, color = "bg-[#FFE800]", text = "text-[#171717]", className = "", ...props }: any) => (
  <button 
    className={`px-6 py-3 ${color} ${text} border-2 border-[#171717] font-bold uppercase tracking-widest brutal-shadow brutal-shadow-hover transition-all ${className}`} 
    {...props}
  >
    {children}
  </button>
);

const BrutalCard = ({ children, className = "", color = "bg-white", ...props }: any) => (
  <div className={`border-2 border-[#171717] p-6 brutal-shadow-lg ${color} ${className}`} {...props}>
    {children}
  </div>
);

const BrutalBadge = ({ children, color = "bg-[#FB7185]", text="text-white", className = "" }: any) => (
  <span className={`px-2 py-1 ${color} ${text} border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest ${className}`}>
    {children}
  </span>
);

// ─── New Login/Signup Page with Google Auth ───────────────────────────────────

export function NewLoginPage() {
  const location = useLocation();
  const isSignup = location.pathname === "/register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSmsStudent, setIsSmsStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const redirectParam = new URLSearchParams(location.search).get("redirect");
  const redirectTo = redirectParam?.startsWith("/") ? redirectParam : "/dashboard";
  const passwordRules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One symbol", valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const isStrongPassword = passwordRules.every((rule) => rule.valid);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        localStorage.setItem("dsc-auth-state", "logged-in");
        navigate(redirectTo, { replace: true });
      }
    });
    return () => {
      mounted = false;
    };
  }, [navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      if (isSignup) {
        if (!isStrongPassword) {
          setError("Create a stronger password before signing up.");
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        if (isSmsStudent && !studentEmail.trim().toLowerCase().endsWith("@sms.tu.edu.np")) {
          setError("Student email must end with @sms.tu.edu.np.");
          return;
        }
      }

      if (!isSupabaseConfigured || !supabase) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        setError("Login is temporarily unavailable. Please try again later.");
        return;
      }

      if (isSignup) {
        await supabase.auth.signOut();
      }

      const response = isSignup
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                is_sms_student: isSmsStudent,
                student_email: isSmsStudent ? studentEmail.trim().toLowerCase() : "",
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (response.error) {
        localStorage.setItem("dsc-auth-state", "logged-out");
        setError(userFriendlyErrorMessage(response.error, "Could not sign in. Check your email and password."));
        return;
      }

      if (response.data.session) {
        localStorage.setItem("dsc-auth-state", "logged-in");
        navigate(redirectTo);
        return;
      }

      localStorage.setItem("dsc-auth-state", "logged-out");
      setNotice("Account created. Check your email and confirm it, then sign in.");
      if (isSignup) {
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");

    if (!isSupabaseConfigured || !supabase) {
      localStorage.setItem("dsc-auth-state", "logged-out");
      setError("Google sign in is temporarily unavailable.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) setError(userFriendlyErrorMessage(error, "Google sign in could not start. Please try again."));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#2563EB]">
      <button
        type="button"
        onClick={() => navigate(redirectTo)}
        aria-label="Close login"
        className="fixed top-6 right-6 z-20 w-12 h-12 bg-white border-2 border-[#171717] brutal-shadow brutal-shadow-hover transition-all flex items-center justify-center"
      >
        <X size={22} strokeWidth={3} />
      </button>

      <div className="w-full max-w-4xl bg-white border-4 border-[#171717] brutal-shadow-lg flex flex-col md:flex-row overflow-hidden mt-16">
        
        {/* Left Panel */}
        <div className="md:w-1/2 p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-[#171717] flex flex-col justify-center bg-[#FFE800]">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-20 h-20 bg-white flex items-center justify-center p-2">
              <img src="/assets/dsc-logo.png" alt="Data Science Club logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest leading-5">Data Science Club<br />SMS, TU</p>
          </div>
          <h2 className="text-5xl uppercase mb-6" style={fonts.display}>
            {isSignup ? "Join Us" : "Welcome Back"}
          </h2>
          <p className="font-serif italic text-lg mb-8">
            {isSignup 
              ? "Create your account to access exclusive events, submit projects, and join the community."
              : "Access the hub, register for exclusive events, and submit your projects."
            }
          </p>
          <div className="font-mono text-sm font-bold p-4 bg-white border-2 border-[#171717] mb-6">
            Sign in with any email address.
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-bold">Member Dashboard Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-bold">Event Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-bold">Project Submissions</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold uppercase mb-2" style={fonts.display}>
              {isSignup ? "Create Account" : "Sign In"}
            </h3>
            <p className="text-xs text-slate-500">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Link 
                to={isSignup ? "/login" : "/register"} 
                className="text-[#2563EB] font-bold hover:underline"
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ashish Adhikari"
                  className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all"
                required
              />
              {error && <p className="text-xs font-bold text-[#FB7185] mt-2">{error}</p>}
              {notice && <p className="text-xs font-bold text-[#2563EB] mt-2">{notice}</p>}
            </div>
            {isSignup && (
              <div className="border-2 border-[#171717] bg-[#F4EFEB] p-4">
                <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                  <input
                    type="checkbox"
                    checked={isSmsStudent}
                    onChange={(event) => setIsSmsStudent(event.target.checked)}
                    className="w-4 h-4 accent-[#2563EB]"
                  />
                  Are you a student of SMS TU?
                </label>
                {isSmsStudent && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">SMS TU Student Email</label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(event) => setStudentEmail(event.target.value)}
                      placeholder="your.name@sms.tu.edu.np"
                      className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all bg-white"
                      required={isSmsStudent}
                    />
                    <p className="mt-2 text-[11px] font-bold text-slate-500">
                      Student access is granted after this SMS TU email is verified.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">
                {isSignup ? "Create Password" : "Password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full border-2 border-[#171717] p-3 pr-12 font-mono focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-[#171717] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isSignup && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passwordRules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${
                        rule.valid ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                      {rule.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isSignup && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full border-2 border-[#171717] p-3 pr-12 font-mono focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-[#171717] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs font-bold text-[#FB7185] mt-2">Passwords do not match.</p>
                )}
              </div>
            )}
            
            <BrutalButton
              type="submit"
              color="bg-[#171717]"
              text="text-white"
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || (isSignup && (!isStrongPassword || password !== confirmPassword))}
            >
              {isSubmitting ? "Please Wait..." : isSignup ? "Create Account" : "Sign In"}
            </BrutalButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t-2 border-[#171717]"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Or</span>
            <div className="flex-1 border-t-2 border-[#171717]"></div>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleAuth}
              className="w-full border-2 border-[#171717] p-3 bg-white hover:bg-[#F4EFEB] transition-all flex items-center justify-center gap-3 brutal-shadow brutal-shadow-hover font-bold uppercase tracking-widest text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.002c0 1.454.348 2.829.957 4.045l3.007-2.335z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              {isSignup ? "Sign Up with Google" : "Sign In with Google"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Admin Panel Page ──────────────────────────────────────────────────────────

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("users");

  // Mock user data - in real app, fetch from backend
  const users = [
    { id: 1, name: "John Doe", email: "john.doe@gmail.com", role: "Member", verified: false, designation: null },
    { id: 2, name: "Jane Smith", email: "jane@sms.tu.edu.np", role: "Club Member", verified: true, designation: "President" },
    { id: 3, name: "Dr. Ram Kumar", email: "ram.kumar@sms.tu.edu.np", role: "Teacher", verified: true, designation: "Faculty Advisor" },
    { id: 4, name: "Sita Thapa", email: "sita.thapa@outlook.com", role: "Club Member", verified: true, designation: "Vice President" },
    { id: 5, name: "Hari Prasad", email: "hari.prasad@yahoo.com", role: "Member", verified: false, designation: null },
    { id: 6, name: "Maya Singh", email: "maya@sms.tu.edu.np", role: "Club Member", verified: true, designation: "Secretary" },
    { id: 7, name: "Prof. Sharma", email: "prof.sharma@sms.tu.edu.np", role: "Teacher", verified: true, designation: "Head of Department" },
  ];

  const getRoleBadge = (role: string, verified: boolean) => {
    if (role === "Teacher") {
      return <BrutalBadge color="bg-[#7C3AED]" className="inline-flex items-center gap-1"><GraduationCap size={10} /> TEACHER</BrutalBadge>;
    }
    if (role === "Club Member" && verified) {
      return <BrutalBadge color="bg-[#2563EB]" className="inline-flex items-center gap-1"><UserCheck size={10} /> CLUB MEMBER</BrutalBadge>;
    }
    return <BrutalBadge color="bg-slate-400" className="inline-flex items-center gap-1"><User size={10} /> MEMBER</BrutalBadge>;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto min-h-screen bg-[#F4EFEB]">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <BrutalBadge color="bg-[#FB7185]" className="mb-4 inline-flex items-center gap-1">
            <Shield size={10} /> ADMIN ACCESS
          </BrutalBadge>
          <h1 className="text-5xl md:text-7xl uppercase leading-none" style={fonts.display}>
            Admin Panel
          </h1>
          <p className="mt-4 font-mono text-sm text-slate-500">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 border-2 border-[#171717] bg-white hover:bg-[#F4EFEB] transition-all font-bold uppercase tracking-widest text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b-2 border-[#171717] pb-2 overflow-x-auto">
        <button
          onClick={() => setSelectedTab("users")}
          className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-all ${
            selectedTab === "users"
              ? "bg-[#171717] text-white border-2 border-[#171717]"
              : "bg-white text-[#171717] border-2 border-transparent hover:border-[#171717]"
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setSelectedTab("stats")}
          className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-all ${
            selectedTab === "stats"
              ? "bg-[#171717] text-white border-2 border-[#171717]"
              : "bg-white text-[#171717] border-2 border-transparent hover:border-[#171717]"
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setSelectedTab("settings")}
          className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-all ${
            selectedTab === "settings"
              ? "bg-[#171717] text-white border-2 border-[#171717]"
              : "bg-white text-[#171717] border-2 border-transparent hover:border-[#171717]"
          }`}
        >
          Settings
        </button>
      </div>

      {/* User Management Tab */}
      {selectedTab === "users" && (
        <>
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border-2 border-[#171717] p-4 pl-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 transition-all brutal-shadow"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <BrutalCard color="bg-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>{users.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Users</div>
            </BrutalCard>
            <BrutalCard color="bg-[#2563EB]" className="text-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>
                {users.filter(u => u.role === "Club Member" && u.verified).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Club Members</div>
            </BrutalCard>
            <BrutalCard color="bg-[#7C3AED]" className="text-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>
                {users.filter(u => u.role === "Teacher").length}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Teachers</div>
            </BrutalCard>
            <BrutalCard color="bg-slate-400" className="text-white">
              <div className="text-4xl font-bold mb-1" style={fonts.display}>
                {users.filter(u => !u.verified).length}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Pending Verification</div>
            </BrutalCard>
          </div>

          {/* Users Table */}
          <BrutalCard color="bg-white" className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#171717]">
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Email</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Role</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Designation</th>
                    <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-200 hover:bg-[#F4EFEB] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2563EB] border-2 border-[#171717] flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-slate-600">{user.email}</td>
                      <td className="p-4">{getRoleBadge(user.role, user.verified)}</td>
                      <td className="p-4">
                        {user.designation ? (
                          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                            {user.designation}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                            <Check size={12} strokeWidth={3} /> Verified
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-[#2563EB] hover:text-white border-2 border-[#171717] bg-white transition-all">
                            <Edit size={14} />
                          </button>
                          <button className="p-2 hover:bg-[#FB7185] hover:text-white border-2 border-[#171717] bg-white transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BrutalCard>
        </>
      )}

      {/* Statistics Tab */}
      {selectedTab === "stats" && (
        <BrutalCard color="bg-white">
          <h2 className="text-3xl uppercase mb-6" style={fonts.display}>Platform Statistics</h2>
          <p className="text-slate-600">Statistics dashboard coming soon...</p>
        </BrutalCard>
      )}

      {/* Settings Tab */}
      {selectedTab === "settings" && (
        <BrutalCard color="bg-white">
          <h2 className="text-3xl uppercase mb-6" style={fonts.display}>Admin Settings</h2>
          <p className="text-slate-600">Settings panel coming soon...</p>
        </BrutalCard>
      )}
    </div>
  );
}

// ─── User Badge Component ──────────────────────────────────────────────────────

export function UserBadge({ role, designation, verified }: { role?: string, designation?: string, verified?: boolean }) {
  if (!role) return null;
  const normalizedRole = role.toLowerCase();
  const label = designation?.trim();

  if (normalizedRole === "admin") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#FB7185] text-white border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest">
        <Crown size={10} /> {label || "ADMIN"}
      </div>
    );
  }

  if (normalizedRole === "organizer") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#7C3AED] text-white border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest">
        <GraduationCap size={10} /> {label || "ORGANIZER"}
      </div>
    );
  }

  if ((normalizedRole === "member" || normalizedRole === "club member") && verified) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#2563EB] text-white border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest">
        <UserCheck size={10} /> {label || "CLUB MEMBER"}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-400 text-white border-2 border-[#171717] text-[10px] font-bold uppercase tracking-widest">
      <User size={10} /> {verified ? label || "MEMBER" : "STUDENT"}
    </div>
  );
}
