"use client";

import React, { useState } from "react";
import { Search, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface JobDescriptionInputProps {
  jobDescription: string;
  onJobDescriptionChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzed: boolean;
}

const SAMPLE_PRESETS = [
  {
    name: "Staff Infra (Stripe)",
    text: `We are seeking a Staff Infrastructure Engineer to join our Payments Platform team at Stripe.
Requirements:
- 8+ years experience designing high-throughput distributed systems and microservices architecture.
- Deep expertise in Kubernetes, Docker, Terraform, and AWS cloud infrastructure.
- Experience with payment processing, PCI-DSS compliance, and zero-trust security.
- Proficiency in Golang, Rust, or TypeScript.
- Track record optimizing database query performance, Redis caching, and low latency under high throughput.`,
  },
  {
    name: "Full-Stack Tech Lead",
    text: `Looking for a Full-Stack Tech Lead to drive our web application platform.
Requirements:
- 6+ years experience in TypeScript, React, Next.js, and Node.js.
- Strong knowledge of REST APIs, GraphQL, PostgreSQL, and continuous integration (CI/CD).
- Demonstrated experience in design systems, performance optimization, and cross-functional leadership.
- Experience building scalable cloud services on AWS or GCP.`,
  },
  {
    name: "Product Designer",
    text: `Seeking a Lead Product Designer to champion our design system and end-to-end user experience.
Requirements:
- 5+ years experience designing complex web and mobile product interfaces in Figma.
- Deep expertise in design systems, user research, wireframing and prototyping, and interaction design.
- Proven track record collaborating with engineering teams and cross-functional stakeholders.`,
  },
];

export function JobDescriptionInput({
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  isAnalyzed,
}: JobDescriptionInputProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/40 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Target Job Requisition Matching
          </h3>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
            Paste target role requirements to extract domain terms and calculate keyword alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {jobDescription && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJobDescriptionChange("")}
              className="text-xs text-on-surface-variant hover:text-rose-700"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs"
          >
            {isOpen ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-1">
          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-label-xs text-label-xs text-on-surface-variant font-medium">Quick sample requisitions:</span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onJobDescriptionChange(preset.text);
                }}
                className="px-2 py-0.5 font-label-xs text-label-xs rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-outline-variant/30 cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste target job description or requirements section here (minimum 20 characters)..."
              className="w-full p-3 font-body-sm text-body-sm bg-surface-container-low border border-outline-variant/40 rounded-lg focus:outline-none focus:border-on-surface text-on-surface placeholder:text-on-surface-variant/50 transition-all resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs font-mono text-on-surface-variant">
              {jobDescription.length} characters
              {jobDescription.length > 0 && jobDescription.length < 20 && " (min 20 needed)"}
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={onAnalyze}
              disabled={jobDescription.trim().length < 20}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzed ? "Recalculate Alignment" : "Analyze Job Alignment"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
