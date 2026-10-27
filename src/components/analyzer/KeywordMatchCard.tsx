"use client";

import React from "react";
import { JobMatchResult } from "@/lib/ats-analysis";
import { Check, Info, AlertCircle, Plus } from "lucide-react";

interface KeywordMatchCardProps {
  jobMatch: JobMatchResult | null;
  targetRole?: string;
}

export function KeywordMatchCard({ jobMatch, targetRole }: KeywordMatchCardProps) {
  if (!jobMatch) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/40 shadow-xs flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
          <Info className="w-5 h-5" />
        </div>
        <h4 className="font-title-md text-title-md text-on-surface">Target Keyword Match Withheld</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md leading-relaxed">
          Supply a target job requisition or job description to extract domain competencies and compute verifiable keyword alignment.
        </p>
      </div>
    );
  }

  const { matchPercentage, matchedCount, totalKeywordsAnalyzed, matchedKeywords, missingKeywords } =
    jobMatch;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/40 shadow-xs flex flex-col gap-space-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-xs text-label-xs uppercase tracking-wider bg-surface-container text-on-surface px-2 py-0.5 rounded font-mono font-semibold">
              {matchPercentage}% Semantic Match
            </span>
            {targetRole && (
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-xs">
                Target: <strong className="text-on-surface">{targetRole}</strong>
              </span>
            )}
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Domain Keyword Alignment</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Frequency and occurrence of key architectural terms extracted from the requisition.
          </p>
        </div>

        <span className="font-label-xs text-label-xs font-mono text-on-surface bg-surface-container px-3 py-1 rounded-full self-start sm:self-auto border border-outline-variant/30">
          {matchedCount} of {totalKeywordsAnalyzed} Matched
        </span>
      </div>

      {/* Matched keywords list */}
      <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
        {matchedKeywords.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant italic py-2">
            No extracted keywords from the target requisition were detected in the current text.
          </p>
        ) : (
          matchedKeywords.map((item) => (
            <div key={item.term} className="flex flex-col gap-1 p-2 bg-surface-container-low rounded border border-outline-variant/30">
              <div className="flex items-center justify-between text-body-sm font-body-sm">
                <span className="text-on-surface font-semibold flex items-center gap-1.5 capitalize">
                  <Check className="w-3.5 h-3.5 text-[#276a45]" />
                  {item.term}
                </span>
                <span className="font-label-xs text-label-xs font-mono text-on-surface-variant">
                  {item.count} {item.count === 1 ? "mention" : "mentions"}
                </span>
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-on-surface rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Missing Keywords Section */}
      {missingKeywords.length > 0 && (
        <div className="pt-3 border-t border-outline-variant/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold">
                Missing Target Keywords
              </span>
            </div>
            <span className="font-label-xs text-label-xs text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {missingKeywords.length} Priority Deficits
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            These terms frequently appear in requisitions matching your target profile:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {missingKeywords.map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/40 font-body-sm text-body-sm text-on-surface flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-secondary" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
