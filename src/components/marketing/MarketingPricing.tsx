"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function MarketingPricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-24 sm:py-28 px-6 max-w-7xl mx-auto w-full" id="pricing">
      {/* Section Header */}
      <div className="flex flex-col items-center mb-12 sm:mb-16">
        <span className="text-xs uppercase tracking-widest font-bold text-primary mb-2">
          Simple Investment
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface text-center mb-4 tracking-tight">
          Transparent Pricing for Every Career Stage
        </h2>
        <p className="text-base text-on-surface-variant text-center max-w-md">
          Choose the plan that fits your job search needs. Cancel anytime.
        </p>

        {/* Billing Interval Toggle */}
        <div className="flex items-center gap-3 mt-8 bg-surface-container-low p-1.5 rounded-full border border-surface-container">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              !isAnnual
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isAnnual
                ? "bg-primary text-on-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Save 37%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly / Starter Plan */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-surface-container p-8 sm:p-10 flex flex-col justify-between transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-primary/30">
          <div>
            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
              Starter Plan
            </span>
            <div className="flex items-baseline gap-1.5 my-6">
              <span className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight">
                {isAnnual ? "$14" : "$19"}
              </span>
              <span className="text-sm text-on-surface-variant font-medium">
                / month {isAnnual && "(billed annually)"}
              </span>
            </div>
            <p className="text-sm sm:text-base text-on-surface-variant mb-8 leading-relaxed">
              Ideal for active job seekers looking to land interviews quickly.
            </p>

            <ul className="space-y-4 text-sm sm:text-base text-on-surface mb-10 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Unlimited resume &amp; cover letter edits</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Advanced ATS Compatibility Checker</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>AI Bullet Point Rewriter</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Standard PDF &amp; Word exports</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="w-full py-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-xl text-center transition-colors shadow-2xs block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Get Started
          </Link>
        </div>

        {/* Pro Annual Plan */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_20px_50px_rgba(81,69,229,0.08)] p-8 sm:p-10 flex flex-col justify-between border-2 border-primary relative">
          <div className="absolute -top-3.5 right-6 sm:right-8 bg-primary text-on-primary text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
            Most Popular
          </div>

          <div>
            <span className="text-xs text-primary uppercase tracking-widest font-bold">
              Professional Annual
            </span>
            <div className="flex items-baseline gap-1.5 my-6">
              <span className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight">
                {isAnnual ? "$12" : "$24"}
              </span>
              <span className="text-sm text-on-surface-variant font-medium">
                / month {isAnnual ? "billed annually" : "billed monthly"}
              </span>
            </div>
            <p className="text-sm sm:text-base text-on-surface-variant mb-8 leading-relaxed">
              For career professionals aiming for top-tier tech and enterprise roles.
            </p>

            <ul className="space-y-4 text-sm sm:text-base text-on-surface mb-10 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="font-semibold">Everything in Starter, plus:</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Personalized LinkedIn Profile Review</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Recruiter share links with view analytics</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Priority 24/7 AI resume assistance</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="w-full py-4 bg-primary hover:bg-primary-dark text-on-primary font-bold rounded-xl text-center transition-all shadow-[0_10px_25px_rgba(81,69,229,0.25)] hover:shadow-[0_15px_30px_rgba(81,69,229,0.35)] flex items-center justify-center gap-2 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Start Pro Access</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
