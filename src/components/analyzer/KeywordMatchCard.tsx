"use client";

import React from "react";
import { JobMatchResult } from "@/lib/ats-analysis";
import { Plus, Check, Info, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface KeywordMatchCardProps {
  jobMatch: JobMatchResult | null;
  targetRole?: string;
}

export function KeywordMatchCard({ jobMatch, targetRole }: KeywordMatchCardProps) {
  if (!jobMatch) {
    return (
      <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-sm flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary">
          <Info className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-on-surface">Job Match Score Withheld</h4>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
          Provide a job description above to extract relevant domain keywords and calculate a
          transparent keyword alignment match against your resume.
        </p>
      </div>
    );
  }

  const { matchPercentage, matchedCount, totalKeywordsAnalyzed, matchedKeywords, missingKeywords } =
    jobMatch;

  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={matchPercentage >= 75 ? "success" : matchPercentage >= 50 ? "warning" : "neutral"}>
              {matchPercentage}% Keyword Alignment
            </Badge>
            {targetRole && (
              <span className="text-xs text-on-surface-variant font-medium truncate max-w-xs">
                Targeting: <strong className="text-on-surface">{targetRole}</strong>
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-on-surface">Keyword Match Breakdown</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Frequency and occurrence of key terms extracted from the supplied job description.
          </p>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold self-start sm:self-auto">
          {matchedCount} / {totalKeywordsAnalyzed} Matched
        </span>
      </div>

      {/* Matched keywords list */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {matchedKeywords.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic py-2">
            No extracted keywords from the job description were found in the current resume.
          </p>
        ) : (
          matchedKeywords.map((item) => (
            <div key={item.term} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-on-surface capitalize font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {item.term}
                </span>
                <span
                  className={
                    item.matchStrength === "high"
                      ? "text-emerald-700 font-semibold"
                      : "text-primary font-medium"
                  }
                >
                  {item.matchStrength === "high"
                    ? `Strong Match (${item.count} mentions)`
                    : `Matched (${item.count} ${item.count === 1 ? "mention" : "mentions"})`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.matchStrength === "high" ? "bg-emerald-600" : "bg-primary"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Missing Keywords Section */}
      {missingKeywords.length > 0 && (
        <div className="pt-4 border-t border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Missing Keywords from Job Posting ({missingKeywords.length}):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((term) => (
              <span
                key={term}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200/60 rounded-lg text-xs font-medium"
              >
                <Plus className="w-3 h-3 text-rose-600" />
                <span className="capitalize">{term}</span>
              </span>
            ))}
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-border-subtle flex items-start gap-2 text-xs text-on-surface-variant">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Ethical Notice:</strong> Consider incorporating missing terms into your summary, experience,
              or skills <em>only if they genuinely represent your real qualifications and project background</em>.
              Never fabricate skills to game keyword filters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
