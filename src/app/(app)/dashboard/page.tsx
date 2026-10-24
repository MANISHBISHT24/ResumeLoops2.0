"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Sparkles,
  FileText,
  Briefcase,
  Lightbulb,
  History,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Resume } from "@/types/resume";
import { useResumeStore } from "@/lib/storage";
import { ResumeCard } from "@/components/dashboard/ResumeCard";
import { CreateResumeModal } from "@/components/dashboard/CreateResumeModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { EmptyResumeState } from "@/components/dashboard/EmptyResumeState";

export default function DashboardPage() {
  const {
    resumes,
    isHydrated,
    duplicateResume,
    deleteResume,
    resetToSampleResumes,
    clearAllResumes,
  } = useResumeStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quickStartRole, setQuickStartRole] = useState<string | undefined>(undefined);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateResume(id);
    if (duplicated) {
      showFeedback(`Duplicated "${duplicated.title}" to local workspace.`);
    }
  };

  const handleDeleteConfirm = () => {
    if (!resumeToDelete) return;
    const deletedTitle = resumeToDelete.title;
    const success = deleteResume(resumeToDelete.id);
    if (success) {
      showFeedback(`Deleted "${deletedTitle}" from local workspace.`);
    }
    setResumeToDelete(null);
  };

  const handleQuickStart = (roleName: string) => {
    setQuickStartRole(roleName);
    setIsCreateModalOpen(true);
  };

  // Derive summary metrics from actual local resume data
  const totalResumes = resumes.length;
  const sampleCount = resumes.filter((r) => r.id.startsWith("sample-")).length;
  const customCount = totalResumes - sampleCount;

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-neutral-700"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Banner / Workspace Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
              Local Workspace Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
            Manage your targeted resumes, monitor ATS readiness, and generate tailored applications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Resume</span>
          </Button>

          {totalResumes > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAllResumes}
              title="Clear all drafts to test empty state"
              className="text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="hidden sm:inline">Clear All</span>
            </Button>
          )}

          {totalResumes === 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={resetToSampleResumes}
              title="Load demo sample resumes"
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Samples</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid: Left Column (8 cols) & Right Column (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Quick Start Card & Resumes List */}
        <div className="lg:col-span-8 space-y-8">
          {/* Prominent Primary Action Card matching Stitch code.html */}
          <div className="relative overflow-hidden bg-primary text-on-primary rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-between">
            {/* Ambient decorative highlights */}
            <div
              className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none blur-2xl"
              aria-hidden="true"
            />
            <div
              className="absolute right-32 top-0 w-32 h-32 rounded-full bg-secondary-container/20 pointer-events-none blur-xl"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-on-primary text-xs font-semibold mb-3 backdrop-blur-md border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Targeting</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white max-w-lg leading-tight">
                Target your dream role with precision engineering
              </h2>
              <p className="text-sm text-white/85 mt-2 max-w-md leading-relaxed">
                Generate a high-converting, ATS-optimized resume tailored to any job description in seconds using our publication-grade layout engine.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-white/90 text-xs">
                <span className="uppercase tracking-wider text-white/70 font-semibold">
                  Quick Start:
                </span>
                {["Software Architect", "Product Lead", "Design Director"].map(
                  (role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleQuickStart(role)}
                      className="hover:bg-white/20 bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-white font-medium"
                    >
                      {role}
                    </button>
                  )
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white text-primary hover:bg-neutral-100 font-bold text-xs sm:text-sm shadow-md border-transparent"
              >
                <span>Launch Generator</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Recent Resumes Section */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-xs border border-border-subtle">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-on-surface">
                    Recent Resumes
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Locally stored drafts &amp; sample templates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="indigo" className="text-xs">
                  {totalResumes} {totalResumes === 1 ? "Resume" : "Resumes"}
                </Badge>
                {sampleCount > 0 && (
                  <Badge variant="neutral" className="text-xs hidden sm:inline-flex">
                    {sampleCount} Sample
                  </Badge>
                )}
              </div>
            </div>

            {/* List / Empty State */}
            {!isHydrated ? (
              <div className="p-8 text-center text-xs text-on-surface-variant font-medium">
                Loading workspace drafts...
              </div>
            ) : totalResumes === 0 ? (
              <EmptyResumeState
                onCreateClick={() => setIsCreateModalOpen(true)}
                onLoadSamplesClick={resetToSampleResumes}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onDuplicate={handleDuplicate}
                    onDeleteRequest={(r) => setResumeToDelete(r)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Useful Summary Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Workspace Inventory / Stats Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-border-subtle">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm sm:text-base text-on-surface">
                  Workspace Overview
                </h3>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">
                Browser Store
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border-subtle text-xs">
                <span className="text-on-surface-variant font-medium">Total Drafts</span>
                <span className="font-bold text-on-surface text-sm">{totalResumes}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border-subtle text-xs">
                <span className="text-on-surface-variant font-medium">Custom User Resumes</span>
                <span className="font-bold text-primary text-sm">{customCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border-subtle text-xs">
                <span className="text-on-surface-variant font-medium">Sample Demo Fixtures</span>
                <span className="font-bold text-on-surface text-sm">{sampleCount}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
              <button
                type="button"
                onClick={resetToSampleResumes}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Sample Data</span>
              </button>
            </div>
          </div>

          {/* Recommended Next Actions */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-border-subtle">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm sm:text-base text-on-surface">
                Recommended Actions
              </h3>
            </div>

            <div className="space-y-3">
              <Link
                href="/ai-rewriter"
                className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group block"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                    Optimize bullet points
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Convert passive task descriptions into quantified achievements using the AI bullet rewriter.
                  </p>
                </div>
              </Link>

              <Link
                href="/ats-analyzer"
                className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group block"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                    Run Keyword Gap Check
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Paste a target job description into the ATS analyzer to detect missing skills.
                  </p>
                </div>
              </Link>

              <Link
                href="/templates"
                className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group block"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                    Browse Curated Layouts
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    Switch typography and margin styles between Executive, Minimal, and Modern layouts.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-border-subtle">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-subtle">
              <History className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm sm:text-base text-on-surface">
                Workspace Activity
              </h3>
            </div>

            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
              <div className="relative">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
                <p className="text-xs font-semibold text-on-surface">
                  Workspace loaded from local storage
                </p>
                <span className="text-[11px] text-on-surface-variant">Active tab session</span>
              </div>
              <div className="relative">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest" />
                <p className="text-xs font-semibold text-on-surface">
                  {totalResumes > 0
                    ? `Latest draft: ${resumes[0].title}`
                    : "No active drafts in workspace"}
                </p>
                <span className="text-[11px] text-on-surface-variant">
                  {totalResumes > 0 ? resumes[0].lastModified : "Empty state"}
                </span>
              </div>
            </div>
          </div>

          {/* Local Storage & Privacy Notice */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-border-subtle">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface">
                Private Local Storage
              </h3>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Your resume drafts are saved locally in this browser. They are not cloud-synchronized and will be lost if you clear your browser site data or cookies.
            </p>
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <CreateResumeModal
          key={quickStartRole || "new"}
          isOpen={isCreateModalOpen}
          defaultRole={quickStartRole}
          onClose={() => {
            setIsCreateModalOpen(false);
            setQuickStartRole(undefined);
          }}
          onCreated={(newId) => {
            showFeedback(`Resume created successfully in your local workspace (${newId}).`);
          }}
        />
      )}

      {/* Deletion Confirmation Modal */}
      {resumeToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(resumeToDelete)}
          onClose={() => setResumeToDelete(null)}
          onConfirm={handleDeleteConfirm}
          resumeTitle={resumeToDelete.title}
        />
      )}
    </div>
  );
}
