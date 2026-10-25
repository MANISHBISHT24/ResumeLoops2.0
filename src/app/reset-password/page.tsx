"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SupabaseSetupBanner } from "@/components/auth/SupabaseSetupBanner";
import { Button } from "@/components/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || password.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter matching passwords.");
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

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // Password updated successfully -> redirect to login with query flag
      router.push("/login?reset=1");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
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
          <div className="mt-6 flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Set new password
            </h1>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            Enter a secure new password for your ResumeLoops account.
          </p>
        </div>

        {!isConfigured && <SupabaseSetupBanner />}

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

          <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
              >
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
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
                htmlFor="confirm-new-password"
                className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-new-password"
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
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle text-center text-xs text-on-surface-variant">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Cancel and return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-ivory flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
