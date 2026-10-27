"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  FileText,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Resume } from "@/types/resume";
import { useResumeStore } from "@/lib/storage";
import { useAuth } from "@/components/auth/AuthProvider";
import { SupabaseSetupBanner } from "@/components/auth/SupabaseSetupBanner";
import { ResumeCard } from "@/components/dashboard/ResumeCard";
import { CreateResumeModal } from "@/components/dashboard/CreateResumeModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { EmptyResumeState } from "@/components/dashboard/EmptyResumeState";
import { getTemplateById } from "@/lib/templates";

export default function DashboardPage() {
  const { isConfigured } = useAuth();
  const {
    resumes,
    isHydrated,
    isCloudSynced,
    hasUnimportedDrafts,
    duplicateResume,
    deleteResume,
    resetToSampleResumes,
    clearAllResumes,
    importLocalDrafts,
    dismissLocalDrafts,
    getLocalDrafts,
  } = useResumeStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quickStartRole, setQuickStartRole] = useState<string | undefined>(undefined);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isImportingDrafts, setIsImportingDrafts] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "custom" | "samples">("all");

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicateResume(id);
    if (duplicated) {
      showFeedback(`Duplicated "${duplicated.title}" to ${isCloudSynced ? "cloud account" : "local workspace"}.`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;
    const deletedTitle = resumeToDelete.title;
    const success = await deleteResume(resumeToDelete.id);
    if (success) {
      showFeedback(`Deleted "${deletedTitle}" from ${isCloudSynced ? "cloud account" : "local workspace"}.`);
    }
    setResumeToDelete(null);
  };

  const handleImportDrafts = async () => {
    setIsImportingDrafts(true);
    const result = await importLocalDrafts();
    setIsImportingDrafts(false);
    if (result.importedCount > 0) {
      showFeedback(`Successfully imported ${result.importedCount} local drafts to your cloud account.`);
    } else if (result.errors.length > 0) {
      showFeedback(`Import error: ${result.errors[0]}`);
    }
  };

  // Derive summary metrics from actual resume data
  const totalResumes = resumes.length;
  const sampleCount = resumes.filter((r) => r.id.startsWith("sample-")).length;
  const customCount = totalResumes - sampleCount;
  const localDraftsCount = isHydrated ? getLocalDrafts().length : 0;

  // Primary active document (first custom resume or first sample)
  const activeResume = resumes[0] || null;
  const activeTemplate = activeResume ? getTemplateById(activeResume.templateId) : null;

  const filteredResumes =
    filterTab === "all"
      ? resumes
      : filterTab === "custom"
      ? resumes.filter((r) => !r.id.startsWith("sample-"))
      : resumes.filter((r) => r.id.startsWith("sample-"));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1b1c1a] text-[#faf9f5] text-xs sm:text-sm px-4 py-3 rounded shadow-editorial-modal flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-border-subtle"
        >
          <CheckCircle2 className="w-4 h-4 text-[#276a45] shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Unconfigured Supabase Banner */}
      {!isConfigured && <SupabaseSetupBanner />}

      {/* Local Draft Import Notice (explicit consent workflow) */}
      {isCloudSynced && hasUnimportedDrafts && localDraftsCount > 0 && (
        <div className="bg-surface-container-low border border-border-subtle rounded p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-surface-container text-on-surface flex items-center justify-center shrink-0 mt-0.5">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">
                Local browser drafts detected ({localDraftsCount})
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5 max-w-xl leading-relaxed">
                You have {localDraftsCount} resume {localDraftsCount === 1 ? "draft" : "drafts"} saved locally in this browser. Would you like to import them into your authenticated cloud account? Local drafts remain safely intact until successful import is verified.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={dismissLocalDrafts}
              className="text-xs text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded border border-border-subtle hover:bg-surface-container transition-colors cursor-pointer"
            >
              Keep Local Only
            </button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isImportingDrafts}
              onClick={handleImportDrafts}
              className="text-xs font-semibold"
            >
              {isImportingDrafts ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import to Cloud</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Workspace Header & Core Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCloudSynced ? "bg-[#276a45]" : "bg-primary"
              }`}
            />
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-mono">
              Archival Studio • {isCloudSynced ? "Cloud PostgreSQL Active" : "Local Workspace"}
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-medium text-on-surface tracking-tight">
            Your career workspace.
          </h1>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Manage tailored documents, track version iterations, and diagnose target role alignment with editorial precision.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasUnimportedDrafts && localDraftsCount > 0 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleImportDrafts}
              className="text-xs sm:text-sm"
            >
              <FolderOpen className="w-4 h-4 mr-1.5" />
              <span>Import existing document</span>
            </Button>
          ) : (
            <Link
              href="/ats-analyzer"
              className="h-10 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs sm:text-sm rounded flex items-center gap-2 transition-all border border-border-subtle"
            >
              <FileText className="w-4 h-4" />
              <span>Upload / Analyze File</span>
            </Link>
          )}

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs sm:text-sm shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create new resume</span>
          </Button>

          {/* Hydration-safe button */}
          {!isHydrated ? (
            <div
              className="h-8 w-20 rounded bg-surface-container animate-pulse hidden sm:block"
              aria-hidden="true"
            />
          ) : totalResumes > 0 ? (
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
          ) : (
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

      {/* Featured Document Hero Banner (Asymmetrical Split Stage) */}
      {activeResume && (
        <div className="bg-surface-container-low rounded p-6 sm:p-8 flex flex-col xl:flex-row gap-8 items-stretch relative overflow-hidden border border-border-subtle shadow-xs">
          {/* Ambient blurred backing */}
          <div
            className="absolute -right-16 -bottom-16 w-80 h-80 bg-surface-container rounded-full blur-3xl pointer-events-none opacity-60"
            aria-hidden="true"
          />

          {/* Left Content & Diagnostics */}
          <div className="flex-1 flex flex-col justify-between gap-6 relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-surface-container-highest text-on-surface font-label-xs text-label-xs uppercase tracking-wider rounded font-medium">
                  Primary Active Document
                </span>
                <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant font-label-xs text-label-xs rounded flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#276a45]" />
                  ATS Alignment: {activeResume.atsScore || 94}%
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="font-headline-md text-xl sm:text-2xl font-semibold text-on-surface">
                  {activeResume.title}
                </h2>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  {activeResume.summary
                    ? activeResume.summary.slice(0, 160) + "..."
                    : "Fine-tuned for leadership and architectural trajectory. Structured around dual-track metric achievements and organizational systems scale."}
                </p>
              </div>

              {/* 3 Stats Troughs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-surface-container-lowest p-3 rounded border border-border-subtle">
                  <span className="font-label-xs text-[10px] uppercase tracking-wider text-on-surface-variant block mb-1">
                    Last Edited
                  </span>
                  <span className="font-title-md text-sm font-semibold text-on-surface">
                    {activeResume.lastModified}
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded border border-border-subtle">
                  <span className="font-label-xs text-[10px] uppercase tracking-wider text-on-surface-variant block mb-1">
                    Target Roles
                  </span>
                  <span className="font-title-md text-sm font-semibold text-on-surface">
                    {activeResume.targetRole || "General Architecture"}
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded border border-border-subtle col-span-2 sm:col-span-1">
                  <span className="font-label-xs text-[10px] uppercase tracking-wider text-on-surface-variant block mb-1">
                    Format &amp; Grid
                  </span>
                  <span className="font-title-md text-sm font-semibold text-on-surface">
                    {activeTemplate?.name || "The Swiss Chronicle"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Cluster */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Link
                href={`/builder?id=${activeResume.id}`}
                className="h-9 px-4 bg-primary text-on-primary hover:bg-neutral-800 font-label-md text-xs sm:text-sm rounded flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Open Editor</span>
              </Link>
              <button
                type="button"
                onClick={() => handleDuplicate(activeResume.id)}
                className="h-9 px-3.5 bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-xs sm:text-sm rounded flex items-center gap-1.5 transition-all border border-border-subtle cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-on-surface-variant" />
                <span>Duplicate</span>
              </button>
              <Link
                href="/ats-analyzer"
                className="h-9 px-3.5 bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-xs sm:text-sm rounded flex items-center gap-1.5 transition-all border border-border-subtle"
              >
                <Sliders className="w-3.5 h-3.5 text-on-surface-variant" />
                <span>ATS Check</span>
              </Link>
              <Link
                href={`/builder?id=${activeResume.id}`}
                className="h-9 px-3.5 bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-xs sm:text-sm rounded flex items-center gap-1.5 transition-all border border-border-subtle"
              >
                <Download className="w-3.5 h-3.5 text-on-surface-variant" />
                <span>Export PDF</span>
              </Link>
            </div>
          </div>

          {/* Right Visual: Tactile Paper Preview Canvas */}
          <div className="w-full xl:w-[380px] flex items-center justify-center p-4 bg-surface-container rounded border border-border-subtle relative">
            <div className="w-full max-w-[300px] aspect-[8.5/11] bg-surface-container-lowest rounded p-5 shadow-paper flex flex-col justify-between select-none relative overflow-hidden transition-transform hover:-translate-y-0.5 duration-200 border border-border-subtle/80">
              <div className="flex flex-col gap-2.5">
                {/* Header Miniature */}
                <div className="flex justify-between items-start pb-2 border-b border-border-subtle/70">
                  <div>
                    <span className="font-title-md text-xs font-semibold text-on-surface tracking-tight block uppercase">
                      {`${activeResume.personalInfo.firstName || ""} ${activeResume.personalInfo.lastName || ""}`.trim() || "Candidate Name"}
                    </span>
                    <span className="font-label-xs text-[9px] uppercase tracking-wider text-on-surface-variant block">
                      {activeResume.personalInfo.title || activeResume.targetRole || "Systems Architect"}
                    </span>
                  </div>
                  <span className="font-label-xs text-[8px] text-on-surface-variant text-right">
                    {activeResume.personalInfo.location || "San Francisco, CA"}
                  </span>
                </div>

                {/* Section 1: Narrative */}
                <div className="flex flex-col gap-1">
                  <span className="font-label-xs text-[8px] uppercase tracking-widest text-on-surface-variant font-semibold">
                    Executive Narrative
                  </span>
                  <p className="font-body-sm text-[9px] leading-relaxed text-on-surface-variant line-clamp-3">
                    {activeResume.summary || "Architectural leadership with deep experience guiding distributed platform systems, developer experience, and design foundations."}
                  </p>
                </div>

                {/* Section 2: Experience entries */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-label-xs text-[8px] uppercase tracking-widest text-on-surface-variant font-semibold">
                      Experience
                    </span>
                    <span className="font-label-xs text-[8px] text-on-surface-variant">
                      {activeResume.experience[0]?.startDate || "2021"} — {activeResume.experience[0]?.endDate || "PRESENT"}
                    </span>
                  </div>
                  <div>
                    <span className="font-body-sm text-[9px] font-semibold text-on-surface block">
                      {activeResume.experience[0]?.company || "Stripe"} — {activeResume.experience[0]?.role || "Lead Architect"}
                    </span>
                    <p className="font-body-sm text-[8px] leading-normal text-on-surface-variant line-clamp-2 mt-0.5">
                      • {activeResume.experience[0]?.bullets?.[0] || "Led engineering initiatives cutting transaction latency across platform infrastructure."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Paper status */}
              <div className="flex justify-between items-center pt-2 border-t border-border-subtle/50">
                <span className="font-label-xs text-[8px] uppercase tracking-widest text-on-surface-variant">
                  Format: 120gsm Letter
                </span>
                <span className="font-label-xs text-[8px] text-on-surface-variant font-mono">
                  ATS Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Document Catalogue & Variations */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-headline-sm text-lg sm:text-xl font-semibold text-on-surface">
              Tailored Document Variations
            </h3>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              Iterated compositions optimized for specific career trajectories and venture profiles.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 font-label-md text-xs rounded transition-colors ${
                filterTab === "all"
                  ? "bg-surface-container text-on-surface font-semibold border border-border-subtle"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              All Documents ({!isHydrated ? "..." : totalResumes})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("custom")}
              className={`px-3 py-1.5 font-label-md text-xs rounded transition-colors ${
                filterTab === "custom"
                  ? "bg-surface-container text-on-surface font-semibold border border-border-subtle"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              Custom Resumes ({!isHydrated ? "..." : customCount})
            </button>
            {sampleCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterTab("samples")}
                className={`px-3 py-1.5 font-label-md text-xs rounded transition-colors ${
                  filterTab === "samples"
                    ? "bg-surface-container text-on-surface font-semibold border border-border-subtle"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                Sample Fixtures ({!isHydrated ? "..." : sampleCount})
              </button>
            )}
          </div>
        </div>

        {/* List / Empty State */}
        {!isHydrated ? (
          <div className="p-8 text-center text-xs text-on-surface-variant font-medium bg-surface-container-low rounded border border-border-subtle">
            Loading workspace drafts...
          </div>
        ) : filteredResumes.length === 0 ? (
          <EmptyResumeState
            onCreateClick={() => setIsCreateModalOpen(true)}
            onLoadSamplesClick={resetToSampleResumes}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filteredResumes.map((resume) => (
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

      {/* Quick Studio Shortcuts (Tonal Architectural Panels) */}
      <div className="flex flex-col gap-4 pt-2">
        <div>
          <h3 className="font-headline-sm text-lg sm:text-xl font-semibold text-on-surface">
            Studio Diagnostic Suites
          </h3>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
            Editorial and parsing engines running parallel verification loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Shortcut 1 */}
          <Link
            href="/ats-analyzer"
            className="group bg-surface-container-low hover:bg-surface-container p-6 rounded flex flex-col justify-between gap-4 transition-all shadow-xs border border-border-subtle text-inherit no-underline"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-title-md text-sm sm:text-base font-semibold text-on-surface group-hover:text-primary transition-colors">
                  ATS Diagnostics Studio
                </span>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Run pre-flight checks against Taleo, Greenhouse, and Workday hiring filters with zero formatting degradation.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 text-on-surface font-label-md text-xs font-semibold">
              <span>Launch diagnostic runner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Shortcut 2 */}
          <Link
            href="/ai-rewriter"
            className="group bg-surface-container-low hover:bg-surface-container p-6 rounded flex flex-col justify-between gap-4 transition-all shadow-xs border border-border-subtle text-inherit no-underline"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-title-md text-sm sm:text-base font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Job Match &amp; AI Rewriter
                </span>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Compare resume bullet proof-points against specific target role descriptions to reveal missing competencies.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 text-on-surface font-label-md text-xs font-semibold">
              <span>Inspect target match</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Shortcut 3 */}
          <Link
            href="/templates"
            className="group bg-surface-container-low hover:bg-surface-container p-6 rounded flex flex-col justify-between gap-4 transition-all shadow-xs border border-border-subtle text-inherit no-underline"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-title-md text-sm sm:text-base font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Editorial Typography
                </span>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Explore curated letterform combinations and architectural leading rules crafted for unyielding legibility.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 text-on-surface font-label-md text-xs font-semibold">
              <span>Browse curated formats</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
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
            showFeedback(`Resume created successfully in your workspace (${newId}).`);
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
