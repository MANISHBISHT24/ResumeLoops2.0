"use client";

import React from "react";
import { RewriteTarget } from "@/types/ai-rewriter";
import { Target } from "lucide-react";

interface TargetSelectorProps {
  targets: RewriteTarget[];
  selectedKey: string;
  onSelectKey: (key: string) => void;
  disabled?: boolean;
}

export function TargetSelector({
  targets,
  selectedKey,
  onSelectKey,
  disabled,
}: TargetSelectorProps) {
  // Group targets for clear UX
  const headlines = targets.filter((t) => t.sectionType === "headline");
  const summaries = targets.filter((t) => t.sectionType === "summary");
  const bullets = targets.filter((t) => t.sectionType === "experience-bullet");
  const projects = targets.filter((t) => t.sectionType === "project-description");

  return (
    <div className="space-y-1.5">
      <label className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-secondary" />
          <span>Target Field to Refine</span>
        </span>
        <span className="font-mono text-[11px] font-normal text-on-surface-variant/70">
          {targets.length} editable {targets.length === 1 ? "field" : "fields"}
        </span>
      </label>

      <div className="relative">
        <select
          value={selectedKey}
          onChange={(e) => onSelectKey(e.target.value)}
          disabled={disabled || targets.length === 0}
          className="w-full font-body-sm text-body-sm font-semibold bg-surface-container-low border border-outline-variant/40 rounded p-2.5 text-on-surface hover:border-on-surface focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Select resume section to rewrite"
        >
          {headlines.length > 0 && (
            <optgroup label="Personal Details & Identity">
              {headlines.map((t) => (
                <option key={t.targetKey} value={t.targetKey}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          )}

          {summaries.length > 0 && (
            <optgroup label="Professional Summary">
              {summaries.map((t) => (
                <option key={t.targetKey} value={t.targetKey}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          )}

          {bullets.length > 0 && (
            <optgroup label="Work Experience Achievements">
              {bullets.map((t) => (
                <option key={t.targetKey} value={t.targetKey}>
                  {t.label} — {t.originalText.slice(0, 45)}...
                </option>
              ))}
            </optgroup>
          )}

          {projects.length > 0 && (
            <optgroup label="Projects">
              {projects.map((t) => (
                <option key={t.targetKey} value={t.targetKey}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
    </div>
  );
}
