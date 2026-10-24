import React from "react";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-container">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <span className="font-extrabold text-lg text-on-surface tracking-tight">
                ResumeLoops
              </span>
            </Link>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Publication-grade editorial resume builder engineered for ATS compatibility and executive-level clarity.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-on-surface">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  ATS Simulator &amp; Scoring
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-primary transition-colors">
                  Curated Layouts
                </a>
              </li>
              <li>
                <Link href="/ai-rewriter" className="hover:text-primary transition-colors">
                  AI Bullet Point Rewriter
                </Link>
              </li>
              <li>
                <Link href="/ats-analyzer" className="hover:text-primary transition-colors">
                  ATS Job Matcher
                </Link>
              </li>
            </ul>
          </div>

          {/* Workspace Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-on-surface">
              Workspace
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/builder" className="hover:text-primary transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-primary transition-colors">
                  Template Library
                </Link>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-on-surface">
              Resources
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Launch Demo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-on-surface-variant text-xs font-medium">
          <div>
            &copy; {new Date().getFullYear()} ResumeLoops. All rights reserved.
          </div>
          <div className="text-[11px] text-on-surface-variant/80">
            Independent editorial design system implementation based on Google Stitch specifications.
          </div>
        </div>
      </div>
    </footer>
  );
}
