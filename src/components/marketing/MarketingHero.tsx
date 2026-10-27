import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sliders } from "lucide-react";

export function MarketingHero() {
  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Product Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs uppercase tracking-widest shadow-2xs border border-border-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>ResumeLoops Studio 2.0 • Quiet Editorial Platform</span>
        </div>

        {/* Headline */}
        <h1 className="mt-6 max-w-4xl font-display-xl text-3xl sm:text-5xl lg:text-[56px] lg:leading-[64px] text-on-surface tracking-tight font-normal">
          The next chapter of your career starts here.
        </h1>

        {/* Sub-copy */}
        <p className="mt-4 max-w-2xl font-body-lg text-base sm:text-lg text-on-surface-variant leading-relaxed">
          Create a thoughtful, professional resume with a workspace that helps you express your experience clearly, without artificial templates or generic AI tropes.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="h-11 px-6 rounded bg-primary text-on-primary font-label-md text-label-md transition-all duration-200 hover:bg-neutral-800 shadow-xs flex items-center gap-2"
          >
            <span>Build your resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#templates"
            className="h-11 px-6 rounded bg-surface-container-low text-on-surface border border-border-subtle font-label-md text-label-md transition-all duration-200 hover:bg-surface-container shadow-xs flex items-center gap-2"
          >
            <span>Explore templates</span>
          </a>
        </div>

        {/* Centerpiece Visual: Heavy Paper Mockup */}
        <div className="relative w-full max-w-4xl mt-12 pt-2">
          {/* Ambient blurred backing */}
          <div
            className="absolute inset-x-8 top-12 h-64 bg-surface-container-highest/60 rounded-full blur-3xl -z-10 pointer-events-none"
            aria-hidden="true"
          />

          {/* The Paper Document Container */}
          <div className="relative mx-auto w-full max-w-3xl bg-surface-container-lowest rounded p-6 sm:p-12 shadow-paper-elevated border border-border-subtle text-left select-none">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-6 border-b border-border-subtle">
              <div>
                <h2 className="font-headline-md text-2xl font-medium tracking-tight text-on-surface uppercase">
                  Julian Vance
                </h2>
                <p className="font-label-md text-label-md tracking-widest text-on-surface-variant uppercase mt-1">
                  VP of Product Architecture • San Francisco
                </p>
              </div>
              <div className="text-left sm:text-right font-body-sm text-body-sm text-on-surface-variant/80">
                <p>julian.vance@curated.io</p>
                <p>+1 (415) 890-2104</p>
              </div>
            </div>

            {/* Section: Executive Summary */}
            <div className="mt-6">
              <span className="font-label-xs text-label-xs tracking-widest text-on-surface-variant uppercase block font-medium">
                Executive Synthesis
              </span>
              <p className="mt-2 font-body-md text-body-md text-on-surface leading-relaxed">
                Product executive with 14 years architecting resilient platform systems and consumer ecosystems. Steered platform scaling from $12M to $84M ARR while orchestrating cross-continental design and technical organizations. Focused on quiet utility and system durability.
              </p>
            </div>

            {/* Section: Experience */}
            <div className="mt-6">
              <span className="font-label-xs text-label-xs tracking-widest text-on-surface-variant uppercase block mb-3 font-medium">
                Select Trajectory
              </span>
              <div className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">
                      Head of Product Strategy — Monolith Systems
                    </span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant font-mono">
                      2021 — PRESENT
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    • Architected autonomous service frameworks cutting transactional latency by 42% across 3M daily active accounts.<br />
                    • Unified 6 decoupled product squads under single design standard, shortening release cycles from quarterly to bi-weekly cadences.
                  </p>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">
                      Principal Systems Designer — Archive Collective
                    </span>
                    <span className="font-label-xs text-label-xs text-on-surface-variant font-mono">
                      2017 — 2021
                    </span>
                  </div>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    • Led foundational design overhaul of core asset registry, preserving archival fidelity for 180,000 corporate records.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Editorial Annotations */}
            <div className="absolute -right-3 sm:-right-6 top-24 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm hidden md:flex items-center gap-1.5 border border-border-subtle">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="font-label-xs text-label-xs tracking-wider uppercase text-on-surface font-semibold">
                120gsm Archival Grade
              </span>
            </div>
            <div className="absolute -left-3 sm:-left-6 bottom-20 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm hidden md:flex items-center gap-1.5 border border-border-subtle">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span className="font-label-xs text-label-xs tracking-wider uppercase text-on-surface font-semibold">
                Optical Baselined
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
