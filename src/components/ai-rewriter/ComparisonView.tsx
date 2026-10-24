"use client";

import React, { useState } from "react";
import { ProposalState, RewriteTarget } from "@/types/ai-rewriter";
import { Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, History } from "lucide-react";

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
      <div className="flex md:hidden items-center justify-between p-1 bg-surface-container rounded-xl border border-border-subtle">
        <button
          type="button"
          onClick={() => setMobileTab("original")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === "original"
              ? "bg-surface text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Original Text
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("proposal")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            mobileTab === "proposal"
              ? "bg-surface text-primary shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          AI Proposal {proposal && "•"}
        </button>
      </div>

      {/* Stale Warning Banner */}
      {isStale && proposal && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
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
          className={`bg-surface-container-low rounded-2xl p-5 border border-border-subtle flex flex-col justify-between space-y-3 ${
            mobileTab === "proposal" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60">
            <div>
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Source Content
              </span>
              <span className="text-xs font-semibold text-on-surface truncate block max-w-[200px] sm:max-w-xs">
                {target.label}
              </span>
            </div>
            <span className="text-[11px] font-medium text-on-surface-variant/70">
              {sourceWords} words • {sourceText.length} chars
            </span>
          </div>

          <div className="flex-1 min-h-[140px]">
            <textarea
              value={sourceText}
              onChange={(e) => onSourceTextChange(e.target.value)}
              rows={5}
              placeholder="Source text to rewrite..."
              className="w-full h-full text-xs sm:text-sm font-normal text-on-surface bg-transparent border-0 p-0 focus:outline-none focus:ring-0 resize-y leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-border-subtle/60 text-[11px] text-on-surface-variant/70 italic flex items-center gap-1.5">
            <span>You can fine-tune the source text directly above before sending it to the rewriter.</span>
          </div>
        </div>

        {/* Proposed Rewrite Card */}
        <div
          className={`bg-surface rounded-2xl p-5 border border-border-subtle flex flex-col justify-between space-y-3 shadow-sm ${
            mobileTab === "original" ? "hidden md:flex" : "flex"
          } ${proposal?.applied ? "ring-2 ring-emerald-500/30" : ""}`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                AI Suggested Rewrite
              </span>
              {proposal?.applied ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
                </span>
              ) : proposal ? (
                <span className="text-[10px] font-bold text-primary bg-secondary-container px-2 py-0.5 rounded-full">
                  Proposal Ready
                </span>
              ) : null}
            </div>

            {proposal && (
              <span className="text-[11px] font-medium text-on-surface-variant/70">
                {proposedWords} words • {proposal.proposedText.length} chars
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center space-y-3 text-center py-8">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-on-surface-variant font-medium">
                Calling OpenAI Responses API with factual integrity instructions...
              </p>
            </div>
          ) : proposal ? (
            <div className="flex-1 min-h-[140px] space-y-3">
              <div className="p-3.5 rounded-xl bg-secondary-container/30 border border-primary/20">
                <p className="text-xs sm:text-sm font-medium text-on-surface leading-relaxed">
                  {proposal.proposedText}
                </p>
              </div>

              {/* Factual Integrity Reminder */}
              <div className="p-2.5 bg-surface-container-low rounded-lg border border-border-subtle/80 flex items-start gap-2 text-[11px] text-on-surface-variant">
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Factual Integrity Guarantee:</strong> The AI rewriter strictly refines wording and structure.
                  Always verify that technical metrics and responsibilities match your real background before applying.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center space-y-2 text-center py-8 text-on-surface-variant">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-on-surface">No Proposal Generated Yet</p>
              <p className="text-[11px] max-w-xs text-on-surface-variant/80">
                Choose your rewrite objective and optional job description, then click &quot;Generate AI Rewrite&quot;.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-border-subtle/60 text-[11px] text-on-surface-variant/70 flex items-center justify-between">
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
