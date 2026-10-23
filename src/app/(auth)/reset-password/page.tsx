"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSubmitted(true);
      toast.success("Password reset instructions dispatched to your inbox.");
    } catch {
      toast.error("Failed to initiate password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md shadow-xl border-border/80">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-xs">
            <BookOpen className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            Reset Password
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {submitted
              ? "Check your inbox for a secure password recovery link"
              : "Enter your registered email address to receive password reset instructions"}
          </CardDescription>
        </CardHeader>

        {submitted ? (
          <CardContent className="space-y-4 text-center">
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground leading-relaxed">
              We sent a password recovery email to{" "}
              <strong className="text-foreground">{email}</strong>. Follow the instructions
              contained in the message to select a new password.
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to Login
              </Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Account Email</Label>
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
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full h-10 font-bold bg-primary text-primary-foreground gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending Link...
                  </>
                ) : (
                  <>
                    Send Reset Link <Send className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Remembered your password?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
