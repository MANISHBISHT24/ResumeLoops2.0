"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, FileText, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/auth/AuthProvider";

interface AppHeaderProps {
  onMobileMenuOpen: () => void;
}

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
    title: "Workspace Dashboard",
    subtitle: "Overview of active resumes and job targeting pipelines",
  },
  "/builder": {
    title: "Resume Builder",
    subtitle: "3-panel editor with real-time A4 preview",
  },
  "/templates": {
    title: "Templates Gallery",
    subtitle: "Curated publication-quality resume designs",
  },
  "/ai-rewriter": {
    title: "AI Tailoring & Smart Rewriter",
    subtitle: "Transform experience into high-impact quantified bullets",
  },
  "/ats-analyzer": {
    title: "ATS Compatibility Diagnostic",
    subtitle: "Algorithmic parser simulation and keyword optimization",
  },
};

export function AppHeader({ onMobileMenuOpen }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const current = pageTitles[pathname] || {
    title: "ResumeLoops Workspace",
    subtitle: "AI-Powered Editorial Resume Platform",
  };

  return (
    <header className="no-print sticky top-0 z-20 w-full h-16 bg-surface/85 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sm:px-8 transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Small Screen Brand Icon */}
        <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center lg:hidden">
          <FileText className="w-3.5 h-3.5" />
        </div>

        {/* Current View Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-on-surface tracking-tight">
              {current.title}
            </h1>
            <Badge variant="indigo" className="hidden sm:inline-flex">
              Active
            </Badge>
          </div>
          {current.subtitle && (
            <p className="text-xs text-on-surface-variant hidden md:block">
              {current.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Header Status & User Action */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-on-surface leading-tight">
                {user.user_metadata?.full_name || user.email}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Cloud Sync Active
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {!isConfigured ? (
              <Badge variant="neutral" className="text-[11px] font-mono text-amber-700 bg-amber-500/10 border-amber-500/30">
                Setup Required
              </Badge>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
