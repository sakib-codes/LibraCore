"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/integrations/supabase/types";

export interface StoredSessionData {
  userId: string;
  email: string;
  fullName: string;
  role: AppRole;
  avatarUrl?: string;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null; role: AppRole }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  loginDemo: (role: "user" | "admin") => Promise<AppRole>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_ACCOUNTS = {
  admin: {
    userId: "a0000000-0000-0000-0000-000000000001",
    email: "admin@libris.ai",
    fullName: "Dr. Victoria Vance (Admin)",
    name: "Victoria Vance",
    role: "admin" as AppRole,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    bio: "Chief Librarian & Digital Archives Administrator",
  },
  user: {
    userId: "a0000000-0000-0000-0000-000000000002",
    email: "student@libris.ai",
    fullName: "Alex Mercer (Reader)",
    name: "Alex Mercer",
    role: "user" as AppRole,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    bio: "Computer Science Scholar & Research Fellow",
  },
};

function setSessionCookie(data: StoredSessionData | null) {
  if (typeof document === "undefined") return;
  if (!data) {
    document.cookie = "libris_session=; path=/; max-age=0; SameSite=Lax";
    try {
      localStorage.removeItem("libris_session");
    } catch {}
  } else {
    const val = encodeURIComponent(JSON.stringify(data));
    document.cookie = `libris_session=${val}; path=/; max-age=604800; SameSite=Lax`;
    try {
      localStorage.setItem("libris_session", JSON.stringify(data));
    } catch {}
  }
}

function getStoredSession(): StoredSessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("libris_session");
    if (raw) return JSON.parse(raw);
  } catch {}

  // Fallback to cookie
  try {
    const match = document.cookie.match(/(?:^|;\s*)libris_session=([^;]+)/);
    if (match) {
      return JSON.parse(decodeURIComponent(match[1]));
    }
  } catch {}

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply stored session data to state
  const applySessionData = useCallback((data: StoredSessionData) => {
    const mockUser: User = {
      id: data.userId,
      email: data.email,
      aud: "authenticated",
      role: "authenticated",
      app_metadata: { role: data.role },
      user_metadata: { full_name: data.fullName, role: data.role },
      created_at: new Date().toISOString(),
    } as any;

    const mockProfile: Profile = {
      id: data.userId,
      name: data.fullName,
      full_name: data.fullName,
      email: data.email,
      avatar_url: data.avatarUrl || null,
      phone: null,
      bio: null,
      role: data.role,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setRole(data.role);
    setSessionCookie(data);
  }, []);

  const loginDemo = useCallback(async (selectedRole: "user" | "admin"): Promise<AppRole> => {
    const account = DEMO_ACCOUNTS[selectedRole];
    const password = selectedRole === "admin" ? "Admin@123456" : "Student@123456";

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password,
      });

      if (data?.session && data?.user) {
        setSession(data.session);
        setUser(data.user);
        setRole(account.role);

        // Fetch live profile
        const { data: profData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        const prof: any = profData;
        if (prof) setProfile(prof as Profile);

        setSessionCookie({
          userId: data.user.id,
          email: data.user.email || account.email,
          fullName: prof?.full_name || account.fullName,
          role: account.role,
          avatarUrl: prof?.avatar_url || account.avatarUrl,
        });

        setLoading(false);
        return account.role;
      }
    } catch {}

    // Fallback if offline
    applySessionData({
      userId: account.userId,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      avatarUrl: account.avatarUrl,
    });
    setLoading(false);
    return account.role;
  }, [applySessionData]);

  const signIn = useCallback(
    async (email: string, password?: string): Promise<{ error: Error | null; role: AppRole }> => {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password || "",
        });

        if (error) {
          setLoading(false);
          return { error: new Error(error.message), role: "user" };
        }

        if (data.session && data.user) {
          setSession(data.session);
          setUser(data.user);

          // Fetch profile and role from live Supabase
          const { data: profData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .maybeSingle();

          const prof: any = profData;
          const resolvedRole: AppRole = (roleData as any)?.role || prof?.role || (cleanEmail.includes("admin") ? "admin" : "user");
          setRole(resolvedRole);
          if (prof) setProfile(prof as Profile);

          setSessionCookie({
            userId: data.user.id,
            email: data.user.email || cleanEmail,
            fullName: prof?.full_name || data.user.user_metadata?.full_name || cleanEmail,
            role: resolvedRole,
            avatarUrl: prof?.avatar_url || undefined,
          });

          setLoading(false);
          return { error: null, role: resolvedRole };
        }
      } catch (err: any) {
        setLoading(false);
        return { error: new Error(err?.message || "Failed to sign in with Supabase credentials"), role: "user" };
      }

      setLoading(false);
      return { error: new Error("Authentication failed. Please verify your credentials."), role: "user" };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: "user",
            },
          },
        });

        if (error) {
          setLoading(false);
          return { error: new Error(error.message) };
        }

        if (data?.user) {
          // Create profile record in public.profiles table
          try {
            await (supabase.from("profiles") as any).upsert({
              id: data.user.id,
              name: fullName.trim(),
              full_name: fullName.trim(),
              email: cleanEmail,
              role: "user",
              is_suspended: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } catch {
            // Silently ignore or rely on trigger
          }

          try {
            await (supabase.from("user_roles") as any).upsert({
              user_id: data.user.id,
              role: "user",
            });
          } catch {
            // Silently ignore or rely on trigger
          }

          if (data.session) {
            setSession(data.session);
            setUser(data.user);
            setRole("user");
          }

          applySessionData({
            userId: data.user.id,
            email: cleanEmail,
            fullName: fullName.trim(),
            role: "user",
          });
        }
      } catch (err: any) {
        setLoading(false);
        return { error: new Error(err?.message || "Failed to complete Supabase registration") };
      }

      setLoading(false);
      return { error: null };
    },
    [applySessionData]
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setSessionCookie(null);
  }, []);

  const refresh = useCallback(async () => {
    const stored = getStoredSession();
    if (stored) {
      applySessionData(stored);
      setLoading(false);
      return;
    }

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentSession.user.id)
          .maybeSingle();

        setRole((roleData as any)?.role || "user");
      }
    } catch {}
    setLoading(false);
  }, [applySessionData]);

  // Initial load
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      applySessionData(stored);
      setLoading(false);
    } else {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user) {
        setSession(nextSession);
        setUser(nextSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applySessionData]);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    role,
    loading,
    isAdmin: role === "admin",
    isSuspended: profile?.is_suspended ?? false,
    signIn,
    signUp,
    signOut,
    refresh,
    loginDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
