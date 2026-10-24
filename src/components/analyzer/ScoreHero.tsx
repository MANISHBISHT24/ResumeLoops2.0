"use client";

import React from "react";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { ReadinessResult } from "@/lib/ats-analysis";
import { Badge } from "@/components/ui/Badge";

interface ScoreHeroProps {
  readiness: ReadinessResult;
}

export function ScoreHero({ readiness }: ScoreHeroProps) {
  const { overallScore, scoreLevel, levelDescription, parserReadableRate, hasQuantifiedImpact } =
    readiness;

  // Calculate SVG circular stroke offset (circumference of r=54 is 2 * PI * 54 = ~339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  let strokeColor = "#5145E5"; // indigo default
  let badgeVariant: "indigo" | "success" | "warning" | "neutral" = "indigo";

  if (overallScore >= 90) {
    strokeColor = "#10B981"; // emerald
    badgeVariant = "success";
  } else if (overallScore >= 75) {
    strokeColor = "#5145E5"; // indigo
    badgeVariant = "indigo";
  } else if (overallScore >= 60) {
    strokeColor = "#F59E0B"; // amber
    badgeVariant = "warning";
  } else {
    strokeColor = "#EF4444"; // red
    badgeVariant = "neutral";
  }

  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
      {/* Subtle background glow */}
      <div
        className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-30"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex flex-col gap-3 z-10 max-w-lg text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Badge variant={badgeVariant}>Resume Readiness</Badge>
          <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Rule-Based Heuristic
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          {scoreLevel === "Exceptional" && "Exceptional ATS Alignment"}
          {scoreLevel === "Competitive" && "Competitive ATS Structure"}
          {scoreLevel === "Developing" && "Developing Resume Readiness"}
          {scoreLevel === "Needs Attention" && "Needs Structural Attention"}
        </h3>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          {levelDescription}
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-on-surface">
            <span
              className={`w-2 h-2 rounded-full ${
                parserReadableRate >= 80 ? "bg-emerald-600" : "bg-amber-500"
              }`}
            />
            <span>Parser Structure: {parserReadableRate}%</span>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface">
            {hasQuantifiedImpact ? (
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Quantified Metrics Present
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700">
                <AlertCircle className="w-3.5 h-3.5" /> Metric Depth: Low
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center shrink-0 z-10">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle
            className="text-surface-container"
            cx="72"
            cy="72"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
          />
          <circle
            cx="72"
            cy="72"
            fill="transparent"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-on-surface tracking-tighter">
            {overallScore}
          </span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest -mt-1">
            / 100
          </span>
        </div>
      </div>
    </div>
  );
}
