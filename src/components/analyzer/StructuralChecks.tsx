"use client";

import React from "react";
import { ResumeCheck } from "@/lib/ats-analysis";
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";

interface StructuralChecksProps {
  checks: ResumeCheck[];
}

export function StructuralChecks({ checks }: StructuralChecksProps) {
  // Built-in design system template specifications
  const templateConventions = [
    {
      id: "std-layout",
      title: "Single-Column Flow",
      badge: "Template Standard",
      message: "ResumeLoops export templates are architected as single-column layouts to prevent parser column scramble.",
    },
    {
      id: "std-headings",
      title: "Standard Section Headers",
      badge: "Template Standard",
      message: "Template headers use standardized taxonomy (Experience, Education, Skills) recognized by applicant tracking systems.",
    },
    {
      id: "std-encoding",
      title: "Clean Typography & Encoding",
      badge: "Template Standard",
      message: "System and web-safe Inter typography with UTF-8 encoding, avoiding decorative character artifacts.",
    },
  ];

  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-sm space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Format & Content Audit
          </span>
        </div>
        <h3 className="text-lg font-bold text-on-surface">Structural & Formatting Compliance</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Evaluating resume content readiness alongside ResumeLoops template formatting standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Template Design Conventions */}
        {templateConventions.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-surface-container-low border border-border-subtle/80 flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">By Design</span>
              <span className="text-[11px] font-semibold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">{item.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {item.message}
              </p>
            </div>
          </div>
        ))}

        {/* Dynamic resume-specific checks */}
        {checks.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
              item.status === "passed"
                ? "bg-surface-container-low border-border-subtle/80"
                : item.status === "warning"
                ? "bg-amber-50/40 border-amber-200/80"
                : "bg-rose-50/40 border-rose-200/80"
            }`}
          >
            <div className="flex items-center justify-between">
              {item.status === "passed" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {item.status === "warning" && (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              {item.status === "needs-attention" && (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  item.status === "passed"
                    ? "text-emerald-800 bg-emerald-50 border-emerald-200/60"
                    : item.status === "warning"
                    ? "text-amber-800 bg-amber-50 border-amber-200/60"
                    : "text-rose-800 bg-rose-50 border-rose-200/60"
                }`}
              >
                {item.status === "passed"
                  ? "Passed"
                  : item.status === "warning"
                  ? "Warning"
                  : "Attention"}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-on-surface">{item.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
