"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
    <div className="min-h-screen bg-surface flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group focus:outline-none"
          >
            <span className="font-title-md text-title-md font-semibold text-on-surface tracking-tight">
              ResumeLoops
            </span>
          </Link>
          <h1 className="mt-4 font-headline-md text-headline-md font-medium text-on-surface tracking-tight">
            Sign in to your archive
          </h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Access your cloud-synced resumes, ATS analyses, and editorial tailoring pipeline
          </p>
        </div>

        {/* Unconfigured notice */}
        {!isConfigured && <SupabaseSetupBanner />}

        {/* Success banners for query actions */}
        {verifiedParam && (
          <div
            role="status"
            className="p-3 rounded-lg bg-surface-container border border-outline-variant/40 text-[#276a45] font-body-sm text-body-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Email verified successfully. You can now sign in to your archive.</span>
          </div>
        )}

        {resetParam && (
          <div
            role="status"
            className="p-3 rounded-lg bg-surface-container border border-outline-variant/40 text-[#276a45] font-body-sm text-body-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your password has been updated. Please sign in with your new password.</span>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-body-sm text-body-sm flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Login form card */}
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 shadow-xs">
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Mail className="w-4 h-4 text-secondary" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.lawson@studio.io"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-label-xs text-label-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock className="w-4 h-4 text-secondary" />
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
                  className="w-full pl-9 pr-9 py-2 bg-surface-container-low border border-outline-variant/40 rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer focus:outline-none"
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
              className="w-full py-2.5 rounded font-label-md text-label-md flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-2"
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

          <div className="mt-5 pt-4 border-t border-outline-variant/30 text-center font-body-sm text-[13px] text-on-surface-variant">
            <span>Don&apos;t have an account yet? </span>
            <Link
              href={nextParam ? `/signup?next=${encodeURIComponent(nextParam)}` : "/signup"}
              className="font-semibold text-on-surface hover:underline"
            >
              Create free account
            </Link>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center font-label-xs text-label-xs text-on-surface-variant/70">
          Protected by Supabase Row Level Security &amp; encrypted session tokens.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
