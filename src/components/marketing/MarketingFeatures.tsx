import React from "react";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";

export function MarketingFeatures() {
  return (
    <section className="py-24 sm:py-28 px-6 max-w-7xl mx-auto w-full flex flex-col gap-24 sm:gap-28" id="features">
      {/* Feature 1: Real-Time Scoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Text Column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            Real-Time Scoring
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
            Know your score before you hit submit.
          </h2>
          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
            Our proprietary ATS simulator evaluates your resume against industry parsers. Spot missing keywords, formatting traps, and readability issues instantly.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2.5 text-on-surface">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-semibold">
                Keyword Density Checker
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-on-surface">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-semibold">
                Layout Parser Test
              </span>
            </div>
          </div>
        </div>

        {/* Visual Mockup Column */}
        <div className="lg:col-span-6 bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-surface-container shadow-inner flex flex-col gap-6">
          {/* Card 1: Match Score Summary */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between border border-surface-container-high/80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-2xs">
                98%
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-base">
                  Software Engineering Role
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Matched against 24 key industry requirements
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
              Ready
            </span>
          </div>

          {/* Card 2: Keyword Density & Bar */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-3.5 border border-surface-container-high/80">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface font-bold">
                Required Keywords Found
              </span>
              <span className="text-primary font-extrabold text-base">
                18 / 19
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden p-0.5">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: "94%" }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-medium">
                TypeScript ✓
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-medium">
                System Design ✓
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-medium">
                CI/CD Pipelines ✓
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                GraphQL (Suggested)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: AI Content Tailoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Visual Mockup Column (Left on Desktop) */}
        <div className="lg:col-span-6 order-2 lg:order-1 bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-surface-container shadow-inner flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4 border border-surface-container-high/80">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-bold tracking-wider uppercase">
                  AI Rewrite Suggestion
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary-container text-primary font-semibold">
                Impact-driven
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              <div className="p-3 rounded-lg bg-surface-container-low text-on-surface-variant border border-surface-container">
                <span className="text-[11px] font-sans font-bold text-neutral-500 uppercase block mb-1">
                  Original Bullet
                </span>
                &quot;Managed team projects&quot;
              </div>

              <div className="p-3.5 rounded-lg bg-primary/5 text-on-surface border border-primary/25 shadow-2xs">
                <span className="text-[11px] font-sans font-bold text-primary uppercase block mb-1">
                  Enhanced with Metrics
                </span>
                &quot;Spearheaded cross-functional engineering initiatives, accelerating deployment velocity by 34%.&quot;
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 font-sans">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                +34% Hiring Match Score
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                ATS Safe Phrasing
              </span>
            </div>
          </div>
        </div>

        {/* Text Column (Right on Desktop) */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-6">
          <span className="text-xs uppercase tracking-widest font-bold text-primary">
            AI Content Tailoring
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
            Transform passive duties into quantified impact.
          </h2>
          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
            Stuck on bullet points? Our writing assistant rewrites your work history using powerful action verbs and metric-driven phrasing tailored to senior positions.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2.5 text-on-surface">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-semibold">
                One-Click Bullet Enhancer
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-on-surface">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm sm:text-base font-semibold">
                Tone &amp; Style Tuning
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
