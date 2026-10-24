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
}

const SECTIONS: SectionMeta[] = [
  {
    type: "personal",
    title: "Personal Details",
    icon: User,
    getCount: (r) => (r.personalInfo.firstName && r.personalInfo.email ? 1 : 0),
  },
  {
    type: "summary",
    title: "Professional Summary",
    icon: FileText,
    getCount: (r) => (r.summary.trim().length > 0 ? 1 : 0),
  },
  {
    type: "experience",
    title: "Work Experience",
    icon: Briefcase,
    getCount: (r) => r.experience.length,
  },
  {
    type: "education",
    title: "Education",
    icon: GraduationCap,
    getCount: (r) => r.education.length,
  },
  {
    type: "skills",
    title: "Technical Skills",
    icon: Code2,
    getCount: (r) =>
      r.skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0),
  },
  {
    type: "projects",
    title: "Projects",
    icon: Rocket,
    getCount: (r) => r.projects.length,
  },
  {
    type: "certifications",
    title: "Certifications",
    icon: Award,
    getCount: (r) => r.certifications.length,
  },
];

export function SectionNav({
  activeSection,
  onSectionSelect,
  resume,
}: SectionNavProps) {
  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl border border-border-subtle p-3.5 shadow-xs flex flex-col gap-2">
      <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-on-surface-variant uppercase tracking-wider">
        <span>Sections</span>
        <span className="text-[11px] font-mono text-primary">
          {SECTIONS.filter((s) => s.getCount(resume) > 0).length}/{SECTIONS.length} Active
        </span>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Resume Sections">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.type;
          const count = sec.getCount(resume);
          const Icon = sec.icon;

          return (
            <button
              key={sec.type}
              type="button"
              onClick={() => onSectionSelect(sec.type)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-secondary-container text-primary font-bold border border-primary/20 shadow-xs"
                  : "text-on-surface hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-primary" : "text-on-surface-variant"
                  }`}
                />
                <span className="truncate">{sec.title}</span>
              </div>

              {count > 0 ? (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-md">
                    {count}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              ) : (
                <span className="text-[10px] text-on-surface-variant/70 italic shrink-0 ml-2">
                  Empty
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
