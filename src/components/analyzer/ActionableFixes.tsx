"use client";

import React from "react";
import Link from "next/link";
import { ActionableFix } from "@/lib/ats-analysis";
import { Lightbulb, Edit3, ArrowRight } from "lucide-react";

interface ActionableFixesProps {
  fixes: ActionableFix[];
  resumeId?: string;
}

export function ActionableFixes({ fixes, resumeId }: ActionableFixesProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" /> Actionable Fixes & Guidance
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Concrete suggestions to improve your resume readiness and recruiter glance velocity.
          </p>
        </div>
      </div>

      {fixes.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
          <p className="text-sm font-semibold text-emerald-800">
            Outstanding Resume Completeness
          </p>
          <p className="text-xs text-emerald-700">
            No critical structural or metric defects detected. Your resume is well-prepared for application submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {fixes.map((fix) => {
            let borderClass = "border-primary";
            let badgeBg = "bg-primary-fixed text-primary";

            if (fix.impact === "High") {
              borderClass = "border-primary";
              badgeBg = "bg-primary/10 text-primary";
            } else if (fix.impact === "Medium") {
              borderClass = "border-secondary";
              badgeBg = "bg-secondary-container text-on-secondary-container";
            } else {
              borderClass = "border-outline-variant";
              badgeBg = "bg-surface-variant text-on-surface-variant";
            }

            return (
              <div
                key={fix.id}
                className={`p-4 rounded-xl bg-surface-container-low border-l-4 ${borderClass} border border-border-subtle/60 flex flex-col justify-between space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-on-surface">{fix.title}</h4>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badgeBg}`}>
                    {fix.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {fix.suggestion}
                </p>
                <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-semibold pt-1">
                  Section: {fix.category}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {resumeId ? (
        <Link
          href={`/builder?id=${encodeURIComponent(resumeId)}`}
          className="w-full mt-2 py-3 bg-surface-container-high hover:bg-secondary-container text-on-surface hover:text-primary rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-border-subtle"
        >
          <Edit3 className="w-4 h-4" />
          Edit Resume in Builder
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Link
            href="/builder"
            className="flex-1 py-2.5 px-3 bg-surface-container-high hover:bg-secondary-container text-on-surface hover:text-primary rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-border-subtle"
          >
            <Edit3 className="w-3.5 h-3.5" />
            ResumeLoops Builder
          </Link>
          <Link
            href="/ai-rewriter"
            className="flex-1 py-2.5 px-3 bg-surface-container-high hover:bg-secondary-container text-on-surface hover:text-primary rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-border-subtle"
          >
            AI Bullet Rewriter
          </Link>
        </div>
      )}
    </div>
  );
}
