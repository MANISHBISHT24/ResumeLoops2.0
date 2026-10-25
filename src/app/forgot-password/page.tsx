"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SupabaseSetupBanner } from "@/components/auth/SupabaseSetupBanner";
import { Button } from "@/components/ui/Button";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetSent, setIsResetSent] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your registered email address.");
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

      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${redirectOrigin}/auth/callback?next=/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setIsResetSent(true);
      setIsLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-8">
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
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Enter your email address and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        {!isConfigured && <SupabaseSetupBanner />}

        {isResetSent ? (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-xs text-center space-y-5 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-on-surface">
              Check your email
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              If an account exists with <strong className="text-on-surface">{email}</strong>, you will receive a password reset link shortly.
            </p>
            <div className="pt-4 border-t border-border-subtle">
              <Link
                href="/login"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-xs">
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
                >
                  Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-email"
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

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border-subtle text-center text-xs text-on-surface-variant">
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-ivory flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
