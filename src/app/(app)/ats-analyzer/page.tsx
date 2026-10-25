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
  ChevronLeft,
  Edit3,
  Printer,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Upload,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
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
        <p className="text-sm text-on-surface-variant font-medium">
          Loading resume storage and analyzer diagnostics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Toolbar & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle no-print">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Back to Dashboard
            </Link>
            <span className="text-border-subtle text-xs">•</span>
            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[11px] uppercase tracking-wider font-bold">
              ATS Diagnostic Report
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            ATS Readiness &amp; Keyword Alignment
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Deterministic rule-based audit assessing scanner compatibility, section completeness, and keyword density.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          role="tablist"
          aria-label="ATS Analysis Mode"
          className="no-print flex items-center p-1 rounded-xl bg-surface-container border border-border-subtle shrink-0 self-start sm:self-auto"
        >
          <button
            type="button"
            role="tab"
            id="tab-mode-builder"
            data-testid="tab-mode-builder"
            aria-selected={activeMode === "builder"}
            onClick={() => handleSwitchMode("builder")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === "builder"
                ? "bg-surface text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Saved Builder Resume
          </button>

          <button
            type="button"
            role="tab"
            id="tab-mode-upload"
            data-testid="tab-mode-upload"
            aria-selected={activeMode === "upload"}
            onClick={() => handleSwitchMode("upload")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === "upload"
                ? "bg-surface text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Document (PDF / DOCX)
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE A: ANALYZE SAVED BUILDER RESUME
          ========================================================================= */}
      {activeMode === "builder" && (
        <>
          {/* Empty state: No builder resumes exist */}
          {resumes.length === 0 ? (
            <div className="py-20 max-w-lg mx-auto text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center mx-auto text-primary">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">No Builder Resumes Found</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                You have not created any structured resumes in the Builder yet. Create your first resume or switch to
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
            <div className="py-20 max-w-lg mx-auto text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Resume Not Found</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                The requested resume ID (<code className="text-xs bg-surface-container px-1.5 py-0.5 rounded font-mono">{resumeIdParam}</code>) was not found.
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
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Builder Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle/60 no-print">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                      {currentBuilderResume.title}
                    </h2>

                    {/* Resume Selector Dropdown */}
                    <select
                      value={currentBuilderResume.id}
                      onChange={(e) => handleSelectBuilderResume(e.target.value)}
                      className="text-xs font-semibold bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-on-surface hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                      aria-label="Select resume to analyze"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.personalInfo.firstName || "Draft"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    Targeting:{" "}
                    <strong className="text-on-surface">
                      {currentBuilderResume.targetRole || currentBuilderResume.personalInfo.title || "General Professional"}
                    </strong>{" "}
                    {currentBuilderResume.targetCompany && (
                      <>
                        at <strong className="text-on-surface">{currentBuilderResume.targetCompany}</strong>
                      </>
                    )}
                  </p>
                </div>

                <div className="no-print flex items-center gap-2.5 self-start sm:self-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.print()}
                    className="text-xs font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Export / Print Audit
                  </Button>

                  <Link href={`/builder?id=${encodeURIComponent(currentBuilderResume.id)}`}>
                    <Button variant="primary" size="sm" className="text-xs font-semibold">
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Resume
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Main Grid Layout for Builder Mode */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                  <ScoreHero readiness={builderReadiness} />

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

                  <KeywordMatchCard
                    jobMatch={builderJobMatch}
                    targetRole={currentBuilderResume.targetRole || currentBuilderResume.personalInfo.title}
                  />

                  <StructuralChecks checks={builderReadiness.checks} />
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <CategoryBreakdown categories={builderReadiness.categories} />

                  <ActionableFixes
                    fixes={builderReadiness.actionableFixes}
                    resumeId={currentBuilderResume.id}
                  />

                  <div className="bg-surface-container-low rounded-2xl p-6 border border-border-subtle/80 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4" /> Understanding ATS Scanners
                    </div>
                    <h4 className="text-sm font-bold text-on-surface">
                      How Applicant Tracking Systems Work
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Applicant Tracking Systems parse resumes into structured database entries. Clean headers,
                      valid contact details, and quantifiable achievement bullets ensure highest parsing fidelity.
                    </p>
                    <div className="pt-2 border-t border-border-subtle/60 text-[11px] text-on-surface-variant/80 italic leading-snug">
                      Notice: Rule-based heuristic calculations. No automated score can guarantee interviews or simulate every proprietary enterprise ranking algorithm.
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
        <div className="space-y-8">
          {/* Uploader Section */}
          <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Resume Document for ATS Analysis
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Upload your resume in PDF or Word (.docx) format. We will extract its text, audit its structural readiness,
                and compare it against an optional job description.
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
            <div className="pt-2 border-t border-border-subtle/60">
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
                      Analyze Uploaded Resume
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
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Extraction or Parsing Error</p>
                    <p className="text-xs text-red-800 leading-relaxed">{parseError}</p>
                    {parseErrorCode === "SCANNED_NO_TEXT" && (
                      <p className="text-[11px] text-red-700 font-medium pt-1">
                        Tip: Open your document in Microsoft Word, Google Docs, or Acrobat and re-export as a standard text-based PDF.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {saveError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
          </div>

          {/* Upload Analysis Results Grid */}
          {hasRunUploadAnalysis && uploadedReadiness && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (8 cols): Score Hero, Keyword Match, Extracted Preview, Checks */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Score Hero */}
                  <ScoreHero readiness={uploadedReadiness} />

                  {/* Keyword Match Card */}
                  <KeywordMatchCard jobMatch={uploadedJobMatch} />

                  {/* Extracted Text Preview */}
                  {extractedText && (
                    <ExtractedTextPreview
                      text={extractedText}
                      fileName={selectedFile?.name}
                      pageCount={extractedPageCount}
                    />
                  )}

                  {/* Structural & Content Checks */}
                  <StructuralChecks checks={uploadedReadiness.checks} />
                </div>

                {/* Right Column (4 cols): Category Breakdown, Actionable Fixes, Privacy Card */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Category Breakdown */}
                  <CategoryBreakdown categories={uploadedReadiness.categories} />

                  {/* Actionable Recommendations */}
                  <ActionableFixes fixes={uploadedReadiness.actionableFixes} />

                  {/* Privacy & Methodology Card */}
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-border-subtle/80 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4" /> Parsing Integrity &amp; Privacy
                    </div>
                    <h4 className="text-sm font-bold text-on-surface">
                      Document Security &amp; Isolation
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Your document was parsed into clean text to run rule-based heuristic checks.
                      Original files saved to your account are protected in private, authenticated cloud storage
                      isolated with PostgreSQL Row Level Security.
                    </p>
                    <div className="pt-2 border-t border-border-subtle/60 text-[11px] text-on-surface-variant/80 italic leading-snug">
                      Notice: File-based analysis tests raw document text. It is separate from structured Builder resumes.
                    </div>
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
          <p className="text-sm text-on-surface-variant font-medium">
            Loading ATS Diagnostic Workspace...
          </p>
        </div>
      }
    >
      <AtsAnalyzerContent />
    </Suspense>
  );
}
