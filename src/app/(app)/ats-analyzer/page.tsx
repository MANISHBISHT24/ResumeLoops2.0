"use client";

import React, { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useResumeStore } from "@/lib/storage";
import { Resume } from "@/types/resume";
import { analyzeResumeReadiness, analyzeJobMatch, JobMatchResult } from "@/lib/ats-analysis";
import { ScoreHero } from "@/components/analyzer/ScoreHero";
import { JobDescriptionInput } from "@/components/analyzer/JobDescriptionInput";
import { KeywordMatchCard } from "@/components/analyzer/KeywordMatchCard";
import { StructuralChecks } from "@/components/analyzer/StructuralChecks";
import { CategoryBreakdown } from "@/components/analyzer/CategoryBreakdown";
import { ActionableFixes } from "@/components/analyzer/ActionableFixes";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  Edit3,
  Printer,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

function AtsAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");

  const { resumes, isHydrated } = useResumeStore();

  const [jobDescription, setJobDescription] = useState<string>("");
  const [hasAnalyzedJd, setHasAnalyzedJd] = useState<boolean>(false);

  // Derive current resume directly from URL param or default to first available
  const currentResume: Resume | undefined = useMemo(() => {
    if (!isHydrated || resumes.length === 0) return undefined;
    if (resumeIdParam) {
      return resumes.find((r) => r.id === resumeIdParam);
    }
    return resumes[0];
  }, [resumes, isHydrated, resumeIdParam]);

  // Handle switching resumes via dropdown
  const handleSelectResume = (id: string) => {
    router.push(`/ats-analyzer?id=${encodeURIComponent(id)}`, { scroll: false });
  };

  // Compute deterministic resume readiness
  const readiness = useMemo(() => {
    if (!currentResume) return null;
    return analyzeResumeReadiness(currentResume);
  }, [currentResume]);

  // Compute job keyword match when analyzed
  const jobMatchResult: JobMatchResult | null = useMemo(() => {
    if (!currentResume || !hasAnalyzedJd || jobDescription.trim().length < 20) {
      return null;
    }
    return analyzeJobMatch(currentResume, jobDescription);
  }, [currentResume, hasAnalyzedJd, jobDescription]);

  const handleRunJobAnalysis = () => {
    if (jobDescription.trim().length >= 20) {
      setHasAnalyzedJd(true);
    }
  };

  const handleJobDescriptionChange = (text: string) => {
    setJobDescription(text);
    if (text.trim().length === 0) {
      setHasAnalyzedJd(false);
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

  // Empty state: No resumes exist
  if (resumes.length === 0) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center mx-auto text-primary">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface">No Resumes Found</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          The ATS Analyzer evaluates structured resume content. Create or customize your first
          resume in the builder to run automated compatibility audits.
        </p>
        <Link href="/builder">
          <Button variant="primary" size="md">
            <Sparkles className="w-4 h-4 mr-2" />
            Create First Resume
          </Button>
        </Link>
      </div>
    );
  }

  // Invalid ID state: ?id= was provided but no resume matches
  if (resumeIdParam && !currentResume) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface">Resume Not Found</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          The requested resume ID (<code className="text-xs bg-surface-container px-1.5 py-0.5 rounded font-mono">{resumeIdParam}</code>) does not exist in local storage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSelectResume(resumes[0].id)}
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
    );
  }

  if (!currentResume || !readiness) {
    return null;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle no-print">
        <div className="space-y-1">
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

          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              {currentResume.title}
            </h1>

            {/* Resume Selector Dropdown */}
            <select
              value={currentResume.id}
              onChange={(e) => handleSelectResume(e.target.value)}
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
              {currentResume.targetRole || currentResume.personalInfo.title || "General Professional"}
            </strong>{" "}
            {currentResume.targetCompany && (
              <>
                at <strong className="text-on-surface">{currentResume.targetCompany}</strong>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Export / Print Audit
          </Button>

          <Link href={`/builder?id=${encodeURIComponent(currentResume.id)}`}>
            <Button variant="primary" size="sm" className="text-xs font-semibold">
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Score Hero, Job Match, Structural Checks */}
        <div className="lg:col-span-8 space-y-8">
          {/* Circular Score Hero */}
          <ScoreHero readiness={readiness} />

          {/* Job Description Input & Keyword Extraction */}
          <JobDescriptionInput
            jobDescription={jobDescription}
            onJobDescriptionChange={handleJobDescriptionChange}
            onAnalyze={handleRunJobAnalysis}
            isAnalyzed={hasAnalyzedJd}
          />

          {/* Keyword Match Breakdown */}
          <KeywordMatchCard
            jobMatch={jobMatchResult}
            targetRole={currentResume.targetRole || currentResume.personalInfo.title}
          />

          {/* Structural & Formatting Compliance Grid */}
          <StructuralChecks checks={readiness.checks} />
        </div>

        {/* Right Column (4 cols): Category Breakdown, Actionable Fixes, Educational Notes */}
        <div className="lg:col-span-4 space-y-8">
          {/* Category-Level Score Breakdown */}
          <CategoryBreakdown categories={readiness.categories} />

          {/* Prioritized Actionable Recommendations */}
          <ActionableFixes
            fixes={readiness.actionableFixes}
            resumeId={currentResume.id}
          />

          {/* Honest ATS Educational Card */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-border-subtle/80 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" /> Understanding ATS Scanners
            </div>
            <h4 className="text-sm font-bold text-on-surface">
              How Applicant Tracking Systems Work
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Applicant Tracking Systems (e.g. Workday, Greenhouse, Lever) parse resumes into structured
              database entries for recruiters. Standard headers, clean contact info, and clear bullet points
              ensure high parsing accuracy.
            </p>
            <div className="pt-2 border-t border-border-subtle/60 text-[11px] text-on-surface-variant/80 italic leading-snug">
              Notice: This tool performs rule-based heuristic calculations. No automated score can guarantee an
              interview or simulate all proprietary enterprise ranking algorithms.
            </div>
          </div>
        </div>
      </div>
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
