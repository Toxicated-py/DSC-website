/**
 * Authentication components backed by Supabase auth.
 */

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, User, UserCheck, GraduationCap, Crown, X, Eye, EyeOff } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { DSC_LOGO_SRC } from "../../config/assets";
import { userFriendlyErrorMessage } from "../../lib/apiClient";


import { BrutalButton } from "../ui/brutal";
import { fonts } from "../../config/fonts";

// âââ New Login/Signup Page with Google Auth âââââââââââââââââââââââââââââââââââ

export function NewLoginPage() {
  const location = useLocation();
  const isSignup = location.pathname === "/register";
  const isResetPassword = location.pathname === "/reset-password";
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSmsStudent, setIsSmsStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [canUpdatePassword, setCanUpdatePassword] = useState(false);
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
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setCanUpdatePassword(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (isResetPassword) {
        setCanUpdatePassword(Boolean(data.session?.user));
        return;
      }
      if (data.session?.user) {
        navigate(redirectTo, { replace: true });
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isResetPassword, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setResetStatus("");
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
                phone: phone.trim(),
                is_sms_student: isSmsStudent,
                student_email: isSmsStudent ? studentEmail.trim().toLowerCase() : "",
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (response.error) {
        setError(userFriendlyErrorMessage(response.error, "Could not sign in. Check your email and password."));
        return;
      }

      if (response.data.session) {
        navigate(redirectTo);
        return;
      }
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
    if (isGoogleSubmitting) return;

    setError("");
    setNotice("");

    if (!isSupabaseConfigured || !supabase) {
      setError("Google sign in is temporarily unavailable.");
      return;
    }

    setIsGoogleSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(userFriendlyErrorMessage(error, "Google sign in could not start. Please try again."));
      setIsGoogleSubmitting(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (showForgotPassword && !isResetPassword ? resetEmail : email).trim();
    setError("");
    setNotice("");
    setResetStatus("");
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setResetStatus("Password reset is temporarily unavailable.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetStatus(userFriendlyErrorMessage(error, "Could not send reset email. Please try again."));
        return;
      }

      setResetStatus("Password reset link sent. Check your email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setError("Password update is temporarily unavailable.");
        return;
      }
      if (!isStrongPassword) {
        setError("Create a stronger password before saving.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(userFriendlyErrorMessage(error, "Could not update password. Please open the reset link again."));
        return;
      }

      await supabase.auth.signOut();
      setNotice("Password updated. Sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
      setCanUpdatePassword(false);
      setShowForgotPassword(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#2563EB]">
        <div className="w-full max-w-lg bg-white border-4 border-[#171717] brutal-shadow-lg p-8">
          <h1 className="text-4xl uppercase mb-3" style={fonts.display}>Reset Password</h1>
          <p className="font-mono text-sm text-slate-600 mb-6">
            {canUpdatePassword ? "Enter your new password." : "Send a reset link to your email."}
          </p>
          <form onSubmit={canUpdatePassword ? handlePasswordUpdate : handlePasswordResetRequest} className="space-y-4">
            {canUpdatePassword ? (
              <>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30"
                  required
                />
              </>
            ) : (
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#FB7185]/30"
                required
              />
            )}
            {error && <p className="text-xs font-bold text-[#FB7185]">{error}</p>}
            {notice && <p className="text-xs font-bold text-[#2563EB]">{notice}</p>}
            <BrutalButton type="submit" color="bg-[#171717]" text="text-white" className="w-full disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Please Wait..." : canUpdatePassword ? "Save New Password" : "Send Reset Link"}
            </BrutalButton>
          </form>
          <button type="button" onClick={() => navigate("/login")} className="mt-5 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#2563EB]">
      <button
        type="button"
        onClick={() => navigate("/")}
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
              <img loading="lazy" src={DSC_LOGO_SRC} alt="Data Science Club logo" className="w-full h-full object-contain" />
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
            {isSignup && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
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
            {!isSignup && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="w-full text-xs font-bold uppercase tracking-widest text-[#2563EB] hover:underline"
              >
                Forgot password?
              </button>
            )}
          </form>

          {showForgotPassword && !isSignup && (
            <form onSubmit={handlePasswordResetRequest} className="mt-4 border-2 border-[#171717] bg-[#F4EFEB] p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest">Reset Password</p>
              <input
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full border-2 border-[#171717] p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/30 bg-white"
                required
              />
              {resetStatus && (
                <p className={`text-xs font-bold ${resetStatus.toLowerCase().includes("sent") ? "text-[#2563EB]" : "text-[#FB7185]"}`}>
                  {resetStatus}
                </p>
              )}
              <BrutalButton type="submit" color="bg-[#FFE800]" text="text-[#171717]" className="w-full disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </BrutalButton>
            </form>
          )}

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
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full border-2 border-[#171717] p-3 bg-white hover:bg-[#F4EFEB] transition-all flex items-center justify-center gap-3 brutal-shadow brutal-shadow-hover font-bold uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.002c0 1.454.348 2.829.957 4.045l3.007-2.335z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              {isGoogleSubmitting ? "Opening Google..." : isSignup ? "Sign Up with Google" : "Sign In with Google"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// âââ Admin Panel Page ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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
