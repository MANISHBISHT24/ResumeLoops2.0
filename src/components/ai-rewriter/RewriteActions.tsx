"use client";

import React, { useState } from "react";
import { ProposalState } from "@/types/ai-rewriter";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  Copy,
  CheckCheck,
  RefreshCw,
} from "lucide-react";

interface RewriteActionsProps {
  proposal: ProposalState | null;
  isLoading: boolean;
  canGenerate: boolean;
  isStale: boolean;
  onGenerate: () => void;
  onApply: () => void;
  onReject: () => void;
  onUndo: () => void;
}

export function RewriteActions({
  proposal,
  isLoading,
  canGenerate,
  isStale,
  onGenerate,
  onApply,
  onReject,
  onUndo,
}: RewriteActionsProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    if (!proposal?.proposedText) return;
    try {
      await navigator.clipboard.writeText(proposal.proposedText);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle">
      <div className="flex items-center gap-2">
        {!proposal ? (
          <Button
            variant="primary"
            size="md"
            onClick={onGenerate}
            disabled={!canGenerate || isLoading}
            className="text-xs font-bold shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Generating Rewrite...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Generate AI Rewrite
              </>
            )}
          </Button>
        ) : (
          <>
            {!proposal.applied ? (
              <Button
                variant="primary"
                size="md"
                onClick={onApply}
                disabled={isLoading || isStale}
                className="text-xs font-bold shadow-sm"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Apply Rewrite to Resume
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={onUndo}
                className="text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Undo & Restore Original
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={onGenerate}
              disabled={isLoading || !canGenerate}
              className="text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Rewrite Again
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={onReject}
              disabled={isLoading}
              className="text-xs text-on-surface-variant hover:text-error"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Discard Proposal
            </Button>
          </>
        )}
      </div>

      {proposal && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs font-medium"
          >
            {copied ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Copied!
              </>
            ) : copyFailed ? (
              <>
                <X className="w-3.5 h-3.5 mr-1.5 text-error" />
                <span className="text-error">Copy Failed</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Output
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
