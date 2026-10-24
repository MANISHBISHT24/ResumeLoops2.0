import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function MarketingCtaBanner() {
  return (
    <section className="py-20 sm:py-24 px-6 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-slate-900 text-on-primary p-8 sm:p-14 lg:p-16 shadow-[0_25px_60px_rgba(81,69,229,0.35)] flex flex-col items-center text-center">
        {/* Ambient radial highlights */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
            <span>Start Building in Seconds</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to elevate your resume and land more interviews?
          </h2>

          <p className="text-base sm:text-lg text-white/85 max-w-xl leading-relaxed">
            Join thousands of professionals crafting publication-grade, ATS-optimized resumes that stand out to senior hiring managers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="bg-white hover:bg-neutral-50 text-neutral-900 font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
            >
              <span>Create My Resume Now</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </Link>

            <Link
              href="/templates"
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-8 py-4 rounded-xl transition-all text-sm sm:text-base backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
