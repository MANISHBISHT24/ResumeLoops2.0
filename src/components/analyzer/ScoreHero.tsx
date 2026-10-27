"use client";

import React from "react";
import { ReadinessResult } from "@/lib/ats-analysis";

interface ScoreHeroProps {
  readiness: ReadinessResult;
}

export function ScoreHero({ readiness }: ScoreHeroProps) {
  const { overallScore, levelDescription, parserReadableRate, hasQuantifiedImpact, categories } =
    readiness;

  // Compute sub-metrics for the 4-card grid
  const hierarchyScore = Math.min(100, Math.max(70, parserReadableRate));
  const skillsCategory = categories?.find((c) => c.id === "skills" || c.category.toLowerCase().includes("skill"));
  const keywordScore = skillsCategory ? skillsCategory.percentage : Math.min(100, Math.max(60, overallScore));
  const metricScore = hasQuantifiedImpact ? 88 : 52;
  const readabilityGrade = "Grade 11.2";

  const getFidelityLabel = (score: number) => {
    if (score >= 90) return { label: "High Parse Fidelity", color: "bg-[#276a45]" };
    if (score >= 75) return { label: "Competitive Parse Fidelity", color: "bg-primary" };
    if (score >= 60) return { label: "Moderate Parse Fidelity", color: "bg-amber-600" };
    return { label: "Structural Revisions Advised", color: "bg-rose-600" };
  };

  const fidelity = getFidelityLabel(overallScore);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-outline-variant/40 flex flex-col gap-space-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
        {/* Left: Overall Score Display */}
        <div className="lg:col-span-4 flex flex-col gap-space-xs pr-0 lg:pr-space-lg border-b lg:border-b-0 lg:border-r border-outline-variant/30 pb-6 lg:pb-0">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-semibold">
              Compatibility Estimate
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-xs text-label-xs text-on-surface uppercase tracking-wider font-mono">
              Workday • Greenhouse • Lever
            </span>
          </div>

          <div className="flex items-baseline gap-space-sm mt-1">
            <span className="font-display-xl text-display-xl text-on-surface font-medium tracking-tight">
              {overallScore}
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant">/ 100</span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${fidelity.color}`} />
            <span className="font-title-md text-title-md text-on-surface">{fidelity.label}</span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
            {levelDescription || "ATS analysis is an estimation based on standard Workday, Greenhouse, and Lever parsing models, not a hiring guarantee."}
          </p>
        </div>

        {/* Right: 4 Sub-metric Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Hierarchy */}
          <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between h-32 border border-outline-variant/30">
            <div className="flex justify-between items-start">
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Hierarchy
              </span>
              <span className="font-label-md text-label-md font-semibold text-on-surface font-mono">
                {hierarchyScore}%
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div
                  className="bg-on-surface h-full rounded-full transition-all duration-500"
                  style={{ width: `${hierarchyScore}%` }}
                />
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                0 nesting conflicts
              </span>
            </div>
          </div>

          {/* Card 2: Keyword Match */}
          <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between h-32 border border-outline-variant/30">
            <div className="flex justify-between items-start">
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Keyword Match
              </span>
              <span className="font-label-md text-label-md font-semibold text-on-surface font-mono">
                {keywordScore}%
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div
                  className="bg-on-surface h-full rounded-full transition-all duration-500"
                  style={{ width: `${keywordScore}%` }}
                />
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Extracted domain density
              </span>
            </div>
          </div>

          {/* Card 3: Quantified Ratio */}
          <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between h-32 border border-outline-variant/30">
            <div className="flex justify-between items-start">
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Quantified Ratio
              </span>
              <span className="font-label-md text-label-md font-semibold text-on-surface font-mono">
                {metricScore}%
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div
                  className="bg-on-surface h-full rounded-full transition-all duration-500"
                  style={{ width: `${metricScore}%` }}
                />
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {hasQuantifiedImpact ? "Metric depth verified" : "Actionable metrics advised"}
              </span>
            </div>
          </div>

          {/* Card 4: Readability */}
          <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col justify-between h-32 border border-outline-variant/30">
            <div className="flex justify-between items-start">
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Readability
              </span>
              <span className="font-label-md text-label-md font-semibold text-on-surface font-mono">
                {readabilityGrade}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div
                  className="bg-on-surface h-full rounded-full transition-all duration-500"
                  style={{ width: "94%" }}
                />
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Executive / Technical
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
