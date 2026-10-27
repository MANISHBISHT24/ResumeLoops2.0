"use client";

import React from "react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

export function MarketingTemplates() {
  return (
    <section
      id="templates"
      className="w-full bg-surface-container-low py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border-subtle"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-label-xs text-label-xs tracking-widest text-on-surface-variant uppercase block font-medium">
              The Curated Formats
            </span>
            <h2 className="mt-2 font-headline-lg text-3xl sm:text-4xl font-medium text-on-surface tracking-tight">
              Designed for the top percentile.
            </h2>
          </div>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-sm leading-relaxed">
            Built according to strict archival standards with proportional font hierarchies and calibrated baseline grids.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLATES.map((tmpl, idx) => (
            <div key={tmpl.id} className="group flex flex-col">
              <div className="bg-surface-container-lowest p-6 rounded shadow-paper aspect-[3/4] flex flex-col justify-between transition-all duration-300 group-hover:shadow-paper-elevated border border-border-subtle relative overflow-hidden">
                <div>
                  {/* Miniature abstract representation */}
                  <div className="h-2 w-12 bg-primary mb-4" />
                  <div className="h-3 w-3/4 bg-surface-container-high mb-2" />
                  <div className="h-2 w-1/2 bg-surface-container-high mb-6" />
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-surface-container" />
                    <div className="h-1.5 w-full bg-surface-container" />
                    <div className="h-1.5 w-4/5 bg-surface-container" />
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-border-subtle/40">
                  <div className="flex justify-between items-center">
                    <div className="h-2 w-1/3 bg-surface-container-high" />
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      ATS 99%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container" />
                  <div className="h-1.5 w-5/6 bg-surface-container" />
                </div>

                {/* Hover CTA Overlay */}
                <div className="absolute inset-0 bg-surface/90 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-4">
                  <Link
                    href={`/builder?template=${tmpl.id}`}
                    className="h-9 px-4 rounded bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center transition-colors hover:bg-neutral-800 shadow-xs"
                  >
                    Use Format
                  </Link>
                  <Link
                    href="/templates"
                    className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <h3 className="font-title-md text-base font-semibold text-on-surface">
                    {tmpl.name}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    {tmpl.bestFor.split(",")[0]}
                  </p>
                </div>
                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase font-mono">
                  0{idx + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
