"use client";

import React from "react";
import { Textarea } from "@/components/ui/Textarea";

export interface SummaryFormProps {
  summary: string;
  onChange: (updated: string) => void;
}

export function SummaryForm({ summary, onChange }: SummaryFormProps) {
  const words = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  const characters = summary.length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-on-surface">Professional Summary</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          A 2–4 sentence high-impact narrative highlighting your core strengths, quantifiable achievements, and leadership philosophy.
        </p>
      </div>

      <Textarea
        label="Executive Summary"
        rows={6}
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Results-driven Staff Engineer with 8+ years of expertise designing high-throughput distributed architectures, lowering cloud infrastructural overhead by 42%..."
        helperText="ATS parsers scan your executive summary for key seniority markers and leadership keywords."
      />

      <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono pt-1">
        <span>{words} words • {characters} characters</span>
        <span className={words >= 30 && words <= 75 ? "text-emerald-600 font-semibold" : ""}>
          {words < 30 ? "Recommended: 35–60 words" : words <= 75 ? "Optimal length" : "Long summary"}
        </span>
      </div>
    </div>
  );
}
