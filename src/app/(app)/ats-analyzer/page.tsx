"use client";

import React, { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useResumeStore } from "@/lib/storage";
import { useAuth } from "@/components/auth/AuthProvider";
import { Resume } from "@/types/resume";
import {
  analyzeResumeReadiness,
  analyzeJobMatch,
  JobMatchResult,
} from "@/lib/ats-analysis";
import type { UploadedReadinessResult } from "@/lib/uploaded-ats-analysis";
import {
  parseResumeDocument,
  persistUploadedAnalysis,
  fetchUserUploadedAnalyses,
  deleteUserUploadedAnalysis,
  type UploadedResumeAnalysis,
} from "@/lib/uploaded-analysis-service";

import { ScoreHero } from "@/components/analyzer/ScoreHero";
import { JobDescriptionInput } from "@/components/analyzer/JobDescriptionInput";
import { KeywordMatchCard } from "@/components/analyzer/KeywordMatchCard";
import { StructuralChecks } from "@/components/analyzer/StructuralChecks";
import { CategoryBreakdown } from "@/components/analyzer/CategoryBreakdown";
import { ActionableFixes } from "@/components/analyzer/ActionableFixes";
import { ResumeUploadDropzone } from "@/components/analyzer/ResumeUploadDropzone";
import { ExtractedTextPreview } from "@/components/analyzer/ExtractedTextPreview";
import { UploadedHistoryList } from "@/components/analyzer/UploadedHistoryList";
import { Button } from "@/components/ui/Button";

import {
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Upload,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Share2,
  Wand2,
} from "lucide-react";

type AnalyzerMode = "builder" | "upload";

function AtsAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");
  const { resumes, isHydrated } = useResumeStore();
  const { user, isConfigured } = useAuth();

  // Mode Selection: derived directly from URL query parameters (defaulting to "builder")
  const urlMode = searchParams.get("mode");
  const activeMode: AnalyzerMode = urlMode === "upload" ? "upload" : "builder";

  // --------------------------------------------------------------------------
  // MODE A: Saved Builder Resume State
  // --------------------------------------------------------------------------
  const [builderJd, setBuilderJd] = useState<string>("");
  const [hasAnalyzedBuilderJd, setHasAnalyzedBuilderJd] = useState<boolean>(false);

  const currentBuilderResume: Resume | undefined = useMemo(() => {
    if (!isHydrated || resumes.length === 0) return undefined;
    if (resumeIdParam) {
      return resumes.find((r) => r.id === resumeIdParam);
    }
    return resumes[0];
  }, [resumes, isHydrated, resumeIdParam]);

  const handleSelectBuilderResume = (id: string) => {
    router.push(`/ats-analyzer?mode=builder&id=${encodeURIComponent(id)}`, { scroll: false });
  };

  const builderReadiness = useMemo(() => {
    if (!currentBuilderResume) return null;
    return analyzeResumeReadiness(currentBuilderResume);
  }, [currentBuilderResume]);

  const builderJobMatch: JobMatchResult | null = useMemo(() => {
    if (!currentBuilderResume || !hasAnalyzedBuilderJd || builderJd.trim().length < 20) {
      return null;
    }
    return analyzeJobMatch(currentBuilderResume, builderJd);
  }, [currentBuilderResume, hasAnalyzedBuilderJd, builderJd]);

  // --------------------------------------------------------------------------
  // MODE B: Upload Document State
  // --------------------------------------------------------------------------
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadJd, setUploadJd] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseErrorCode, setParseErrorCode] = useState<string | null>(null);

  // Extracted Document Data
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedPageCount, setExtractedPageCount] = useState<number | undefined>(undefined);
  const [uploadedReadiness, setUploadedReadiness] = useState<UploadedReadinessResult | null>(null);
  const [uploadedJobMatch, setUploadedJobMatch] = useState<JobMatchResult | null>(null);
  const [hasRunUploadAnalysis, setHasRunUploadAnalysis] = useState<boolean>(false);

  // Cloud Persistence State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

  // History State
  const [savedAnalyses, setSavedAnalyses] = useState<UploadedResumeAnalysis[]>([]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Reload history helper for user actions
  const refreshSavedHistory = useCallback(async () => {
    if (user && isConfigured) {
      try {
        const history = await fetchUserUploadedAnalyses();
        setSavedAnalyses(history);
      } catch {
        // Ignore background error
      }
    }
  }, [user, isConfigured]);

  // Load history on mount or when user changes
  useEffect(() => {
    let isCancelled = false;

    if (user && isConfigured) {
      fetchUserUploadedAnalyses()
        .then((history) => {
          if (!isCancelled) {
            setSavedAnalyses(history);
          }
        })
        .catch(() => {
          // Ignore background fetch error
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [user, isConfigured]);

  const handleSwitchMode = (mode: AnalyzerMode) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("mode", mode);
    router.push(`/ats-analyzer?${query.toString()}`, { scroll: false });
  };

  // Upload Actions
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParseErrorCode(null);
    setExtractedText(null);
    setUploadedReadiness(null);
    setUploadedJobMatch(null);
    setHasRunUploadAnalysis(false);
    setSaveSuccess(false);
    setSaveError(null);
    setSavedAnalysisId(null);
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    setParseError(null);
    setParseErrorCode(null);
    setExtractedText(null);
    setUploadedReadiness(null);
    setUploadedJobMatch(null);
    setHasRunUploadAnalysis(false);
    setSaveSuccess(false);
    setSaveError(null);
    setSavedAnalysisId(null);
  };

  const handleRunUploadAnalysis = async () => {
    if (!selectedFile) return;

    setIsParsing(true);
    setParseError(null);
    setParseErrorCode(null);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const result = await parseResumeDocument(selectedFile, uploadJd);

      if (!result.success || !result.text || !result.readiness) {
        setParseError(result.error || "Failed to extract and analyze resume.");
        setParseErrorCode(result.errorCode || "CORRUPT_DOCUMENT");
        setIsParsing(false);
        return;
      }

      setExtractedText(result.text);
      setExtractedPageCount(result.pageCount);
      setUploadedReadiness(result.readiness);
      setUploadedJobMatch(result.jobMatch || null);
      setHasRunUploadAnalysis(true);
      setIsParsing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document analysis failed";
      setParseError(msg);
      setParseErrorCode("INTERNAL_ERROR");
      setIsParsing(false);
    }
  };

  const handleSaveToAccount = async () => {
    if (!selectedFile || !uploadedReadiness) return;
    if (!user || !isConfigured) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await persistUploadedAnalysis(selectedFile, uploadJd);
      if (result.success && result.analysis) {
        setSaveSuccess(true);
        setSavedAnalysisId(result.analysis.id);
        void refreshSavedHistory();
      } else {
        setSaveError(result.error || "Failed to save analysis to your account.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectHistoryItem = (item: UploadedResumeAnalysis) => {
    setSavedAnalysisId(item.id);
    setExtractedText(item.extracted_text);
    setUploadedReadiness(item.analysis_results?.readiness || null);
    setUploadedJobMatch(item.analysis_results?.jobMatch || null);
    setExtractedPageCount(item.analysis_results?.pageCount || 1);
    setUploadJd(item.job_description || "");
    setHasRunUploadAnalysis(true);
    setSaveSuccess(true);
    // Scroll to results
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved analysis and its associated file?")) {
      return;
    }

    setIsDeletingId(id);
    const success = await deleteUserUploadedAnalysis(id);
    setIsDeletingId(null);

    if (success) {
      setSavedAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (savedAnalysisId === id) {
        setSavedAnalysisId(null);
        setSaveSuccess(false);
      }
    } else {
      alert("Failed to delete analysis. Please try again.");
    }
  };

  // Loading state during SSR / initial client hydration
  if (!isHydrated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
          Loading resume storage and analyzer diagnostics...
        </p>
      </div>
    );
  }

  const fixCount = builderReadiness?.actionableFixes.length ?? 0;
  const targetLabel = currentBuilderResume?.targetRole || currentBuilderResume?.personalInfo.title || "Staff Product Designer / Systems";

  return (
    <div className="space-y-space-xl pb-16">
      {/* Top Banner Toolbar & Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg no-print">
        <div className="max-w-3xl flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
              Engine v4.2 Diagnostic
            </span>
            <span className="font-label-xs text-label-xs text-on-surface-variant">•</span>
            <span className="font-label-xs text-label-xs text-on-surface-variant tracking-normal">
              Target: {targetLabel}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Make your experience easier to understand.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Restrained resume diagnostics evaluating structural parse fidelity, semantic keyword density, and human readability. No gamified tricks or artificial inflation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-space-md rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-2xs border border-outline-variant/30 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-secondary" />
            <span>Export ATS Report</span>
          </button>

          {currentBuilderResume && (
            <Link
              href={`/builder?id=${encodeURIComponent(currentBuilderResume.id)}`}
              className="h-10 px-space-md rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors flex items-center gap-space-xs shadow-sm no-underline"
            >
              <Wand2 className="w-4 h-4" />
              <span>
                {fixCount > 0 ? `Return to Editor to Apply ${fixCount} Fixes` : "Open Live Editor"}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        role="tablist"
        aria-label="ATS Analysis Mode"
        className="no-print flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/40 shrink-0 self-start w-fit"
      >
        <button
          type="button"
          role="tab"
          id="tab-mode-builder"
          data-testid="tab-mode-builder"
          aria-selected={activeMode === "builder"}
          onClick={() => handleSwitchMode("builder")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-xs text-label-xs font-semibold transition-all cursor-pointer ${
            activeMode === "builder"
              ? "bg-primary text-white shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Saved Workspace Document</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-mode-upload"
          data-testid="tab-mode-upload"
          aria-selected={activeMode === "upload"}
          onClick={() => handleSwitchMode("upload")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-label-xs text-label-xs font-semibold transition-all cursor-pointer ${
            activeMode === "upload"
              ? "bg-primary text-white shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document (PDF / DOCX)</span>
        </button>
      </div>

      {/* =========================================================================
          MODE A: ANALYZE SAVED BUILDER RESUME
          ========================================================================= */}
      {activeMode === "builder" && (
        <>
          {/* Empty state: No builder resumes exist */}
          {resumes.length === 0 ? (
            <div className="py-20 max-w-lg mx-auto text-center space-y-5 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto text-primary">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-title-md font-title-md text-on-surface">No Workspace Documents Found</h2>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                You have not created any structured resumes in the Workspace yet. Create your first resume or switch to
                Upload mode to analyze an existing PDF or DOCX file.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/builder">
                  <Button variant="primary" size="md">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create First Resume
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleSwitchMode("upload")}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF or DOCX
                </Button>
              </div>
            </div>
          ) : !currentBuilderResume || !builderReadiness ? (
            /* Invalid ID state: ?id= was provided but no resume matches */
            <div className="py-20 max-w-lg mx-auto text-center space-y-5 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-title-md font-title-md text-on-surface">Document Not Found</h2>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                The requested resume ID (<code className="text-xs bg-surface-container px-1.5 py-0.5 rounded font-mono">{resumeIdParam}</code>) was not found in your workspace archive.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSelectBuilderResume(resumes[0].id)}
                >
                  Analyze &quot;{resumes[0].title}&quot;
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Back to Workspace
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-space-lg">
              {/* Document Selector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30 no-print">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-title-md text-title-md font-semibold text-on-surface tracking-tight">
                    Active Document:
                  </h2>
                  <select
                    value={currentBuilderResume.id}
                    onChange={(e) => handleSelectBuilderResume(e.target.value)}
                    className="font-label-md text-label-md font-semibold bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1 text-on-surface hover:border-on-surface focus:outline-none transition-all cursor-pointer"
                    aria-label="Select resume to analyze"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.personalInfo.firstName || "Draft"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-label-xs font-label-xs text-on-surface-variant font-mono">
                  Format: {currentBuilderResume.templateId} • A4 Standard
                </div>
              </div>

              {/* Compatibility Estimate Hero */}
              <ScoreHero readiness={builderReadiness} />

              {/* Main Grid Layout for Builder Mode */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                <div className="lg:col-span-7 flex flex-col gap-space-lg">
                  {/* Structural & Formatting Architecture */}
                  <StructuralChecks checks={builderReadiness.checks} />

                  {/* Target Requisition Input */}
                  <JobDescriptionInput
                    jobDescription={builderJd}
                    onJobDescriptionChange={(text) => {
                      setBuilderJd(text);
                      if (text.trim().length === 0) setHasAnalyzedBuilderJd(false);
                    }}
                    onAnalyze={() => {
                      if (builderJd.trim().length >= 20) setHasAnalyzedBuilderJd(true);
                    }}
                    isAnalyzed={hasAnalyzedBuilderJd}
                  />

                  {/* Keyword Alignment Card */}
                  <KeywordMatchCard
                    jobMatch={builderJobMatch}
                    targetRole={currentBuilderResume.targetRole || currentBuilderResume.personalInfo.title}
                  />
                </div>

                <div className="lg:col-span-5 flex flex-col gap-space-lg">
                  {/* Category Breakdown */}
                  <CategoryBreakdown categories={builderReadiness.categories} />

                  {/* High-Value Opportunities */}
                  <ActionableFixes
                    fixes={builderReadiness.actionableFixes}
                    resumeId={currentBuilderResume.id}
                  />

                  {/* Methodological Transparency Card */}
                  <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-xs text-label-xs uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                      <span>Scanner Methodology</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Applicant Tracking Systems evaluate clean hierarchical structure, verifiable action outcomes, and standard header taxonomy.
                    </p>
                    <div className="pt-2 border-t border-outline-variant/30 font-label-xs text-label-xs text-on-surface-variant/70 italic leading-snug">
                      Notice: Rule-based heuristic calculations. No automated score can simulate proprietary human review.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          MODE B: UPLOAD EXISTING RESUME (PDF / DOCX)
          ========================================================================= */}
      {activeMode === "upload" && (
        <div className="space-y-space-lg">
          {/* Uploader Section */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/40 shadow-xs flex flex-col gap-space-md">
            <div className="space-y-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <Upload className="w-5 h-5 text-secondary" />
                <span>Upload Document for Parse Extraction</span>
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Upload your resume in PDF or Word (.docx) format. We will extract its text, audit its structural readiness,
                and compare it against an optional job requisition.
              </p>
            </div>

            {/* Dropzone */}
            <ResumeUploadDropzone
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileClear={handleFileClear}
              isProcessing={isParsing || isSaving}
            />

            {/* Optional Job Description Input */}
            <div className="pt-2 border-t border-outline-variant/30">
              <JobDescriptionInput
                jobDescription={uploadJd}
                onJobDescriptionChange={(text) => {
                  setUploadJd(text);
                }}
                onAnalyze={handleRunUploadAnalysis}
                isAnalyzed={hasRunUploadAnalysis && Boolean(uploadedJobMatch)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleRunUploadAnalysis}
                  disabled={!selectedFile || isParsing}
                  className="font-bold text-xs sm:text-sm"
                >
                  {isParsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Extracting &amp; Auditing Text...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Uploaded Document
                    </>
                  )}
                </Button>

                {hasRunUploadAnalysis && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleFileClear}
                    disabled={isParsing || isSaving}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Clear / New Upload
                  </Button>
                )}
              </div>

              {/* Save to Account Button (if authenticated and analyzed) */}
              {hasRunUploadAnalysis && user && isConfigured && (
                <div className="flex items-center gap-2">
                  {saveSuccess ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-[#276a45] border border-outline-variant/40 font-label-xs text-label-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Saved to Cloud Account
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveToAccount}
                      disabled={isSaving}
                      className="text-xs font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1.5" />
                          Saving to Account...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-1.5 text-primary" />
                          Save Analysis to Account
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Error Message Display */}
            {parseError && (
              <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-body-sm space-y-1">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-body-sm">Extraction or Parsing Error</p>
                    <p className="text-[12px] leading-relaxed">{parseError}</p>
                    {parseErrorCode === "SCANNED_NO_TEXT" && (
                      <p className="text-[11px] text-rose-700 font-medium pt-0.5">
                        Tip: Open your document in Microsoft Word, Google Docs, or Acrobat and re-export as a standard text-based PDF.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-800 text-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
          </div>

          {/* Upload Analysis Results Grid */}
          {hasRunUploadAnalysis && uploadedReadiness && (
            <div className="space-y-space-lg animate-in fade-in duration-300">
              <ScoreHero readiness={uploadedReadiness} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                {/* Left Column (7 cols): Keyword Match, Extracted Preview, Checks */}
                <div className="lg:col-span-7 flex flex-col gap-space-lg">
                  <KeywordMatchCard jobMatch={uploadedJobMatch} />

                  {extractedText && (
                    <ExtractedTextPreview
                      text={extractedText}
                      fileName={selectedFile?.name}
                      pageCount={extractedPageCount}
                    />
                  )}

                  <StructuralChecks checks={uploadedReadiness.checks} />
                </div>

                {/* Right Column (5 cols): Category Breakdown, Actionable Fixes, Privacy Card */}
                <div className="lg:col-span-5 flex flex-col gap-space-lg">
                  <CategoryBreakdown categories={uploadedReadiness.categories} />
                  <ActionableFixes fixes={uploadedReadiness.actionableFixes} />

                  <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-on-surface font-semibold font-label-xs text-label-xs uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                      <span>Document Security &amp; Isolation</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Your document was parsed into clean text to run rule-based heuristic checks.
                      Original files saved to your account are protected in private, authenticated cloud storage
                      isolated with PostgreSQL Row Level Security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saved Upload History List */}
          {savedAnalyses.length > 0 && (
            <UploadedHistoryList
              analyses={savedAnalyses}
              activeId={savedAnalysisId || undefined}
              onSelectAnalysis={handleSelectHistoryItem}
              onDeleteAnalysis={handleDeleteHistoryItem}
              isDeletingId={isDeletingId}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function AtsAnalyzerPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
            Loading ATS Diagnostic Workspace...
          </p>
        </div>
      }
    >
      <AtsAnalyzerContent />
    </Suspense>
  );
}
