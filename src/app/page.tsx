import React from "react";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingTemplates } from "@/components/marketing/MarketingTemplates";
import { MarketingProcess } from "@/components/marketing/MarketingProcess";
import { MarketingFeatures } from "@/components/marketing/MarketingFeatures";
import { MarketingComparison } from "@/components/marketing/MarketingComparison";
import { MarketingPricing } from "@/components/marketing/MarketingPricing";
import { MarketingFaq } from "@/components/marketing/MarketingFaq";
import { MarketingCtaBanner } from "@/components/marketing/MarketingCtaBanner";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: "ResumeLoops — AI Resume Builder & ATS Intelligence",
  description:
    "Create publication-quality resumes with deterministic ATS compatibility scoring, AI bullet point tailoring, and curated editorial layouts.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-on-surface">
      {/* Canonical Marketing Header */}
      <MarketingHeader />

      {/* Main Landing Page Content */}
      <main className="w-full pt-20 bg-warm-ivory min-h-screen flex-1">
        {/* 1. Hero Section */}
        <MarketingHero />

        {/* 2. Curated Templates Grid */}
        <MarketingTemplates />

        {/* 3. 3-Step Process / Workflow */}
        <div id="how-it-works">
          <MarketingProcess />
        </div>

        {/* 4. Product Feature Showcase */}
        <MarketingFeatures />

        {/* 5. Before & After Transformation */}
        <MarketingComparison />

        {/* 6. Transparent Pricing */}
        <MarketingPricing />

        {/* 7. FAQ Accordion */}
        <MarketingFaq />

        {/* 8. Conversion Banner */}
        <MarketingCtaBanner />
      </main>

      {/* Canonical Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
