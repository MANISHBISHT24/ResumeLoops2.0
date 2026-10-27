"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
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

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-type your password.");
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

      // Safe redirect target for verification email
      const safeNext = getSafeRedirectUrl(nextParam, "/dashboard");
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${redirectOrigin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
          emailRedirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // Check whether email confirmation is required by Supabase project settings
      if (data.session) {
        // Automatically signed in (email confirmation disabled)
        router.push(safeNext);
        router.refresh();
      } else if (data.user) {
        // Email confirmation is required
        setIsVerificationSent(true);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
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
            Create your account
          </h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Start authoring publication-grade, ATS-aligned resumes with cloud persistence
          </p>
        </div>

        {/* Unconfigured notice */}
        {!isConfigured && <SupabaseSetupBanner />}

        {/* Verification Sent Success Notice */}
        {isVerificationSent ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 shadow-xs text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-surface-container text-[#276a45] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-title-md text-title-md text-on-surface font-semibold">Check your inbox</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              We&apos;ve sent a confirmation link to <strong className="text-on-surface">{email}</strong>.
              Click the link to verify your email address and activate your cloud archive.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="mx-auto">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Error Notification */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-body-sm text-body-sm flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Signup Form Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 shadow-xs">
              <form onSubmit={handleSignup} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold mb-1"
                  >
                    Full Name <span className="text-on-surface-variant/50 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <User className="w-4 h-4 text-secondary" />
                    </div>
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alexandre Vance"
                      disabled={isLoading}
                      className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <Mail className="w-4 h-4 text-secondary" />
                    </div>
                    <input
                      id="signup-email"
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

                <div>
                  <label
                    htmlFor="signup-password"
                    className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold mb-1"
                  >
                    Password <span className="text-on-surface-variant/50 font-normal">(Min 8 chars)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <Lock className="w-4 h-4 text-secondary" />
                    </div>
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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

                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <Lock className="w-4 h-4 text-secondary" />
                    </div>
                    <input
                      id="signup-confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      disabled={isLoading}
                      className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-on-surface transition-all"
                    />
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 pt-4 border-t border-outline-variant/30 text-center font-body-sm text-[13px] text-on-surface-variant">
                <span>Already have an account? </span>
                <Link
                  href={nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}
                  className="font-semibold text-on-surface hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </>
        )}

        <p className="text-center font-label-xs text-label-xs text-on-surface-variant/70">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
