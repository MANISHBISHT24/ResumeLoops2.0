import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, Lightbulb, FileCheck2 } from "lucide-react";

export function MarketingHero() {
  return (
    <section className="relative pt-12 sm:pt-16 pb-20 sm:pb-24 px-6 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Ambient glow background elements */}
      <div
        className="absolute top-1/4 right-10 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-primary/10 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-6 w-64 sm:w-96 h-64 sm:h-96 bg-secondary-container/40 rounded-full blur-[90px] sm:blur-[100px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-6 flex flex-col items-start gap-6 z-10">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/80 backdrop-blur-sm text-on-secondary-container text-xs sm:text-sm font-medium border border-primary/20 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Powered by Advanced ATS Intelligence</span>
          </div>

          {/* Display Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.12]">
            Your Next Opportunity Starts With a Better Resume.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Create a compelling resume, understand your ATS compatibility, and tailor your experience to the roles you want with editorial precision.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="relative group bg-primary hover:bg-primary-dark text-on-primary font-bold px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-[0_10px_30px_rgba(81,69,229,0.25)] hover:shadow-[0_15px_35px_rgba(81,69,229,0.35)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <span className="tracking-wide">Create My Resume</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#templates"
              className="bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface font-semibold px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all shadow-xs hover:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Explore Templates
            </a>
          </div>

          {/* Social Proof Metric / Quality Endorsement */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-surface-container-high/80 w-full mt-2">
            <div className="flex -space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-xs border-2 border-warm-ivory shadow-sm">
                AL
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs border-2 border-warm-ivory shadow-sm">
                MR
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 text-white flex items-center justify-center font-bold text-xs border-2 border-warm-ivory shadow-sm">
                EK
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs border-2 border-warm-ivory shadow-sm">
                JP
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-0.5" aria-label="Rated 5 out of 5 stars">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">
                Built for ambitious professionals targeting high-impact tech &amp; leadership roles
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Layered Product Composition */}
        <div className="lg:col-span-6 relative flex justify-center items-center py-6 sm:py-8">
          {/* Main Mockup Card Surface */}
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-surface-container-high/80 p-5 sm:p-7 relative flex flex-col gap-4 backdrop-blur-xl">
            {/* Mock Resume Header inside preview */}
            <div className="flex items-center justify-between pb-4 bg-surface-container-low p-4 rounded-xl border border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                  AL
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Alex Lawson</h3>
                  <p className="text-xs text-on-surface-variant font-medium">Senior Product Designer</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-primary rounded-full text-xs font-semibold shadow-2xs">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>PDF Ready</span>
              </span>
            </div>

            {/* Mock Experience entries */}
            <div className="space-y-2.5 p-3.5 bg-surface-container-low/50 rounded-xl border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="h-3.5 bg-surface-container-high rounded-full w-2/5" />
                <div className="h-2.5 bg-surface-container rounded-full w-16" />
              </div>
              <div className="h-2.5 bg-surface-container rounded-full w-full" />
              <div className="h-2.5 bg-surface-container rounded-full w-5/6" />
            </div>

            <div className="space-y-2.5 p-3.5 bg-surface-container-low/50 rounded-xl border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="h-3.5 bg-surface-container-high rounded-full w-1/2" />
                <div className="h-2.5 bg-surface-container rounded-full w-14" />
              </div>
              <div className="h-2.5 bg-surface-container rounded-full w-full" />
            </div>

            {/* Floating ATS Score Card */}
            <div className="absolute -top-6 -left-2 sm:-left-6 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-3.5 sm:p-4 flex items-center gap-3.5 border border-surface-container-high">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black text-xl shadow-md shadow-primary/25">
                96
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant block">
                  ATS Compatibility
                </span>
                <p className="text-sm sm:text-base font-bold text-on-surface">
                  Optimized Score
                </p>
              </div>
            </div>

            {/* Floating AI Suggestion Card */}
            <div className="absolute -bottom-6 -right-2 sm:-right-4 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-3.5 sm:p-4 max-w-[260px] sm:max-w-xs border border-surface-container-high flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-primary">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Keyword Match</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Added <strong className="text-on-surface font-semibold">&apos;Design Systems&apos;</strong> &amp; <strong className="text-on-surface font-semibold">&apos;Cross-functional Leadership&apos;</strong> seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
