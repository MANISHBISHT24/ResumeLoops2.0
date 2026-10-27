"use client";

import React from "react";
import Link from "next/link";
import { ActionableFix } from "@/lib/ats-analysis";
import { Sparkles, Edit3, ArrowRight, CheckCircle2 } from "lucide-react";

interface ActionableFixesProps {
  fixes: ActionableFix[];
  resumeId?: string;
}

export function ActionableFixes({ fixes, resumeId }: ActionableFixesProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/40 shadow-xs flex flex-col gap-space-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> High-Value Diagnostic Opportunities
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Concrete structural suggestions to elevate parse fidelity and human readability.
          </p>
        </div>
      </div>

      {fixes.length === 0 ? (
        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-[#276a45] mx-auto mb-1" />
          <p className="font-title-md text-title-md text-on-surface">
            Outstanding Architectural Completeness
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
            Zero critical structural or metric defects detected. Your document is well-prepared for executive screening.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {fixes.map((fix) => {
            const isHigh = fix.impact === "High";
            return (
              <div
                key={fix.id}
                className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-title-md text-body-sm text-on-surface font-semibold">{fix.title}</h4>
                  <span
                    className={`font-label-xs text-label-xs font-mono px-2 py-0.5 rounded border ${
                      isHigh
                        ? "bg-primary text-white border-primary"
                        : "bg-surface-container text-on-surface border-outline-variant/40"
                    }`}
                  >
                    {fix.impact} Priority
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {fix.suggestion}
                </p>
                <span className="font-label-xs text-label-xs text-on-surface-variant/70 uppercase tracking-wider font-semibold pt-0.5">
                  Scope: {fix.category}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Bullet Revision Pattern */}
      <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 flex flex-col gap-1.5">
        <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold">
          Recommended Bullet Structure
        </span>
        <code className="text-body-sm font-mono text-on-surface bg-surface-container-lowest p-2 rounded border border-outline-variant/30">
          [Action verb] + [Project scope] + [Quantified delta]
        </code>
      </div>

      {resumeId ? (
        <Link
          href={`/builder?id=${encodeURIComponent(resumeId)}`}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          <span>Apply Changes in Live Editor</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Link>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Link
            href="/builder"
            className="flex-1 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 border border-outline-variant/30"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Open Builder</span>
          </Link>
          <Link
            href="/ai-rewriter"
            className="flex-1 py-2 px-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open AI Rewriter</span>
          </Link>
        </div>
      )}
    </div>
  );
}
