"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useResumeStore } from "@/lib/storage";
import { Resume } from "@/types/resume";
import {
  RewriteGoalId,
  RewriteTarget,
  ProposalState,
  RewriteResponseBody,
} from "@/types/ai-rewriter";
import {
  extractRewriteTargets,
  applyRewriteToResume,
  isTargetFresh,
} from "@/lib/resume-field-mapper";
import { TargetSelector } from "@/components/ai-rewriter/TargetSelector";
import { GoalSelector } from "@/components/ai-rewriter/GoalSelector";
import { ComparisonView } from "@/components/ai-rewriter/ComparisonView";
import { RewriteActions } from "@/components/ai-rewriter/RewriteActions";
import { ProviderConfigNotice } from "@/components/ai-rewriter/ProviderConfigNotice";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  Edit3,
  Sparkles,
  FileText,
  AlertCircle,
  ShieldCheck,
  Search,
  Lock,
} from "lucide-react";

function AiRewriterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");

  const { resumes, isHydrated, updateResume } = useResumeStore();

  // Current resume derived directly from search param or first available
  const currentResume: Resume | undefined = useMemo(() => {
    if (!isHydrated || resumes.length === 0) return undefined;
    if (resumeIdParam) {
      return resumes.find((r) => r.id === resumeIdParam);
    }
    return resumes[0];
  }, [resumes, isHydrated, resumeIdParam]);

  // Extract all supported targets from current resume
  const targets = useMemo(() => {
    if (!currentResume) return [];
    return extractRewriteTargets(currentResume);
  }, [currentResume]);

  // Target selection state
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("");
  const [manualSourceOverride, setManualSourceOverride] = useState<{
    targetKey: string;
    text: string;
  } | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<RewriteGoalId>("action");
  const [jobContext, setJobContext] = useState<string>("");
  const [proposal, setProposal] = useState<ProposalState | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);

  // Check provider configuration on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/ai-rewriter")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && typeof data.configured === "boolean") {
          setProviderConfigured(data.configured);
        }
      })
      .catch(() => {
        if (isMounted) setProviderConfigured(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Active target key derived cleanly
  const activeTargetKey = useMemo(() => {
    if (targets.length === 0) return "";
    const exists = targets.find((t) => t.targetKey === selectedTargetKey);
    return exists ? exists.targetKey : targets[0].targetKey;
  }, [targets, selectedTargetKey]);

  // Active target object
  const activeTarget: RewriteTarget | undefined = useMemo(() => {
    return targets.find((t) => t.targetKey === activeTargetKey);
  }, [targets, activeTargetKey]);

  // Source text: uses manual edit if matching active target, otherwise active target's originalText
  const sourceText = useMemo(() => {
    if (manualSourceOverride && manualSourceOverride.targetKey === activeTargetKey) {
      return manualSourceOverride.text;
    }
    return activeTarget?.originalText || "";
  }, [manualSourceOverride, activeTargetKey, activeTarget]);

  // Check if active target is stale (i.e. edited after proposal generation)
  const isStale = useMemo(() => {
    if (!proposal || !currentResume || !activeTarget) return false;
    return !isTargetFresh(currentResume, activeTarget, proposal.originalText);
  }, [currentResume, activeTarget, proposal]);

  // Switch resume via dropdown
  const handleSelectResume = (id: string) => {
    setProposal(null);
    setApiError(null);
    setManualSourceOverride(null);
    router.push(`/ai-rewriter?id=${encodeURIComponent(id)}`, { scroll: false });
  };

  // Switch target section
  const handleSelectTarget = (targetKey: string) => {
    setSelectedTargetKey(targetKey);
    setManualSourceOverride(null);
    setProposal(null);
    setApiError(null);
  };

  // Request AI rewrite
  const handleGenerateRewrite = async () => {
    if (!sourceText.trim() || sourceText.trim().length < 5 || !activeTarget) {
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/ai-rewriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText.trim(),
          goal: selectedGoal,
          jobContext: jobContext.trim() || undefined,
          targetLabel: activeTarget.label,
        }),
      });

      const data: RewriteResponseBody = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === "PROVIDER_NOT_CONFIGURED") {
          setProviderConfigured(false);
        }
        setApiError(data.message || "Failed to generate rewrite.");
        return;
      }

      if (data.rewrittenText) {
        setProposal({
          targetKey: activeTarget.targetKey,
          originalText: sourceText.trim(),
          proposedText: data.rewrittenText,
          goal: selectedGoal,
          applied: false,
        });
      }
    } catch {
      setApiError("Network error calling AI Rewriter service. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply proposed rewrite to the active resume
  const handleApplyRewrite = async () => {
    if (!proposal || !currentResume || !activeTarget || isStale) {
      return;
    }

    try {
      const updatedResume = applyRewriteToResume(
        currentResume,
        activeTarget,
        proposal.proposedText
      );

      const success = await updateResume(currentResume.id, updatedResume);
      if (success) {
        setProposal((prev) => (prev ? { ...prev, applied: true } : null));
        setManualSourceOverride({
          targetKey: activeTarget.targetKey,
          text: proposal.proposedText,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply rewrite";
      setApiError(msg);
    }
  };

  // Reject / discard proposal
  const handleReject = () => {
    setProposal(null);
    setApiError(null);
  };

  // Undo applied rewrite and restore original text
  const handleUndo = async () => {
    if (!proposal || !currentResume || !activeTarget || !proposal.applied) {
      return;
    }

    try {
      const revertedResume = applyRewriteToResume(
        currentResume,
        activeTarget,
        proposal.originalText
      );

      const success = await updateResume(currentResume.id, revertedResume);
      if (success) {
        setProposal((prev) => (prev ? { ...prev, applied: false } : null));
        setManualSourceOverride({
          targetKey: activeTarget.targetKey,
          text: proposal.originalText,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to undo rewrite";
      setApiError(msg);
    }
  };

  // Loading state during SSR / initial hydration
  if (!isHydrated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
          Loading AI Rewriter workspace...
        </p>
      </div>
    );
  }

  // Empty state: No resumes exist in workspace
  if (resumes.length === 0) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center space-y-5 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40">
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mx-auto text-primary">
          <FileText className="w-6 h-6 text-secondary" />
        </div>
        <h2 className="font-title-md text-title-md text-on-surface">No Documents Found</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          You don&apos;t have any resumes in your workspace archive yet. Create a draft in the
          builder to begin tailoring achievements.
        </p>
        <Link href="/builder">
          <Button variant="primary" size="md">
            <Sparkles className="w-4 h-4 mr-2" />
            Create First Document
          </Button>
        </Link>
      </div>
    );
  }

  // Invalid ID state: ?id= was provided but no resume matches
  if (resumeIdParam && !currentResume) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center space-y-5 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-title-md text-title-md text-on-surface">Document Not Found</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          The requested resume ID (<code className="text-xs bg-surface-container px-1.5 py-0.5 rounded font-mono">{resumeIdParam}</code>) was not found in storage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSelectResume(resumes[0].id)}
          >
            Rewrite &quot;{resumes[0].title}&quot;
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Back to Workspace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentResume || !activeTarget) {
    return null;
  }

  return (
    <div className="space-y-space-xl pb-16">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center font-label-xs text-label-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Back to Workspace
            </Link>
            <span className="text-outline-variant/60 text-xs">•</span>
            <span className="px-2 py-0.5 bg-surface-container text-on-surface rounded font-label-xs text-[10px] uppercase tracking-wider font-semibold">
              AI Tailoring &amp; Differential Engine
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
              {currentResume.title}
            </h1>

            {/* Resume Selector Dropdown */}
            <select
              value={currentResume.id}
              onChange={(e) => handleSelectResume(e.target.value)}
              className="font-label-md text-label-md font-semibold bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1 text-on-surface hover:border-on-surface focus:outline-none transition-all cursor-pointer"
              aria-label="Select resume to rewrite"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.personalInfo.firstName || "Draft"})
                </option>
              ))}
            </select>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant">
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
          <Link href={`/builder?id=${encodeURIComponent(currentResume.id)}`}>
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Open in Editor
            </Button>
          </Link>
        </div>
      </div>

      {/* Provider Configuration Notice (if unconfigured) */}
      {providerConfigured === false && <ProviderConfigNotice />}

      {/* Main Workspace Layout (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (4 cols): Targeting, Goals, Optional Job Context */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Target Section Selector */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/40 shadow-xs space-y-3">
            <TargetSelector
              targets={targets}
              selectedKey={selectedTargetKey}
              onSelectKey={handleSelectTarget}
              disabled={isLoading}
            />

            <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/30 text-[11px] text-on-surface-variant flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Mapped Field:</strong> Changes will be committed precisely to &quot;{activeTarget.label}&quot; without altering other sections.
              </span>
            </div>
          </div>

          {/* Goal Selector */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/40 shadow-xs">
            <GoalSelector
              selectedGoal={selectedGoal}
              onSelectGoal={(goal) => {
                setSelectedGoal(goal);
                setProposal(null);
              }}
              disabled={isLoading}
            />
          </div>

          {/* Optional Job Context */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/40 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface font-semibold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-secondary" /> Target Requisition Context (Optional)
              </label>
              {jobContext && (
                <button
                  type="button"
                  onClick={() => {
                    setJobContext("");
                    if (proposal && !proposal.applied) setProposal(null);
                  }}
                  className="font-label-xs text-[11px] text-on-surface-variant hover:text-rose-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={jobContext}
              onChange={(e) => {
                setJobContext(e.target.value);
                if (proposal && !proposal.applied) setProposal(null);
              }}
              disabled={isLoading}
              rows={4}
              placeholder="Paste specific job requirements or responsibilities to tailor terminology..."
              className="w-full font-body-sm text-body-sm text-on-surface bg-surface-container-low border border-outline-variant/40 rounded p-2.5 focus:outline-none focus:border-on-surface transition-all resize-y placeholder:text-on-surface-variant/50"
            />

            <div className="font-label-xs text-label-xs text-on-surface-variant/70 italic flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Job context is used strictly for phrase alignment and is never stored permanently.</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Before-and-After Comparison & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Error Banner */}
          {apiError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 font-body-sm text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Rewrite Request Notice</p>
                <p className="leading-relaxed">{apiError}</p>
              </div>
            </div>
          )}

          {/* Comparison View */}
          <ComparisonView
            target={activeTarget}
            sourceText={sourceText}
            onSourceTextChange={(text) => {
              setManualSourceOverride({ targetKey: activeTargetKey, text });
              if (proposal) {
                setProposal(null);
              }
            }}
            proposal={proposal}
            isStale={isStale}
            isLoading={isLoading}
          />

          {/* Action Bar */}
          <RewriteActions
            proposal={proposal}
            isLoading={isLoading}
            canGenerate={sourceText.trim().length >= 5}
            isStale={isStale}
            onGenerate={handleGenerateRewrite}
            onApply={handleApplyRewrite}
            onReject={handleReject}
            onUndo={handleUndo}
          />

          {/* Privacy & Factual Guarantee Disclosure */}
          <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 text-body-sm text-on-surface-variant">
            <Lock className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed text-[12px]">
              <p className="font-semibold text-on-surface">Privacy &amp; Data Safeguards</p>
              <p>
                Only the selected section text and any supplied job context are transmitted to the server
                and configured OpenAI provider when generating a rewrite. Personal contact details, full resume
                content, and unrelated sections are never transmitted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiRewriterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
            Loading AI Rewriter Workspace...
          </p>
        </div>
      }
    >
      <AiRewriterContent />
    </Suspense>
  );
}
