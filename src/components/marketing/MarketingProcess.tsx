import React from "react";

export function MarketingProcess() {
  return (
    <section
      id="philosophy"
      className="w-full bg-surface-container-low py-16 px-4 sm:px-6 lg:px-8 border-y border-border-subtle"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant">
            Our Tenets
          </span>
          <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-medium">
            Vol. II — Principles
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* 01 */}
          <div className="p-6 bg-surface-container rounded shadow-xs hover:shadow-sm transition-shadow border border-border-subtle">
            <span className="font-display-xl text-4xl lg:text-5xl text-on-surface-variant/40 block leading-none">
              01
            </span>
            <h3 className="mt-4 font-headline-sm text-xl font-semibold text-on-surface">
              Structured Thought
            </h3>
            <p className="mt-2 font-body-sm text-sm text-on-surface-variant leading-relaxed">
              Content precedes layout. We guide you to distill complex achievements into deliberate, measurable narratives before setting a single line of type.
            </p>
          </div>
          {/* 02 */}
          <div className="p-6 bg-surface-container-high rounded shadow-xs hover:shadow-sm transition-shadow md:-mt-3 border border-border-subtle">
            <span className="font-display-xl text-4xl lg:text-5xl text-on-surface-variant/40 block leading-none">
              02
            </span>
            <h3 className="mt-4 font-headline-sm text-xl font-semibold text-on-surface">
              Editorial Restraint
            </h3>
            <p className="mt-2 font-body-sm text-sm text-on-surface-variant leading-relaxed">
              Absence of visual noise communicates authority. No neon skill progress gauges or decorative ribbons—only typographic proportion and crystalline hierarchy.
            </p>
          </div>
          {/* 03 */}
          <div className="p-6 bg-surface-container rounded shadow-xs hover:shadow-sm transition-shadow border border-border-subtle">
            <span className="font-display-xl text-4xl lg:text-5xl text-on-surface-variant/40 block leading-none">
              03
            </span>
            <h3 className="mt-4 font-headline-sm text-xl font-semibold text-on-surface">
              Algorithmic Precision
            </h3>
            <p className="mt-2 font-body-sm text-sm text-on-surface-variant leading-relaxed">
              Under-the-hood parsing engines test line-length, semantic token distribution, and ATS machine readability without warping your human voice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
