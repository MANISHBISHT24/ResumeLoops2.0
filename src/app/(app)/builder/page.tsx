"use client";

import React, { Suspense, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Wand2,
  ChevronRight,
} from "lucide-react";
import { SectionType, Resume, TemplateId } from "@/types/resume";
import { useResumeStore } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ResumeToolbar } from "@/components/builder/ResumeToolbar";
import { SectionNav } from "@/components/builder/SectionNav";
import { PersonalForm } from "@/components/builder/sections/PersonalForm";
import { SummaryForm } from "@/components/builder/sections/SummaryForm";
import { ExperienceForm } from "@/components/builder/sections/ExperienceForm";
import { EducationForm } from "@/components/builder/sections/EducationForm";
import { SkillsForm } from "@/components/builder/sections/SkillsForm";
import { ProjectsForm } from "@/components/builder/sections/ProjectsForm";
import { CertificationsForm } from "@/components/builder/sections/CertificationsForm";
import { LiveResumePreview } from "@/components/builder/LiveResumePreview";

interface ResumeEditorProps {
  resumeId: string | null;
}

function ResumeEditor({ resumeId }: ResumeEditorProps) {
  const { resumes, isHydrated, updateResume, isCloudSynced } = useResumeStore();

  const [activeSection, setActiveSection] = useState<SectionType>("personal");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [localOverrides, setLocalOverrides] = useState<{ id: string; data: Resume } | null>(null);
  const [optVector, setOptVector] = useState<"Brevity" | "Impact" | "Metric">("Impact");

  const storedResume = useMemo(() => {
    if (!isHydrated || !resumeId) return null;
    return resumes.find((r) => r.id === resumeId) || null;
  }, [isHydrated, resumeId, resumes]);

  const resume =
    localOverrides && localOverrides.id === resumeId ? localOverrides.data : storedResume;

  // Save status states
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedText, setLastSavedText] = useState("Saved");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived not found state
  const isNotFound = isHydrated && Boolean(resumeId) && storedResume === null;

  // Persist changes with debounce
  const triggerAutoSave = useCallback((updated: Resume) => {
    setSaveStatus("saving");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const saved = await updateResume(updated.id, updated);
        if (saved) {
          setSaveStatus("saved");
          setLastSavedText(isCloudSynced ? "Saved to cloud" : "Saved locally");
        } else {
          setSaveStatus("unsaved");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("unsaved");
      }
    }, 500);
  }, [updateResume, isCloudSynced]);

  // Update helper
  const handleUpdateResume = (partial: Partial<Resume>) => {
    if (!resume) return;
    const updated: Resume = {
      ...resume,
      ...partial,
      lastModified: "Just now",
    };
    setLocalOverrides({ id: updated.id, data: updated });
    triggerAutoSave(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  // Missing or Invalid ID Error State
  if (!resumeId) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-surface p-8 rounded-xl border border-outline-variant/40 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-title-md font-title-md text-on-surface">No Document Selected</h2>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          Please select an existing resume draft from your workspace or create a new edition to begin authoring.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workspace</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-surface p-8 rounded-xl border border-outline-variant/40 shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-title-md font-title-md text-on-surface">Document Not Found</h2>
        <p className="text-body-sm text-on-surface-variant leading-relaxed">
          The requested document ID <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-[11px]">{resumeId}</code> was not found in your workspace archive.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Workspace</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-12 text-center text-body-sm text-on-surface-variant font-medium">
        Loading document architecture...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col -m-6 sm:-m-8 print:m-0 print:min-h-0 bg-surface">
      {/* Top Builder Sub-Toolbar */}
      <ResumeToolbar
        title={resume.title}
        onTitleChange={(newTitle) => handleUpdateResume({ title: newTitle })}
        templateId={resume.templateId}
        onTemplateChange={(newTemplateId: TemplateId) =>
          handleUpdateResume({ templateId: newTemplateId })
        }
        saveStatus={saveStatus}
        lastSavedText={lastSavedText}
        mobileView={mobileView}
        onMobileViewChange={setMobileView}
        onPrint={handlePrint}
      />

      {/* Main Split Desk */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 print:p-0 print:m-0 print:max-w-none">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start print:block print:w-full">
          {/* LEFT COLUMN: Section Navigator */}
          <div
            className={`no-print xl:col-span-1 space-y-4 ${
              mobileView === "preview" ? "hidden xl:block" : "block"
            }`}
          >
            <SectionNav
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
              resume={resume}
            />

            {/* Requisition Alignment Tip */}
            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant/40 text-on-surface-variant text-body-sm space-y-2">
              <span className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Editorial Rule
              </span>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                Replace generic descriptors with quantified metrics (*reduced cycle times by 34%*, *scaled to 180k users*) for high ATS velocity.
              </p>
              <div className="pt-1">
                <Link
                  href="/ats-analyzer"
                  className="font-label-xs text-label-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Open ATS Diagnostic Engine</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Form Editor */}
          <div
            className={`no-print xl:col-span-1 ${
              mobileView === "preview" ? "hidden xl:block" : "block"
            }`}
          >
            <Card className="shadow-xs border border-outline-variant/40 bg-surface rounded-xl">
              <CardContent className="pt-6">
                {activeSection === "personal" && (
                  <PersonalForm
                    data={resume.personalInfo}
                    onChange={(updatedPersonal) =>
                      handleUpdateResume({ personalInfo: updatedPersonal })
                    }
                  />
                )}

                {activeSection === "summary" && (
                  <SummaryForm
                    summary={resume.summary}
                    onChange={(updatedSummary) =>
                      handleUpdateResume({ summary: updatedSummary })
                    }
                  />
                )}

                {activeSection === "experience" && (
                  <ExperienceForm
                    experience={resume.experience}
                    onChange={(updatedExperience) =>
                      handleUpdateResume({ experience: updatedExperience })
                    }
                  />
                )}

                {activeSection === "education" && (
                  <EducationForm
                    education={resume.education}
                    onChange={(updatedEducation) =>
                      handleUpdateResume({ education: updatedEducation })
                    }
                  />
                )}

                {activeSection === "skills" && (
                  <SkillsForm
                    categories={resume.skillCategories}
                    onChange={(updatedSkills) =>
                      handleUpdateResume({ skillCategories: updatedSkills })
                    }
                  />
                )}

                {activeSection === "projects" && (
                  <ProjectsForm
                    projects={resume.projects}
                    onChange={(updatedProjects) =>
                      handleUpdateResume({ projects: updatedProjects })
                    }
                  />
                )}

                {activeSection === "certifications" && (
                  <CertificationsForm
                    certifications={resume.certifications}
                    onChange={(updatedCerts) =>
                      handleUpdateResume({ certifications: updatedCerts })
                    }
                  />
                )}
              </CardContent>
            </Card>

            {/* Contextual AI Assistant Quick Tuning Rail (Below form on medium screens, or side rail) */}
            <div className="mt-6 p-4 rounded-xl border border-outline-variant/40 bg-surface flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface font-semibold flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-primary" />
                  AI Tuning Assistant
                </span>
                <Link
                  href="/ai-rewriter"
                  className="font-label-xs text-label-xs text-primary font-semibold hover:underline"
                >
                  Full Rewriter →
                </Link>
              </div>

              {/* Mode Tuning Buttons */}
              <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded">
                {(["Brevity", "Impact", "Metric"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setOptVector(mode)}
                    className={`py-1 rounded text-center font-label-xs text-label-xs transition-all ${
                      optVector === mode
                        ? "bg-primary text-white font-semibold shadow-2xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Sample Differential Revision Callout */}
              <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-on-surface">
                  <span className="font-label-xs text-label-xs uppercase tracking-wider font-semibold">
                    Targeted Bullet Formula
                  </span>
                  <span className="font-label-xs text-label-xs text-[#2e6f40] font-mono font-semibold">
                    +14% ATS
                  </span>
                </div>
                <p className="text-body-sm font-mono text-on-surface leading-snug bg-surface-container-lowest p-2 rounded border border-outline-variant/30">
                  [Action verb] + [Project scope] + [Quantified delta]
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Optimized for executive screening: Swap passive descriptions for direct technical accomplishments.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Document Canvas */}
          <div
            className={`xl:col-span-1 print:w-full print:block ${
              mobileView === "edit" ? "hidden xl:block" : "block"
            }`}
          >
            <div className="print:static print:max-h-none print:overflow-visible print:bg-transparent print:border-none print:p-0 print:m-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl bg-surface-container-low p-3 sm:p-5 border border-outline-variant/40 flex flex-col items-center">
              <div className="no-print w-full flex items-center justify-between mb-2 px-1 text-on-surface-variant font-label-xs text-label-xs font-semibold">
                <span className="uppercase tracking-wider">
                  Live Tactile Canvas
                </span>
                <span className="font-mono">100% Scale</span>
              </div>

              {/* Document Sheet */}
              <LiveResumePreview resume={resume} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  return <ResumeEditor key={resumeId || "none"} resumeId={resumeId} />;
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-body-sm text-on-surface-variant font-medium">
          Loading resume editor workspace...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
