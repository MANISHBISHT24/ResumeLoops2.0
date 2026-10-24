"use client";

import React, { Suspense, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import { SectionType, Resume, TemplateId } from "@/types/resume";
import { updateResume, useResumeStore } from "@/lib/storage";
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
  const { resumes, isHydrated } = useResumeStore();

  const [activeSection, setActiveSection] = useState<SectionType>("personal");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [localOverrides, setLocalOverrides] = useState<{ id: string; data: Resume } | null>(null);

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

    debounceTimerRef.current = setTimeout(() => {
      try {
        const saved = updateResume(updated.id, updated);
        if (saved) {
          setSaveStatus("saved");
          setLastSavedText("Saved just now");
        } else {
          setSaveStatus("unsaved");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("unsaved");
      }
    }, 500);
  }, []);

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
      <div className="max-w-md mx-auto my-16 text-center bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-secondary-container text-primary flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-on-surface">No Resume Selected</h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Please select an existing resume draft from your dashboard or create a new one to begin editing.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-on-surface">Resume Draft Not Found</h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          The requested resume ID <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-[11px]">{resumeId}</code> was not found in your browser&apos;s local storage.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-12 text-center text-xs text-on-surface-variant font-medium">
        Loading resume draft...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col -m-6 sm:-m-8">
      {/* Top Builder Toolbar */}
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

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Section Navigator (3 cols on desktop) */}
          <div
            className={`lg:col-span-3 space-y-4 ${
              mobileView === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            <SectionNav
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
              resume={resume}
            />

            {/* Quick Tips Box */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-border-subtle text-xs text-on-surface-variant space-y-2">
              <span className="font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Editorial Tip
              </span>
              <p className="leading-relaxed">
                Use strong action verbs (*Architected*, *Spearheaded*, *Optimized*) and metric-backed outcomes for higher ATS scoring velocity.
              </p>
            </div>
          </div>

          {/* Center Column: Active Section Form Editor (5 cols on desktop) */}
          <div
            className={`lg:col-span-5 ${
              mobileView === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            <Card className="shadow-xs border-border-subtle">
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
          </div>

          {/* Right Column: Live Document Preview (4 cols on desktop) */}
          <div
            className={`lg:col-span-4 ${
              mobileView === "edit" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl bg-surface-container-low p-2 sm:p-4 border border-border-subtle flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-2 text-xs text-on-surface-variant font-medium">
                <span className="uppercase tracking-wider text-[11px] font-bold">
                  Live A4 Document
                </span>
                <span className="text-[11px] font-mono">100% Scale</span>
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
        <div className="p-12 text-center text-xs text-on-surface-variant font-medium">
          Loading resume editor workspace...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
