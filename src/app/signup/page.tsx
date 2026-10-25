"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
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
    <div className="min-h-screen bg-warm-ivory flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Brand Header */}
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Start building publication-grade, ATS-optimized resumes with cloud persistence
          </p>
        </div>

        {/* Unconfigured notice */}
        {!isConfigured && <SupabaseSetupBanner />}

        {/* Verification Sent State */}
        {isVerificationSent ? (
          <div className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-xs text-center space-y-5 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-on-surface">
              Check your inbox
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              We&apos;ve sent a confirmation link to{" "}
              <strong className="text-on-surface">{email}</strong>. Please click the link to confirm your account and begin building.
            </p>
            <div className="pt-4 border-t border-border-subtle">
              <Link
                href="/login"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
              >
                <span>Return to sign in</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Signup Form */
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

            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
                >
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Lawson"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-email"
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
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
                >
                  Password (min 8 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Lock className="w-4 h-4" />
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

              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Lock className="w-4 h-4" />
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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-border-subtle text-center text-xs text-on-surface-variant">
              <span>Already have an account? </span>
              <Link
                href={nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* Security footnote */}
        <p className="text-center text-xs text-on-surface-variant/70">
          Your credentials and resume data are stored with PostgreSQL Row Level Security.
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-ivory flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
