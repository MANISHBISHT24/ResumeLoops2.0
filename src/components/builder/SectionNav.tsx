"use client";

import React from "react";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code2,
  Rocket,
  Award,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import { SectionType, Resume } from "@/types/resume";

export interface SectionNavProps {
  activeSection: SectionType;
  onSectionSelect: (section: SectionType) => void;
  resume: Resume;
}

interface SectionMeta {
  type: SectionType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  getCount: (resume: Resume) => number;
  formatCount: (count: number) => string;
}

const SECTIONS: SectionMeta[] = [
  {
    type: "personal",
    title: "Contact & Header",
    icon: User,
    getCount: (r) => (r.personalInfo.firstName && r.personalInfo.email ? 1 : 0),
    formatCount: (c) => (c > 0 ? "100%" : "Empty"),
  },
  {
    type: "summary",
    title: "Executive Profile",
    icon: FileText,
    getCount: (r) => (r.summary.trim().length > 0 ? 1 : 0),
    formatCount: (c) => (c > 0 ? "Ready" : "Empty"),
  },
  {
    type: "experience",
    title: "Professional Experience",
    icon: Briefcase,
    getCount: (r) => r.experience.length,
    formatCount: (c) => `${c} role${c === 1 ? "" : "s"}`,
  },
  {
    type: "education",
    title: "Education & Credentials",
    icon: GraduationCap,
    getCount: (r) => r.education.length,
    formatCount: (c) => `${c} deg${c === 1 ? "" : "s"}`,
  },
  {
    type: "skills",
    title: "Core Competencies",
    icon: Code2,
    getCount: (r) =>
      r.skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0),
    formatCount: (c) => `${c} tag${c === 1 ? "" : "s"}`,
  },
  {
    type: "projects",
    title: "Strategic Initiatives",
    icon: Rocket,
    getCount: (r) => r.projects.length,
    formatCount: (c) => `${c} case${c === 1 ? "" : "s"}`,
  },
  {
    type: "certifications",
    title: "Certifications & Honors",
    icon: Award,
    getCount: (r) => r.certifications.length,
    formatCount: (c) => `${c} cert${c === 1 ? "" : "s"}`,
  },
];

export function SectionNav({
  activeSection,
  onSectionSelect,
  resume,
}: SectionNavProps) {
  const activeCount = SECTIONS.filter((s) => s.getCount(resume) > 0).length;
  const compatibilityScore = Math.min(100, Math.round((activeCount / SECTIONS.length) * 100));

  return (
    <div className="w-full flex flex-col gap-space-md">
      {/* Section Stack Container */}
      <div className="bg-surface p-space-md rounded-xl border border-outline-variant/40 shadow-xs flex flex-col gap-3">
        {/* Section Overline */}
        <div className="flex items-center justify-between px-1">
          <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            Structure &amp; Architecture
          </span>
          <span className="font-label-xs text-label-xs text-on-surface-variant font-mono">
            {SECTIONS.length} SECTIONS
          </span>
        </div>

        {/* Section Navigation Stack */}
        <nav className="flex flex-col gap-1.5" aria-label="Resume Structure">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.type;
            const count = sec.getCount(resume);
            const countLabel = sec.formatCount(count);

            return (
              <button
                key={sec.type}
                type="button"
                onClick={() => onSectionSelect(sec.type)}
                className={`group flex items-center justify-between p-2 rounded transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-surface-container-highest text-on-surface shadow-2xs"
                    : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive
                        ? "text-on-surface"
                        : "text-on-surface-variant/40 group-hover:text-on-surface"
                    }`}
                  />
                  <span
                    className={`text-body-sm truncate ${
                      isActive ? "font-title-md font-semibold text-on-surface" : "font-body-sm"
                    }`}
                  >
                    {sec.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isActive ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold">
                        Active
                      </span>
                    </div>
                  ) : count > 0 ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2e6f40]" />
                      <span className="font-label-xs text-label-xs text-on-surface-variant/80 font-mono">
                        {countLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="font-label-xs text-label-xs text-on-surface-variant/40">
                      Empty
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Document Reading Velocity Sparkline */}
        <div className="mt-2 p-3 bg-surface-container-low rounded border border-outline-variant/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold">
              Reading Velocity
            </span>
            <span className="font-label-xs text-label-xs text-on-surface font-mono font-semibold">
              1.8 min
            </span>
          </div>
          <div className="h-6 w-full flex items-end">
            <svg
              className="w-full h-full text-secondary"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 100 24"
            >
              <path
                d="M0 20 Q 20 18, 35 12 T 65 8 T 85 4 T 100 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M0 20 Q 20 18, 35 12 T 65 8 T 85 4 T 100 2 L 100 24 L 0 24 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom ATS Compatibility Gauge Callout */}
      <div className="p-3 bg-surface rounded-xl border border-outline-variant/40 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-semibold">
            ATS Compatibility
          </span>
          <span className="font-label-xs text-label-xs text-on-surface font-bold font-mono">
            {compatibilityScore} / 100
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${compatibilityScore}%` }}
          />
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
          Archival structure formatted for enterprise applicant tracking systems.
        </p>
      </div>
    </div>
  );
}
