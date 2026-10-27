"use client";

import React from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface EmptyResumeStateProps {
  onCreateClick: () => void;
  onLoadSamplesClick: () => void;
}

export function EmptyResumeState({
  onCreateClick,
  onLoadSamplesClick,
}: EmptyResumeStateProps) {
  return (
    <div className="bg-surface-container-low rounded border border-dashed border-border-subtle p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6">
      <div className="w-12 h-12 rounded bg-surface-container-lowest text-on-surface flex items-center justify-center mb-4 shadow-xs border border-border-subtle">
        <FileText className="w-6 h-6 text-on-surface-variant" />
      </div>

      <h3 className="font-headline-sm text-lg sm:text-xl font-semibold text-on-surface mb-2">
        No documents in your workspace
      </h3>

      <p className="font-body-sm text-sm text-on-surface-variant max-w-md leading-relaxed mb-6">
        You haven&apos;t created any resume documents yet. Author a new resume from our curated formats or load demonstration fixtures to explore the studio.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={onCreateClick}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create new resume</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onLoadSamplesClick}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Load demo sample resumes</span>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs text-on-surface-variant">
        <span>Archival 120gsm specification • Local &amp; cloud storage supported</span>
      </div>
    </div>
  );
}
