import React from "react";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="w-full border-t border-border-subtle bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-baseline justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-title-md text-base font-semibold text-on-surface">
            ResumeLoops Archive
          </span>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant max-w-sm">
            Architectural precision and quiet luxury for curated executive vitae.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-on-surface-variant font-label-md text-xs sm:text-sm">
          <span className="text-on-surface-variant/80">© 2025 ResumeLoops Inc.</span>
          <Link href="/templates" className="hover:text-on-surface transition-colors">
            Archival Standards
          </Link>
          <a href="#faq" className="hover:text-on-surface transition-colors">
            Intelligence
          </a>
          <span className="text-on-surface-variant/60">Legal</span>
        </div>
      </div>
    </footer>
  );
}
