import React from "react";
import { Edit3, Sparkles, SlidersHorizontal } from "lucide-react";

export function MarketingComparison() {
  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-label-xs text-label-xs tracking-widest text-on-surface-variant uppercase block font-medium">
            The Editorial Lens
          </span>
          <h2 className="mt-2 font-headline-lg text-3xl sm:text-4xl font-medium text-on-surface tracking-tight">
            Elevate without inventing.
          </h2>
          <p className="mt-3 font-body-md text-base text-on-surface-variant leading-relaxed">
            Generic AI tools inflate experience with synthetic buzzwords. ResumeLoops sharpens your real impact using boardroom-tested syntax.
          </p>
        </div>

        {/* Before & After Interactive Container */}
        <div className="bg-surface-container rounded p-6 sm:p-8 max-w-4xl mx-auto border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-medium">
              Interactive Transformation
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-label-xs text-label-xs text-on-surface-variant font-medium">
                Real-time Refinement
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Before Card */}
            <div className="bg-surface-container-low p-6 rounded flex flex-col justify-between shadow-2xs border border-border-subtle">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-xs text-label-xs tracking-widest uppercase text-on-surface-variant font-medium">
                    Draft / Input
                  </span>
                  <Edit3 className="w-4 h-4 text-on-surface-variant" />
                </div>
                <p className="font-body-md text-sm text-on-surface italic leading-relaxed">
                  “Managed a team of designers and shipped new dashboard features.”
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-border-subtle/50">
                <span className="font-label-xs text-label-xs text-on-surface-variant block uppercase font-medium">
                  Diagnosis
                </span>
                <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                  Vague metrics, passive stance, zero organizational leverage identified.
                </p>
              </div>
            </div>

            {/* After Card */}
            <div className="bg-surface-container-lowest p-6 rounded flex flex-col justify-between shadow-sm border border-border-subtle">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-label-xs text-label-xs tracking-widest uppercase text-primary font-semibold">
                    ResumeLoops Refined
                  </span>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="font-body-md text-sm text-on-surface font-medium leading-relaxed">
                  “Directed 8 product designers across 4 squads to launch multi-region analytics suite, accelerating ARR expansion by $4.2M.”
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-surface-container font-label-xs text-label-xs text-on-surface uppercase">
                  +Measurable Impact
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container font-label-xs text-label-xs text-on-surface uppercase">
                  +Executive Tone
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-xs text-label-xs text-on-surface font-semibold uppercase">
                  100% Truthful
                </span>
              </div>
            </div>
          </div>

          {/* Micro metric bar */}
          <div className="mt-6 p-3 bg-surface-container-high rounded flex flex-col sm:flex-row items-center justify-between gap-2 border border-border-subtle">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-on-surface" />
              <span className="font-body-sm text-xs sm:text-sm text-on-surface font-medium">
                Voice Control: Active C-Suite Stance
              </span>
            </div>
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant">
              Validated against 4,000+ Verified Placements
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
