import React from "react";
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  Wand2,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export const metadata = {
  title: "AI Tailoring & Smart Rewriter — ResumeLoops",
  description: "Transform passive work experience into high-impact, quantified achievement bullets.",
};

export default function AiRewriterPage() {
  const keywords = [
    { name: "Distributed Systems", matched: true, count: 5 },
    { name: "Kubernetes Orchestration", matched: true, count: 2 },
    { name: "Zero-Trust Architecture", matched: false, count: 0 },
    { name: "PCI-DSS Compliance", matched: false, count: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
              Semantic Optimization Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            AI Tailoring &amp; Smart Rewriter
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Analyze target job descriptions and transform duty bullets into quantified achievement formulas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="indigo">
            <Sparkles className="w-3.5 h-3.5" />
            Model Ready
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Job Description & Keywords (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Job Description</CardTitle>
              <CardDescription className="text-xs">
                Paste the job requirements to extract essential semantic terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Role & Company"
                defaultValue="Senior Staff Infrastructure Engineer — Stripe"
              />
              <Textarea
                label="Job Description Text"
                rows={5}
                defaultValue="We are seeking a Senior Staff Infrastructure Engineer to lead global payments control planes. Requirements: 8+ years distributed systems, Go, Kubernetes, zero-trust architecture, PCI-DSS compliance."
              />
              <Button variant="secondary" size="sm" className="w-full">
                <Wand2 className="w-3.5 h-3.5" />
                Scan Keywords
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Keyword Alignment</CardTitle>
                <Badge variant="indigo">84% Match</Badge>
              </div>
              <CardDescription className="text-xs">
                Click missing keywords to inject targeted achievement phrasing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {keywords.map((kw, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-border-subtle text-xs"
                >
                  <div className="flex items-center gap-2">
                    {kw.matched ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <PlusCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className="font-medium text-on-surface">{kw.name}</span>
                  </div>
                  <Badge variant={kw.matched ? "success" : "danger"}>
                    {kw.matched ? `Matched (${kw.count})` : "Missing"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Smart Rewriter Diff Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <div>
              <h3 className="text-base font-semibold text-on-surface">
                Smart Rewriter Suggestions
              </h3>
              <p className="text-xs text-on-surface-variant">
                Experience Section • 2 suggestions generated
              </p>
            </div>
            <Button variant="secondary" size="sm">
              <Check className="w-3.5 h-3.5" />
              Accept All
            </Button>
          </div>

          {/* Suggestion Diff Card 1 */}
          <Card>
            <CardHeader className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">Quantified Impact</Badge>
                  <span className="text-xs text-on-surface-variant font-mono">
                    Experience #1: CloudScale Systems
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +38% ATS Impact Score
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Bullet */}
                <div className="p-4 rounded-lg bg-surface-container-low border border-border-subtle">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                    Original Bullet
                  </span>
                  <p className="text-xs text-on-surface-variant line-through opacity-75 leading-relaxed">
                    Worked on Kubernetes clusters and helped improve deployment speed across internal engineering squads.
                  </p>
                </div>

                {/* Suggested Improvement */}
                <div className="p-4 rounded-lg bg-secondary-container/40 border border-primary/20">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block mb-1">
                    Suggested Bullet (Google XYZ)
                  </span>
                  <p className="text-xs text-on-surface font-medium leading-relaxed">
                    Architected multi-region <span className="bg-emerald-100 text-emerald-900 px-1 rounded">Kubernetes</span> control plane handling 120,000 req/sec, reducing deployment cycle times by <span className="bg-emerald-100 text-emerald-900 px-1 rounded">42%</span> across 30 squads.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <Button variant="ghost" size="sm">
                  Edit Manually
                </Button>
                <Button variant="primary" size="sm">
                  Accept Suggestion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
