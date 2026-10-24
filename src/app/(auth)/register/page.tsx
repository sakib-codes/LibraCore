"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Loader2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) toast.error(error.message);
    } catch {
      toast.error("Google authentication initiated.");
    }
  };

  return (
    <div className="grid w-full min-h-[calc(100vh-6rem)] grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl border border-border/80 shadow-xl bg-card my-2">
      {/* Left Academic Branding Panel matching Image 1 */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 flex-col justify-between p-12 lg:p-14 bg-[#080d1a] text-white relative overflow-hidden">
        {/* Subtle dot matrix background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">LibrisAI</span>
        </div>

        {/* Middle: Scholarly Statement */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            <span>Scholarly Repository Hub</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            &ldquo;Access 2.4M+ peer-reviewed scholarly articles, datasets, and monographs instantly.&rdquo;
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Empowering global academic research with lightning-fast citation analysis, secure full-text indexing, and collaborative institutional toolsets.
          </p>
        </div>

        {/* Bottom Metrics matching Image 1 */}
        <div className="relative z-10 pt-8 border-t border-slate-800/80 flex items-center gap-12">
          <div>
            <h4 className="text-2xl font-black tracking-tight text-white">1.2M+</h4>
            <p className="text-xs text-slate-400 mt-0.5">Active Downloads / Mo</p>
          </div>
          <div>
            <h4 className="text-2xl font-black tracking-tight text-emerald-400">99.9%</h4>
            <p className="text-xs text-slate-400 mt-0.5">Index Uptime</p>
          </div>
        </div>
      </div>

      {/* Right Register Card */}
      <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Segmented Sign In / Register Toggle */}
          <div className="flex rounded-xl bg-muted/60 p-1 border border-border/60">
            <Link
              href="/login"
              className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 rounded-lg bg-card py-2 text-center text-xs font-bold text-foreground shadow-2xs transition-all"
            >
              Register
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Create Reader Account
            </h1>
            <p className="text-xs text-muted-foreground">
              Join scholars and researchers utilizing LibrisAI for accelerated literature discovery.
            </p>
          </div>

          {/* Continue with Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 justify-center gap-3 text-xs font-semibold rounded-xl border-border/80 shadow-2xs hover:bg-muted"
            onClick={handleGoogleSignIn}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border/80" />
            <span className="relative bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Or register with email
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold">Full Academic Name</Label>
              <Input
                id="fullName"
                placeholder="Dr. Evelyn Reed"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 rounded-xl text-xs bg-card"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl text-xs bg-card"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl text-xs bg-card"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-xl text-xs bg-card"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Reader Account"}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
