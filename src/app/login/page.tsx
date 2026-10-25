"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSafeRedirectUrl } from "@/lib/supabase/safe-redirect";
import { SupabaseSetupBanner } from "@/components/auth/SupabaseSetupBanner";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const verifiedParam = searchParams.get("verified");
  const resetParam = searchParams.get("reset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env.local file."
      );
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Failed to initialize Supabase client.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const targetUrl = getSafeRedirectUrl(nextParam, "/dashboard");
        router.push(targetUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during login.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Brand header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl text-on-surface tracking-tight">
              ResumeLoops
            </span>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Access your cloud-synced resumes, ATS analyses, and tailoring pipeline
          </p>
        </div>

        {/* Unconfigured notice */}
        {!isConfigured && <SupabaseSetupBanner />}

        {/* Success banners for query actions */}
        {verifiedParam && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Email verified successfully! You can now log in to your account.</span>
          </div>
        )}

        {resetParam && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Your password has been updated. Please sign in with your new password.</span>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login form card */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-xs">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.lawson@example.com"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-on-surface uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low border border-border-subtle rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle text-center text-xs text-on-surface-variant">
            <span>Don&apos;t have an account yet? </span>
            <Link
              href={nextParam ? `/signup?next=${encodeURIComponent(nextParam)}` : "/signup"}
              className="font-bold text-primary hover:underline"
            >
              Create free account
            </Link>
          </div>
        </div>

        {/* Privacy footnote */}
        <p className="text-center text-xs text-on-surface-variant/70">
          Protected by Supabase Row Level Security &amp; end-to-end encrypted session tokens.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-ivory flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
