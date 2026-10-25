"use client";

import React from "react";
import { FileText, Trash2, Calendar, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { UploadedResumeAnalysis } from "@/lib/uploaded-analysis-service";
import { formatFileSize } from "./ResumeUploadDropzone";

interface UploadedHistoryListProps {
  analyses: UploadedResumeAnalysis[];
  activeId?: string;
  onSelectAnalysis: (analysis: UploadedResumeAnalysis) => void;
  onDeleteAnalysis: (id: string) => Promise<void>;
  isDeletingId?: string | null;
}

export function UploadedHistoryList({
  analyses,
  activeId,
  onSelectAnalysis,
  onDeleteAnalysis,
  isDeletingId,
}: UploadedHistoryListProps) {
  if (analyses.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Previous Uploaded Analyses
          </h4>
          <p className="text-xs text-on-surface-variant">
            Saved resume document analyses in your private cloud account.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
          {analyses.length} {analyses.length === 1 ? "saved" : "saved"}
        </span>
      </div>

      <div className="divide-y divide-border-subtle/60">
        {analyses.map((item) => {
          const isActive = item.id === activeId;
          const score = item.ats_score ?? 0;
          let scoreBadgeVariant: "indigo" | "success" | "warning" | "neutral" = "indigo";
          if (score >= 90) scoreBadgeVariant = "success";
          else if (score >= 75) scoreBadgeVariant = "indigo";
          else if (score >= 60) scoreBadgeVariant = "warning";
          else scoreBadgeVariant = "neutral";

          const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={item.id}
              className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors rounded-xl px-2.5 ${
                isActive ? "bg-primary/5 border border-primary/20" : "hover:bg-surface-container-low/60"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs sm:text-sm text-on-surface truncate block max-w-xs sm:max-w-md">
                      {item.file_name}
                    </span>
                    <Badge variant={scoreBadgeVariant}>
                      {score}/100 ATS
                    </Badge>
                    {item.analysis_results?.jobMatch && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {item.analysis_results.jobMatch.matchPercentage}% Job Match
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-on-surface-variant/70" />
                      {formattedDate}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(item.file_size_bytes)}</span>
                    {item.job_description && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">Job Targeted</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  type="button"
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onSelectAnalysis(item)}
                  className="text-xs"
                  aria-label={`View analysis for ${item.file_name}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {isActive ? "Active View" : "View"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteAnalysis(item.id)}
                  disabled={isDeletingId === item.id}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label={`Delete analysis for ${item.file_name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
