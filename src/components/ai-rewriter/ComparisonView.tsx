"use client";

import React, { useState } from "react";
import { ProposalState, RewriteTarget } from "@/types/ai-rewriter";
import { Sparkles, AlertTriangle, History } from "lucide-react";

interface ComparisonViewProps {
  target: RewriteTarget;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  proposal: ProposalState | null;
  isStale: boolean;
  isLoading: boolean;
}

export function ComparisonView({
  target,
  sourceText,
  onSourceTextChange,
  proposal,
  isStale,
  isLoading,
}: ComparisonViewProps) {
  const [mobileTab, setMobileTab] = useState<"original" | "proposal">("proposal");

  const sourceWords = sourceText.trim() ? sourceText.trim().split(/\s+/).filter(Boolean).length : 0;
  const proposedWords = proposal?.proposedText.trim()
    ? proposal.proposedText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-3">
      {/* Mobile view switcher */}
      <div className="flex md:hidden items-center justify-between p-1 bg-surface-container rounded-lg border border-outline-variant/40">
        <button
          type="button"
          onClick={() => setMobileTab("original")}
          className={`flex-1 py-1.5 font-label-xs text-label-xs font-semibold rounded transition-all ${
            mobileTab === "original"
              ? "bg-surface-container-lowest text-on-surface shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Original Text
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("proposal")}
          className={`flex-1 py-1.5 font-label-xs text-label-xs font-semibold rounded transition-all ${
            mobileTab === "proposal"
              ? "bg-surface-container-lowest text-on-surface shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          AI Proposal {proposal && "•"}
        </button>
      </div>

      {/* Stale Warning Banner */}
      {isStale && proposal && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Source Changed:</strong> The content for &quot;{target.label}&quot; has been modified in your resume
            since this proposal was generated. Please review and regenerate before applying.
          </p>
        </div>
      )}

      {/* Side-by-Side (Desktop) / Tabbed (Mobile) Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Text Card */}
        <div
          className={`bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col justify-between space-y-3 ${
            mobileTab === "proposal" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <History className="w-3.5 h-3.5" />
              <span className="font-label-xs text-label-xs uppercase tracking-wider font-semibold">
                Original Passage
              </span>
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant/80">
              {sourceWords} words • {sourceText.length} chars
            </span>
          </div>

          <div className="flex-1 min-h-[140px]">
            <textarea
              value={sourceText}
              onChange={(e) => onSourceTextChange(e.target.value)}
              rows={5}
              placeholder="Source text to rewrite..."
              className="w-full h-full font-body-sm text-body-sm text-on-surface bg-transparent border-0 p-0 focus:outline-none resize-y leading-relaxed"
            />
          </div>

          <div className="text-[11px] text-on-surface-variant/70 italic border-t border-outline-variant/20 pt-2 flex items-center justify-between">
            <span>Section: {target.label}</span>
            <span className="font-mono text-[10px]">Editable buffer</span>
          </div>
        </div>

        {/* AI Proposal Card */}
        <div
          className={`bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-xs flex flex-col justify-between space-y-3 ${
            mobileTab === "original" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <div className="flex items-center gap-1.5 text-on-surface">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-label-xs text-label-xs uppercase tracking-wider font-semibold">
                Refined Architecture
              </span>
            </div>
            {proposal && (
              <span className="font-mono text-[11px] text-[#276a45] font-semibold">
                {proposedWords} words • {proposal.proposedText.length} chars
              </span>
            )}
          </div>

          <div className="flex-1 min-h-[140px]">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-2 py-8 text-on-surface-variant">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="font-body-sm text-xs font-medium">Generating architectural revision...</span>
              </div>
            ) : proposal ? (
              <div className="font-body-sm text-body-sm text-on-surface leading-relaxed whitespace-pre-wrap select-text">
                {proposal.proposedText}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-on-surface-variant/60 space-y-1">
                <Sparkles className="w-5 h-5 text-secondary mx-auto mb-1" />
                <p className="font-body-sm text-xs">No proposal generated yet</p>
                <p className="text-[11px] text-on-surface-variant/60 max-w-xs">
                  Choose an objective below and click &quot;Generate Rewrite&quot; to inspect the revision.
                </p>
              </div>
            )}
          </div>

          {proposal && (
            <div className="space-y-2 border-t border-outline-variant/30 pt-2">
              <div className="p-2.5 rounded bg-surface-container-low text-[12px] text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
                  Factual Integrity Guarantee:
                </strong>
                The AI rewriter strictly refines tone and impact. Verify all technical metrics match your real accomplishments before applying.
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-outline-variant/30 text-[11px] text-on-surface-variant/70 flex items-center justify-between">
            <span>Changes are NOT saved until you click &quot;Apply Rewrite&quot;.</span>
            {proposal?.previousText && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <History className="w-3 h-3" /> Previous version available
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
