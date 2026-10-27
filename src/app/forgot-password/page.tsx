"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import {
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
    <div className="min-h-screen bg-surface flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-6">
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
            Reset your password
          </h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Enter your email address and we&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        {!isConfigured && <SupabaseSetupBanner />}

        {isResetSent ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 shadow-xs text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-surface-container text-[#276a45] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-title-md text-title-md text-on-surface font-semibold">
              Check your inbox
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              If an account exists with <strong className="text-on-surface font-mono">{email}</strong>, you will receive a password reset link shortly.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="font-label-xs text-label-xs font-semibold text-on-surface hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 shadow-xs">
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-body-sm text-body-sm flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="reset-email"
                  className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail className="w-4 h-4 text-secondary" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.vance@studio.io"
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-2.5 rounded font-label-md text-label-md flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-outline-variant/30 text-center font-body-sm text-[13px] text-on-surface-variant">
              <Link
                href="/login"
                className="font-semibold text-on-surface hover:underline inline-flex items-center gap-1.5"
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
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
