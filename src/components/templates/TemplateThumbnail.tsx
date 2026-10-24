"use client";

import React from "react";
import { TemplateId } from "@/types/resume";

export interface TemplateThumbnailProps {
  templateId: TemplateId;
  className?: string;
}

/**
 * Renders an authentic miniature A4 document preview exhibiting the precise
 * typographical and layout traits of each supported ResumeLoops template.
 */
export function TemplateThumbnail({ templateId, className = "" }: TemplateThumbnailProps) {
  const isSerif = templateId === "swiss-chronicle" || templateId === "classic-oxford";
  const isMonoMeta = templateId === "stripe-mono";
  const isModernGrid = templateId === "linear-grid";
  const isOxford = templateId === "classic-oxford";

  return (
    <div
      className={`w-full aspect-[1/1.3] bg-surface-container-low p-4 sm:p-5 flex items-center justify-center overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Miniature A4 Sheet */}
      <div
        className={`w-full h-full bg-white rounded-xs shadow-xs border border-border-subtle p-3 sm:p-4 flex flex-col justify-between text-[7px] leading-tight transition-transform duration-200 group-hover:scale-[1.02] ${
          isSerif ? "font-serif" : "font-sans"
        }`}
      >
        {/* Header Block */}
        <div
          className={`flex flex-col gap-0.5 pb-2 ${
            isOxford
              ? "text-center items-center border-b-2 border-neutral-900"
              : "border-b border-border-subtle items-start"
          }`}
        >
          <div className="font-extrabold text-[9px] text-neutral-950 tracking-tight">
            Alexandre Vance
          </div>
          <div
            className={`font-semibold text-[6.5px] ${
              isModernGrid ? "text-primary" : "text-neutral-700"
            }`}
          >
            Staff Infrastructure Engineer
          </div>
          <div
            className={`text-[5.5px] text-neutral-500 flex items-center gap-1 mt-0.5 ${
              isMonoMeta ? "font-mono" : "font-sans"
            } ${isOxford ? "justify-center" : "justify-start"}`}
          >
            <span>San Francisco, CA</span>
            <span>•</span>
            <span>vance@example.com</span>
            <span>•</span>
            <span>linkedin.com/in/vance</span>
          </div>
        </div>

        {/* Section 1: Summary */}
        <div className="flex flex-col gap-0.5 my-1">
          <div
            className={`font-bold uppercase tracking-wider text-[6px] ${
              isModernGrid
                ? "text-primary flex items-center gap-1"
                : isSerif
                ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                : "text-primary"
            }`}
          >
            {isModernGrid && <span className="w-1 h-1 rounded-full bg-primary" />}
            <span>Summary</span>
          </div>
          <div className="text-neutral-600 line-clamp-2 text-[5.5px] font-sans leading-normal">
            Results-driven Staff Engineer with 8+ years designing high-throughput distributed architectures and cloud infrastructure.
          </div>
        </div>

        {/* Section 2: Experience */}
        <div className="flex flex-col gap-0.5 my-1 flex-1">
          <div
            className={`font-bold uppercase tracking-wider text-[6px] ${
              isModernGrid
                ? "text-primary flex items-center gap-1"
                : isSerif
                ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                : "text-primary"
            }`}
          >
            {isModernGrid && <span className="w-1 h-1 rounded-full bg-primary" />}
            <span>Experience</span>
          </div>

          <div className="flex flex-col gap-0.5 mt-0.5">
            <div className="flex items-center justify-between text-[6px] font-bold text-neutral-900">
              <span>Staff Engineer</span>
              <span className={`text-[5px] text-neutral-500 font-normal ${isMonoMeta ? "font-mono" : ""}`}>
                2022 — Present
              </span>
            </div>
            <div className="text-[5px] text-neutral-600 font-medium">CloudScale Systems • San Francisco</div>
            <div className="space-y-0.5 mt-0.5 text-neutral-600 font-sans text-[5.5px]">
              <div className="flex items-start gap-1">
                <span>•</span>
                <span className="line-clamp-1">Led migration to event-driven microservices architecture.</span>
              </div>
              <div className="flex items-start gap-1">
                <span>•</span>
                <span className="line-clamp-1">Optimized connection pooling, reducing p99 latency by 35%.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Skills */}
        <div className="flex flex-col gap-0.5 pt-1 border-t border-border-subtle/60">
          <div
            className={`font-bold uppercase tracking-wider text-[5.5px] ${
              isModernGrid ? "text-primary flex items-center gap-1" : isSerif ? "text-neutral-900" : "text-primary"
            }`}
          >
            {isModernGrid && <span className="w-0.5 h-0.5 rounded-full bg-primary" />}
            <span>Skills</span>
          </div>
          <div className="text-[5px] text-neutral-600 font-sans line-clamp-1">
            TypeScript, Go, Kubernetes, Kafka, Distributed Systems, Redis
          </div>
        </div>
      </div>
    </div>
  );
}
