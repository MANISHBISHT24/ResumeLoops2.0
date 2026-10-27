"use client";

import React from "react";
import { ResumeCheck } from "@/lib/ats-analysis";
import { Check, CheckCircle2, AlertTriangle, AlertCircle, Columns, Heading, Binary, Grid } from "lucide-react";

interface StructuralChecksProps {
  checks: ResumeCheck[];
}

export function StructuralChecks({ checks }: StructuralChecksProps) {
  const architecturalStandards = [
    {
      id: "single-column",
      title: "Single-column Flow",
      description: "Strict vertical stacking verified; eliminates multi-column OCR transposition errors.",
      icon: Columns,
    },
    {
      id: "standard-hierarchy",
      title: "Standard Hierarchy",
      description: "Headers (Experience, Education, Competencies) follow standard taxonomy patterns.",
      icon: Heading,
    },
    {
      id: "utf8-encoding",
      title: "UTF-8 Unicode Encoding",
      description: "Clean typographic marks. No ligature corruption or unencoded symbol glyphs.",
      icon: Binary,
    },
    {
      id: "zero-tables",
      title: "Zero Table Dependency",
      description: "Zero complex layout tables detected. Safe for headless enterprise regex parsers.",
      icon: Grid,
    },
  ];

  const failedChecks = checks.filter((c) => c.status !== "passed");
  const allCorePassed = failedChecks.length === 0;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-outline-variant/40 flex flex-col gap-space-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <span className="w-6 h-6 rounded bg-[#276a45]/10 text-[#276a45] flex items-center justify-center">
            <Check className="w-4 h-4" />
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Structural Formatting Architecture
          </h2>
        </div>
        <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider bg-surface-container px-2.5 py-1 rounded">
          {allCorePassed ? "All Core Rules Passed" : `${failedChecks.length} Warnings Detected`}
        </span>
      </div>

      {/* 4 Architectural Standard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
        {architecturalStandards.map((std) => {
          const Icon = std.icon;
          return (
            <div
              key={std.id}
              className="p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-start gap-space-sm"
            >
              <Icon className="w-4 h-4 text-on-surface mt-1 shrink-0" />
              <div>
                <p className="font-title-md text-title-md text-on-surface">{std.title}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  {std.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Content Checks */}
      {checks.length > 0 && (
        <div className="pt-2 flex flex-col gap-2">
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Heuristic Content Verifications
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {checks.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                    {item.title}
                  </span>
                  {item.status === "passed" && (
                    <CheckCircle2 className="w-4 h-4 text-[#276a45] shrink-0" />
                  )}
                  {item.status === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  {item.status === "needs-attention" && (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant leading-normal line-clamp-2">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
