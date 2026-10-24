import React from "react";
import {
  CheckCircle2,
  Lightbulb,
  FileCheck2,
  Download,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "ATS Analyzer & Diagnostic — ResumeLoops",
  description: "Algorithmic ATS parser simulation and weighted compatibility scoring.",
};

export default function AtsAnalyzerPage() {
  const complianceChecks = [
    { title: "Single-Column Flow", desc: "No multi-column text frames that scramble parsers.", passed: true },
    { title: "Standard Section Headers", desc: "Standardized titles (Experience, Education).", passed: true },
    { title: "Standard Fonts & Encodings", desc: "Inter/System fonts with UTF-8 character mapping.", passed: true },
  ];

  const actionableFixes = [
    {
      title: "Incorporate 'PCI-DSS Compliance' Keyword",
      impact: "High",
      desc: "Stripe emphasizes payment security infrastructure. Add compliance oversight to your 2021 fintech role.",
    },
    {
      title: "Quantify System Scale Metrics",
      impact: "Medium",
      desc: "Under your Staff Engineer role, include daily transaction volumes (e.g., '120k RPS throughput').",
    },
    {
      title: "Streamline Summary Line Count",
      impact: "Low",
      desc: "Maintain professional summary at or below 3 sentences for recruiter glance velocity.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
              Diagnostic Report
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            ATS Compatibility Diagnostic
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Targeting: <strong className="text-on-surface">Senior Staff Engineer at Stripe</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4" />
            Export Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Compatibility Hero & Structural Checks (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Circular Score Hero Card */}
          <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8">
            <div className="space-y-2 max-w-md">
              <Badge variant="indigo">Compatibility Score</Badge>
              <h3 className="text-2xl font-bold text-on-surface">
                Exceptional ATS Alignment
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your resume matches 96% of the semantic criteria required for the target role. It ranks in the top 2% of simulated ATS parses.
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Parser Readable: 100%
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Keyword Density: Optimal
                </span>
              </div>
            </div>

            {/* Circular Gauge Representation */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  className="text-surface-container"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                <circle
                  className="text-primary"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="52"
                  stroke="currentColor"
                  strokeDasharray="326"
                  strokeDashoffset="13"
                  strokeLinecap="round"
                  strokeWidth="10"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-on-surface tracking-tighter">
                  96
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-mono">
                  / 100
                </span>
              </div>
            </div>
          </Card>

          {/* Structural Formatting Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-primary" />
                Structural &amp; Formatting Compliance
              </CardTitle>
              <CardDescription className="text-xs">
                Verifies parsing robustness across legacy Workday, Taleo, and modern Greenhouse parsers.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {complianceChecks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-surface-container-low border border-border-subtle flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <Badge variant="success">Passed</Badge>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-on-surface">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Alignment Scores & Actionable Fixes (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alignment Scores Card */}
          <Card>
            <CardHeader className="mb-2">
              <CardTitle className="text-base">Alignment Scores</CardTitle>
              <CardDescription className="text-xs">
                Breakdown of experience depth and technical relevance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Skills Relevance</span>
                  <span className="font-bold text-primary">98%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[98%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Experience Seniority</span>
                  <span className="font-bold text-primary">92%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Quantified Metric Depth</span>
                  <span className="font-bold text-amber-700">85%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full w-[85%]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actionable Fixes */}
          <Card>
            <CardHeader className="mb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Actionable Fixes
                </CardTitle>
                <Badge variant="indigo">3 Suggestions</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {actionableFixes.map((fix, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-container-low border border-border-subtle space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface">
                      {fix.title}
                    </span>
                    <Badge
                      variant={
                        fix.impact === "High"
                          ? "danger"
                          : fix.impact === "Medium"
                          ? "warning"
                          : "neutral"
                      }
                      className="text-[10px]"
                    >
                      {fix.impact}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-snug">
                    {fix.desc}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
