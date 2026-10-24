"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

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
  const current = pageTitles[pathname] || {
    title: "ResumeLoops Workspace",
    subtitle: "AI-Powered Editorial Resume Platform",
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-surface/85 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sm:px-8 transition-colors">
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

      {/* Right Header Status */}
      <div className="flex items-center gap-3">
        <Badge variant="neutral" className="text-[11px] font-mono">
          Phase 3B Foundation
        </Badge>
      </div>
    </header>
  );
}
