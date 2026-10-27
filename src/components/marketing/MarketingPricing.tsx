"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export function MarketingPricing() {
  return (
    <section
      id="pricing"
      className="w-full bg-surface-container-low py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-border-subtle"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-label-xs text-label-xs tracking-widest text-on-surface-variant uppercase block font-medium">
            Membership
          </span>
          <h2 className="mt-2 font-headline-lg text-3xl sm:text-4xl font-medium text-on-surface tracking-tight">
            Transparent, archival investment.
          </h2>
          <p className="mt-3 font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            No perpetual hidden subscriptions. Fair tiering designed for thoughtful practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Tier 1: Member */}
          <div className="bg-surface-container rounded p-8 flex flex-col justify-between shadow-xs border border-border-subtle">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="font-headline-sm text-xl font-semibold text-on-surface">
                  Member
                </span>
                <span className="font-headline-md text-3xl font-mono text-on-surface font-semibold">
                  $19
                </span>
              </div>
              <p className="mt-1 font-body-sm text-sm text-on-surface-variant">
                Full studio access for an active career search window.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Access to all Archival Core Templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Unmetered PDF exports (Vector-rendered)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>ATS Parsing Diagnostics</span>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="w-full h-10 rounded bg-primary text-on-primary font-label-md text-sm font-medium transition-colors hover:bg-neutral-800 flex items-center justify-center shadow-xs"
              >
                Select Member
              </Link>
            </div>
          </div>

          {/* Tier 2: Studio Fellow */}
          <div className="bg-surface-container-lowest rounded p-8 flex flex-col justify-between shadow-sm border border-border-subtle relative">
            <div className="absolute top-4 right-4 bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-label-xs text-[11px] uppercase tracking-wider font-semibold">
              Recommended
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <span className="font-headline-sm text-xl font-semibold text-on-surface">
                  Studio Fellow
                </span>
                <span className="font-headline-md text-3xl font-mono text-on-surface font-semibold">
                  $49
                </span>
              </div>
              <p className="mt-1 font-body-sm text-sm text-on-surface-variant">
                Lifetime repository access, custom letterhead, and priority AI refinement.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2 text-sm text-on-surface font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Complete Archival Library + All Future Releases</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Unlimited Bespoke Cover Letter Formats</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Executive Metric Syntax Assistant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface font-medium">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Direct 1:1 Typographic Alignment Audit</span>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="w-full h-10 rounded bg-primary text-on-primary font-label-md text-sm font-medium transition-colors hover:bg-neutral-800 flex items-center justify-center shadow-xs"
              >
                Become a Fellow
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
