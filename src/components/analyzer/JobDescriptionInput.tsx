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
    <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Target Job Description Matching
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Paste target role requirements to extract domain terms and calculate keyword alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {jobDescription && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onJobDescriptionChange("")}
              className="text-xs text-on-surface-variant hover:text-error"
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
            <span className="text-xs text-on-surface-variant font-medium">Quick sample JDs:</span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onJobDescriptionChange(preset.text);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-container hover:bg-secondary-container hover:text-primary transition-colors border border-border-subtle cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              value={jobDescription}
              onChange={(e) => onJobDescriptionChange(e.target.value)}
              placeholder="Paste target job description here (e.g., requirements, responsibilities, technical qualifications)..."
              rows={5}
              className="w-full text-xs sm:text-sm font-normal text-on-surface bg-surface-container-lowest border border-border-subtle rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y placeholder:text-on-surface-variant/50"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-on-surface-variant/80 italic">
              {jobDescription.trim().length > 0
                ? `${jobDescription.trim().split(/\s+/).filter(Boolean).length} words entered`
                : "No job description entered — job match estimate is currently withheld."}
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={onAnalyze}
              disabled={jobDescription.trim().length < 20}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {isAnalyzed ? "Re-Analyze Keyword Alignment" : "Analyze Job Keywords"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
