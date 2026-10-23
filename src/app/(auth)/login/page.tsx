"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Loader2,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  Quote,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/";
  const { signIn, loginDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const { role: resolvedRole, error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back to LibrisAI!");
      const target = redirectTo && redirectTo !== "/" ? redirectTo : (resolvedRole === "admin" ? "/admin" : "/dashboard");
      router.push(target);
    } catch {
      toast.error("Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
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

  const fillDemoAccount = async (role: "user" | "admin") => {
    const demoEmail = role === "admin" ? "admin@libris.ai" : "student@libris.ai";
    const demoPassword = role === "admin" ? "Admin@123456" : "Student@123456";
    setEmail(demoEmail);
    setPassword(demoPassword);

    setLoading(true);
    try {
      const resolvedRole = await loginDemo(role);
      toast.success(role === "admin" ? "Signed in as Administrator!" : "Signed in as Reader!");
      const target = redirectTo && redirectTo !== "/" ? redirectTo : (resolvedRole === "admin" ? "/admin" : "/dashboard");
      router.push(target);
    } catch {
      toast.error("Failed to sign in with demo credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full min-h-[calc(100vh-8rem)] grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border border-border shadow-xl bg-card my-4">
      {/* Left Academic Branding Panel (50% desktop) */}
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
              Scholarly Knowledge & Literature at Your Fingertips.
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Explore thousands of digital manuscripts, textbooks, and peer-reviewed journals with on-demand Google Gemini AI analysis.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Full-text in-browser previewing for PDF, ePub, & Audiobooks</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Contextual Q&A on individual books powered by Gemini</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-indigo-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Personalized bookmarks and offline download tracking</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-indigo-800/60">
          <Quote className="h-6 w-6 text-indigo-400 mb-2 opacity-60" />
          <blockquote className="text-xs text-indigo-200 italic leading-relaxed">
            &ldquo;A library is not a luxury but one of the necessities of life.&rdquo;
          </blockquote>
          <p className="text-[11px] text-indigo-300 font-semibold mt-1">— Henry Ward Beecher</p>
        </div>
      </div>

      {/* Right Login Card (50% desktop) */}
      <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your credentials to access your academic dashboard
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
                Or with institutional email
              </span>
            </div>
          </div>

          {/* Demo account pills */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Quick One-Click Demo Access:
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs gap-1.5 h-8 bg-background"
                onClick={() => fillDemoAccount("user")}
              >
                <User className="h-3 w-3" /> Reader
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs gap-1.5 h-8 bg-background font-semibold text-primary"
                onClick={() => fillDemoAccount("admin")}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Link
                  href="/reset-password"
                  className="text-[11px] text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-bold bg-primary text-primary-foreground gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register as Reader
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
