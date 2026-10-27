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
    <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/40 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
        <div>
          <h4 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Previous Uploaded Analyses
          </h4>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            Saved resume document analyses in your private cloud account.
          </p>
        </div>
        <span className="font-label-xs text-label-xs font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/30">
          {analyses.length} saved
        </span>
      </div>

      <div className="divide-y divide-outline-variant/30">
        {analyses.map((item) => {
          const isActive = item.id === activeId;
          const score = item.ats_score ?? 0;
          let scoreBadgeVariant: "indigo" | "success" | "warning" | "neutral" = "neutral";
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
              className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors rounded-lg px-2 ${
                isActive ? "bg-surface-container border border-outline-variant/60 shadow-2xs" : "hover:bg-surface-container-low"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-surface-container text-on-surface border border-outline-variant/30 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-secondary" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-title-md text-body-sm font-semibold text-on-surface truncate block max-w-xs sm:max-w-md">
                      {item.file_name}
                    </span>
                    <Badge variant={scoreBadgeVariant}>
                      {score}/100 ATS
                    </Badge>
                    {item.analysis_results?.jobMatch && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-on-surface border border-outline-variant/30">
                        {item.analysis_results.jobMatch.matchPercentage}% Job Match
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-label-xs font-label-xs text-on-surface-variant mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-secondary" />
                      {formattedDate}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{formatFileSize(item.file_size_bytes)}</span>
                    {item.job_description && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">Requisition Target</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Button
                  type="button"
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onSelectAnalysis(item)}
                  className="text-xs"
                  aria-label={`View analysis for ${item.file_name}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {isActive ? "Viewing" : "View"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteAnalysis(item.id)}
                  disabled={isDeletingId === item.id}
                  className="text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                  aria-label={`Delete saved analysis for ${item.file_name}`}
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
