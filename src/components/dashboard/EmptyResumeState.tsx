"use client";

import React from "react";
import { FileText, Plus, RefreshCw, Sparkles } from "lucide-react";
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
    <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-border-subtle p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-secondary-container text-primary flex items-center justify-center mb-4 shadow-inner">
        <FileText className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">
        No Resumes in Local Workspace
      </h3>

      <p className="text-sm text-on-surface-variant max-w-md leading-relaxed mb-6">
        You haven&apos;t created any resume drafts yet. Start fresh with a blank ATS-optimized template or load our editorial sample resumes to explore the editor.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={onCreateClick}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create First Resume</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onLoadSamplesClick}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Load Sample Resumes</span>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs text-on-surface-variant/80">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span>Stored privately in your browser&apos;s local storage.</span>
      </div>
    </div>
  );
}
