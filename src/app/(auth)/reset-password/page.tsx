"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  Loader2,
  ArrowLeft,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Check,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type ResetMode = "request" | "submitted" | "update" | "success";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<ResetMode>("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // New password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Detect recovery mode from URL hash, searchParams, or Supabase Auth event
  useEffect(() => {
    // 1. Check URL hash (Supabase default recovery redirect: #access_token=...&type=recovery)
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const typeParam = searchParams.get("type");
      const codeParam = searchParams.get("code");

      if (
        hash.includes("type=recovery") ||
        hash.includes("access_token=") ||
        typeParam === "recovery" ||
        Boolean(codeParam)
      ) {
        setMode("update");
      }
    }

    // 2. Listen to Supabase Auth state changes for PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  // Handle Step 1: Send recovery email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error("Please enter your registered institutional email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setMode("submitted");
      toast.success("Password reset instructions dispatched to your inbox.");
    } catch {
      toast.error("Failed to initiate password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Set new password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify both fields.");
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setMode("success");
      toast.success("Password successfully updated! Your account is secured.");
    } catch {
      toast.error("Failed to update password. Please try again or request a new link.");
    } finally {
      setUpdating(false);
    }
  };

  const isLengthValid = newPassword.length >= 6;
  const isMatchValid = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-xl dark:shadow-[0_12px_48px_rgba(0,0,0,0.6)] bg-white dark:bg-[#111726] p-6 sm:p-8 text-slate-900 dark:text-[#f8fafc] transition-colors duration-300">
      {/* ── Mode 1: Request Password Reset Form ── */}
      {mode === "request" && (
        <>
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 mb-2 shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter your registered institutional email to receive recovery instructions.
            </p>
          </div>

          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Institutional Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3.5"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending Link...
                </>
              ) : (
                <>
                  Send Recovery Instructions <Send className="h-3.5 w-3.5" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-600 dark:text-slate-400 pt-1">
              Remembered your credentials?{" "}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
              >
                Back to Login.
              </Link>
            </p>
          </form>
        </>
      )}

      {/* ── Mode 2: Instructions Dispatched Confirmation ── */}
      {mode === "submitted" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 mb-2 shadow-sm">
            <Send className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Check Your Inbox
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            A password recovery link has been dispatched to your institutional address.
          </p>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-[#090d18] p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed text-left">
            We sent an email to <strong className="text-slate-900 dark:text-white font-semibold">{email}</strong>.
            Click the secure link in the message to choose your new password. The link expires in 60 minutes.
          </div>

          <div className="space-y-2 pt-2">
            <Button
              asChild
              className="w-full h-11 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Link href="/login" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to Login
              </Link>
            </Button>

            <button
              type="button"
              onClick={() => setMode("request")}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Didn&apos;t receive it? Try another address
            </button>
          </div>
        </div>
      )}

      {/* ── Mode 3: Set New Password Form (Recovery Session Active) ── */}
      {mode === "update" && (
        <>
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 mb-2 shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold mb-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Verified Recovery Session</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create New Password
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter and confirm your new secure institutional password.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <Label
                htmlFor="new-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pl-3.5 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <Label
                htmlFor="confirm-password"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11 rounded-xl text-sm bg-slate-50 dark:bg-[#090d18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pl-3.5 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Live Validation Badges */}
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                  isLengthValid
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Check className={`h-3 w-3 ${isLengthValid ? "opacity-100" : "opacity-40"}`} />
                <span>6+ characters</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                  isMatchValid
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Check className={`h-3 w-3 ${isMatchValid ? "opacity-100" : "opacity-40"}`} />
                <span>Passwords match</span>
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={updating || !isLengthValid || !isMatchValid}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer gap-2 mt-2"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Password...
                </>
              ) : (
                <>
                  Save New Password & Continue <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </>
      )}

      {/* ── Mode 4: Password Updated Success Card ── */}
      {mode === "success" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 mb-2 shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Password Updated!
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Your institutional account credentials have been securely updated.
          </p>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed text-left">
            Your session is active. You can now access your research collections, monographs, and academic workspace.
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => router.push("/")}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Enter Monograph Catalog
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full h-11 text-sm font-semibold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Link href="/dashboard">Go to Research Workspace</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
