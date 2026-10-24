"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Check } from "lucide-react";

interface TemplateItem {
  id: string;
  title: string;
  category: "all" | "executive" | "tech" | "creative";
  categoryLabel: string;
  description: string;
  badge: string;
  fontType: string;
  accentColor: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "editorial-classic",
    title: "The Editorial Classic",
    category: "executive",
    categoryLabel: "Executive & Academic",
    description: "Timeless Serif headers suited for executive, legal, and academic roles.",
    badge: "ATS 99% Verified",
    fontType: "Serif & Classic Geometry",
    accentColor: "border-primary/40",
  },
  {
    id: "silicon-modern",
    title: "Silicon Modern",
    category: "tech",
    categoryLabel: "Tech & Product",
    description: "Clean sans-serif design optimized for software engineers and product managers.",
    badge: "Fast Parser Compliant",
    fontType: "Inter Sans-Serif",
    accentColor: "border-primary",
  },
  {
    id: "vanguard-creative",
    title: "Vanguard Creative",
    category: "creative",
    categoryLabel: "Creative & Design",
    description: "Asymmetric accents crafted for designers, writers, and creative directors.",
    badge: "Portfolio Ready",
    fontType: "Display & Editorial Grid",
    accentColor: "border-secondary",
  },
];

export function MarketingTemplates() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredTemplates =
    activeCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto w-full" id="templates">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-primary mb-2 block">
            Curated Layouts
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
            Designed for Maximum Readability
          </h2>
        </div>
        <p className="text-base text-on-surface-variant max-w-md leading-relaxed">
          Choose from our collection of ATS-friendly, publication-quality resume templates crafted by top typographic designers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 border-b border-surface-container">
        {[
          { id: "all", label: "All Layouts" },
          { id: "executive", label: "Executive & Academic" },
          { id: "tech", label: "Tech & Product" },
          { id: "creative", label: "Creative & Design" },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="group bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-surface-container hover:border-primary/40 transition-all duration-300 p-5 flex flex-col gap-4 relative"
          >
            {/* Template Visual Miniature */}
            <div className="w-full h-80 rounded-xl bg-warm-ivory border border-surface-container-high/80 overflow-hidden relative shadow-inner p-5 flex flex-col justify-between">
              {/* Header Miniature Mockup */}
              <div className="space-y-3">
                <div className="flex items-start justify-between pb-2 border-b border-surface-container-high">
                  <div className="space-y-1">
                    <div className="h-3.5 bg-neutral-800 rounded w-28" />
                    <div className="h-2 bg-neutral-400 rounded w-36" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                    {template.fontType}
                  </span>
                </div>

                {/* Section 1 */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-2 bg-primary/70 rounded w-16" />
                  <div className="h-1.5 bg-neutral-300 rounded w-full" />
                  <div className="h-1.5 bg-neutral-300 rounded w-5/6" />
                </div>

                {/* Section 2 */}
                <div className="space-y-1.5 pt-2">
                  <div className="h-2 bg-primary/70 rounded w-20" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 bg-neutral-300 rounded w-1/3" />
                    <div className="h-1.5 bg-neutral-200 rounded w-1/4" />
                  </div>
                  <div className="h-1.5 bg-neutral-300 rounded w-full" />
                  <div className="h-1.5 bg-neutral-300 rounded w-4/5" />
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 pt-2">
                  <div className="h-3 bg-secondary-container rounded-full px-2 w-12" />
                  <div className="h-3 bg-secondary-container rounded-full px-2 w-14" />
                  <div className="h-3 bg-secondary-container rounded-full px-2 w-10" />
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {template.badge}
                </span>
                <span className="text-[11px] font-medium text-on-surface-variant">
                  {template.categoryLabel}
                </span>
              </div>

              {/* Hover Action Overlay */}
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6">
                <Link
                  href={`/builder?template=${template.id}`}
                  className="bg-surface-container-lowest hover:bg-white text-on-surface px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Use Template</span>
                </Link>
                <Link
                  href="/templates"
                  className="text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary-dark transition-colors"
                >
                  View in Catalog
                </Link>
              </div>
            </div>

            {/* Template Information */}
            <div className="px-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-on-surface text-lg">
                  {template.title}
                </h3>
                <span className="text-xs text-primary font-semibold">
                  Preview
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Catalog Link */}
      <div className="mt-12 text-center">
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors group"
        >
          <span>Explore All 12+ Publication-Quality Layouts</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
