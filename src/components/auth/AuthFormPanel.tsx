"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { WaveDotMatrix } from "./WaveDotMatrix";

/* ─── Transition Variants ─── */
const formVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 18 : -18,
    filter: "blur(3px)",
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -18 : 18,
    filter: "blur(3px)",
    transition: { duration: 0.18, ease: [0.55, 0.06, 0.68, 0.19] as const },
  }),
};

const textFadeVariants = {
  initial: { opacity: 0, y: 4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.14 },
  },
};

/* ─── Types ─── */
type AuthTab = "signin" | "register";

interface AuthFormPanelProps {
  defaultTab?: AuthTab;
}

function AuthFormPanelInner({ defaultTab = "signin" }: AuthFormPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/";
  const { signIn, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [direction, setDirection] = useState(0); // +1 = going right (register), -1 = going left (signin)

  /* ── Dedicated Sign In State ── */
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);

  /* ── Dedicated Register State ── */
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  /* ── Purge any unwanted browser autofill on initial mount and tab transition ── */
  useEffect(() => {
    // Immediate state reset
    setSignInEmail("");
    setSignInPassword("");
    setRegisterFullName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");

    // Secondary sanitization check: if browser attempts delayed injection before user interaction
    const timer = setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(
        "#signin-email, #signin-password, #reg-email, #reg-password, #reg-fullName, #reg-confirmPassword"
      );
      inputs.forEach((input) => {
        if (document.activeElement !== input && input.value) {
          input.value = "";
          if (input.id === "signin-email") setSignInEmail("");
          if (input.id === "signin-password") setSignInPassword("");
          if (input.id === "reg-email") setRegisterEmail("");
          if (input.id === "reg-password") setRegisterPassword("");
          if (input.id === "reg-fullName") setRegisterFullName("");
          if (input.id === "reg-confirmPassword") setRegisterConfirmPassword("");
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab]);

  /* ── Tab Switching ── */
  const switchTab = useCallback(
    (tab: AuthTab) => {
      if (tab === activeTab) return;
      setDirection(tab === "register" ? 1 : -1);
      setActiveTab(tab);
      // Clean slate across tabs
      setSignInEmail("");
      setSignInPassword("");
      setRegisterFullName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      // Sync URL without full navigation
      const newPath = tab === "register" ? "/register" : "/login";
      window.history.replaceState(null, "", newPath);
    },
    [activeTab]
  );

  /* ── Handlers ── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("Please provide both email and password.");
      return;
    }
    setSignInLoading(true);
    try {
      const { role: resolvedRole, error } = await signIn(signInEmail, signInPassword);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome back to LibrisAI!");
      const target =
        redirectTo && redirectTo !== "/"
          ? redirectTo
          : resolvedRole === "admin"
          ? "/admin"
          : "/dashboard";
      router.push(target);
    } catch {
      toast.error("Failed to sign in. Please verify your credentials.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerFullName.trim() || !registerEmail || !registerPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setRegisterLoading(true);
    try {
      const { error } = await signUp(registerEmail, registerPassword, registerFullName);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created successfully! Welcome to LibrisAI.");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to complete registration. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) toast.error(error.message);
    } catch {
      toast.error("Google authentication initiated.");
    }
  };

  return (
    <div className="grid w-full lg:h-[650px] grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-xl dark:shadow-[0_12px_48px_rgba(0,0,0,0.6)] bg-white dark:bg-[#0d121f] transition-colors duration-300">
      {/* ── Left Scholarly Branding Panel ── */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-8 lg:p-10 bg-slate-50 dark:bg-[#090d18] text-slate-900 dark:text-white relative overflow-hidden border-r border-slate-200 dark:border-slate-800/80 h-full transition-colors duration-300">
        {/* 3D Wave Particle Dot Matrix Background */}
        <WaveDotMatrix className="absolute inset-0 pointer-events-none z-0" />

        {/* Top: Clean Logo */}
        <Link
          href="/"
          className="relative z-10 flex items-center gap-2.5 group w-fit"
          title="Return to LibrisAI Platform Overview"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/40 group-hover:scale-105 transition-transform">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
            LibrisAI
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 ml-1">
            Academic v2.4
          </span>
        </Link>

        {/* Middle: Scholarly Statement */}
        <div className="relative z-10 my-auto space-y-4.5 max-w-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Scholarly Repository Hub</span>
          </div>

          <h2 className="text-2xl lg:text-[26px] font-bold tracking-tight leading-snug text-slate-900 dark:text-white">
            Access 2.4M+ peer-reviewed articles, datasets, and monographs instantly.
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Empowering global research with lightning-fast citation analysis, secure full-text indexing, and collaborative institutional toolsets.
          </p>
        </div>

        {/* Bottom Metrics */}
        <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-8">
          <div>
            <h4 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">1.2M+</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Downloads / Mo</p>
          </div>
          <div>
            <h4 className="text-xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">99.9%</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">Index Uptime</p>
          </div>
        </div>
      </div>

      {/* ── Right Authentication Panel ── */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:px-10 lg:pt-8 lg:pb-7 bg-white dark:bg-[#111726] text-slate-900 dark:text-[#f8fafc] h-full overflow-hidden transition-colors duration-300">
        <div className="w-full max-w-md mx-auto flex flex-col h-full justify-between">
          {/* ── Zone 1: Pinned Fixed Top Area (Tabs, Heading & Subtitle) ── */}
          <div className="shrink-0">
            {/* Segmented Sign In / Register Toggle with fluid spring pill */}
            <div className="relative grid grid-cols-2 h-10 rounded-xl bg-slate-100 dark:bg-[#090d18] p-1 border border-slate-200 dark:border-slate-800/80 items-center">
              <button
                type="button"
                onClick={() => switchTab("signin")}
                className={`relative z-10 flex h-full items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === "signin"
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {activeTab === "signin" && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-lg bg-indigo-600 shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab("register")}
                className={`relative z-10 flex h-full items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === "register"
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {activeTab === "register" && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-lg bg-indigo-600 shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Register</span>
              </button>
            </div>

            {/* Pinned Heading & Subtitle slot with smooth text crossfade */}
            <div className="mt-8 text-center min-h-[52px] flex flex-col justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === "signin" ? (
                  <motion.div
                    key="signin-header"
                    variants={textFadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                      Welcome back to LibrisAI
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Enter your institutional credentials to access your research dashboard.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register-header"
                    variants={textFadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                      Create Reader Account
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Join scholars and researchers utilizing LibrisAI for accelerated literature discovery.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Zone 2: Animated Middle Form Content Area ── */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden my-auto py-2">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              {activeTab === "signin" ? (
                <motion.div
                  key="signin-form-pane"
                  custom={direction}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex-1 flex flex-col justify-center py-2"
                >
                  <form onSubmit={handleSignIn} className="space-y-4" autoComplete="off">
                    {/* Hidden dummy credentials trap to intercept aggressive Chrome/Safari autofill */}
                    <div className="sr-only" aria-hidden="true" style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1 }}>
                      <input type="text" name="fake_user_trap" tabIndex={-1} autoComplete="off" />
                      <input type="password" name="fake_pwd_trap" tabIndex={-1} autoComplete="new-password" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signin-email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Institutional Email
                      </Label>
                      <Input
                        id="signin-email"
                        name="libris_user_email"
                        type="email"
                        autoComplete="off"
                        placeholder="name@university.edu"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3.5 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signin-password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          name="libris_user_pwd"
                          type={showSignInPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10 px-3.5 transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me + Forgot password */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          id="remember"
                          className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-[#090d18] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 transition-colors">
                          Remember me
                        </span>
                      </label>
                      <Link
                        href="/reset-password"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="pt-2.5">
                      <Button
                        type="submit"
                        disabled={signInLoading}
                        className="w-full h-11 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        {signInLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register-form-pane"
                  custom={direction}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex-1 flex flex-col justify-center py-1"
                >
                  <form onSubmit={handleRegister} className="space-y-3.5" autoComplete="off">
                    {/* Hidden dummy credentials trap to intercept aggressive Chrome/Safari autofill */}
                    <div className="sr-only" aria-hidden="true" style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1 }}>
                      <input type="text" name="fake_reg_user_trap" tabIndex={-1} autoComplete="off" />
                      <input type="password" name="fake_reg_pwd_trap" tabIndex={-1} autoComplete="new-password" />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-fullName" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Full Academic Name
                      </Label>
                      <Input
                        id="reg-fullName"
                        name="libris_reg_fullname"
                        autoComplete="off"
                        placeholder="Dr. Evelyn Reed"
                        value={registerFullName}
                        onChange={(e) => setRegisterFullName(e.target.value)}
                        className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3.5 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Institutional Email
                      </Label>
                      <Input
                        id="reg-email"
                        name="libris_reg_email"
                        type="email"
                        autoComplete="off"
                        placeholder="name@university.edu"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3.5 transition-colors"
                        required
                      />
                    </div>

                    {/* Password & Confirm Password side-by-side on sm+ to eliminate congestion while using full h-11 height */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="reg-password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            name="libris_reg_pwd"
                            type={showRegisterPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Min 6 chars"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10 px-3.5 transition-colors"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="reg-confirmPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="reg-confirmPassword"
                            name="libris_reg_confirm_pwd"
                            type={showRegisterConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Repeat password"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10 px-3.5 transition-colors"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        type="submit"
                        disabled={registerLoading}
                        className="w-full h-11 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        {registerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Reader Account"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Zone 3: Pinned Fixed Bottom Area (Divider, Google SSO, Switch Link) ── */}
          <div className="shrink-0 pt-1 space-y-3">
            {/* Pinned Divider */}
            <div className="relative flex items-center justify-center h-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-white dark:bg-[#111726] px-3 text-slate-500 dark:text-slate-400 transition-colors">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Pinned Google SSO button */}
            <button
              type="button"
              className="w-full h-11 flex items-center justify-center gap-3 text-sm font-semibold text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#182032] dark:hover:bg-[#202b42] rounded-xl border border-slate-300 dark:border-slate-700/70 transition-colors shadow-sm cursor-pointer"
              onClick={handleGoogleSignIn}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Pinned Switch Link */}
            <div className="text-center text-xs text-slate-600 dark:text-slate-400 pt-0.5">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === "signin" ? (
                  <motion.span
                    key="to-register"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchTab("register")}
                      className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                    >
                      Register.
                    </button>
                  </motion.span>
                ) : (
                  <motion.span
                    key="to-signin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchTab("signin")}
                      className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                    >
                      Sign In.
                    </button>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthFormPanel({ defaultTab = "signin" }: AuthFormPanelProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
        </div>
      }
    >
      <AuthFormPanelInner defaultTab={defaultTab} />
    </Suspense>
  );
}
