"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  isConfigured: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isConfigured = useMemo(() => isSupabaseConfigured(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => isSupabaseConfigured());

  const signOut = useCallback(async () => {
    if (!isConfigured) return;
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("resumeloops_auth_signed_out"));
      }
    }
  }, [isConfigured]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      return;
    }

    let isMounted = true;

    // Initial session retrieval
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("[ResumeLoops Auth] Failed to retrieve session:", err);
        if (isMounted) setIsLoading(false);
      });

    // Realtime auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === "SIGNED_OUT") {
        // Dispatch account switch/logout event to clear memory resume stores
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("resumeloops_auth_signed_out"));
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isConfigured,
      signOut,
    }),
    [user, session, isLoading, isConfigured, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
