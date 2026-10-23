"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Loader2,
  ArrowRight,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created successfully! Welcome to LibrisAI.");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to complete registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) toast.error(error.message);
    } catch {
      toast.error("Google authentication initiated.");
    }
  };

  return (
    <div className="grid w-full min-h-[calc(100vh-8rem)] grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border border-border shadow-xl bg-card my-4">
      {/* Left Academic Branding Panel */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">LibrisAI</span>
          </div>

          <div className="pt-12 space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Begin Your Journey in Digital Scholarship.
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Create your reader account to bookmark academic texts, stream audio lectures, and query books with Gemini AI.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Instant free access to all open-access digital volumes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>AI-assisted chapter summarization and core concepts</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Cross-platform reading history & download tracker</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-indigo-800/60">
          <Quote className="h-6 w-6 text-indigo-400 mb-2 opacity-60" />
          <blockquote className="text-xs text-indigo-200 italic leading-relaxed">
            &ldquo;Reading is to the mind what exercise is to the body.&rdquo;
          </blockquote>
          <p className="text-[11px] text-indigo-300 font-semibold mt-1">— Joseph Addison</p>
        </div>
      </div>

      {/* Right Register Card */}
      <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Create Reader Account
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign up for full repository access and AI librarian tools
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 gap-2 text-xs font-semibold"
            onClick={handleGoogleSignIn}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.16z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.39 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground text-[10px] font-semibold">
                Or with email registration
              </span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Academic / Personal Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Create Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-bold bg-primary text-primary-foreground gap-2 pt-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
