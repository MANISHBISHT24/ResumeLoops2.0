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

  // Apply proposal directly to stored resume
  const handleApplyRewrite = () => {
    if (!proposal || !activeTarget || !currentResume || isStale) return;

    const previous = activeTarget.originalText;
    const updated = applyRewriteToResume(currentResume, activeTarget, proposal.proposedText);
    updateResume(currentResume.id, updated);

    // Update proposal state
    setProposal({
      ...proposal,
      applied: true,
      previousText: previous,
    });
    setManualSourceOverride({ targetKey: activeTarget.targetKey, text: proposal.proposedText });
  };

  // Discard proposal
  const handleReject = () => {
    setProposal(null);
    setApiError(null);
  };

  // Undo applied rewrite
  const handleUndo = () => {
    if (!proposal?.previousText || !activeTarget || !currentResume) return;

    const reverted = applyRewriteToResume(currentResume, activeTarget, proposal.previousText);
    updateResume(currentResume.id, reverted);

    setProposal({
      ...proposal,
      applied: false,
    });
    setManualSourceOverride({ targetKey: activeTarget.targetKey, text: proposal.previousText });
  };

  // Loading state during SSR / client hydration
  if (!isHydrated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-on-surface-variant font-medium">
          Loading AI Rewriter workspace...
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
          The AI Rewriter refines existing structured resume drafts. Create your first resume in the
          builder to begin tailoring achievements.
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
              Back to Dashboard
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
    <div className="space-y-8 pb-16">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
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
              AI Tailoring &amp; Smart Rewriter
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
              aria-label="Select resume to rewrite"
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
          <Link href={`/builder?id=${encodeURIComponent(currentResume.id)}`}>
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Open in Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* Provider Configuration Notice (if unconfigured) */}
      {providerConfigured === false && <ProviderConfigNotice />}

      {/* Main Workspace Layout (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): Targeting, Goals, Optional Job Context */}
        <div className="lg:col-span-4 space-y-6">
          {/* Target Section Selector */}
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-sm space-y-4">
            <TargetSelector
              targets={targets}
              selectedKey={selectedTargetKey}
              onSelectKey={handleSelectTarget}
              disabled={isLoading}
            />

            <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle/80 text-[11px] text-on-surface-variant flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Mapped Field:</strong> Changes will be committed precisely to &quot;{activeTarget.label}&quot; without altering other sections.
              </span>
            </div>
          </div>

          {/* Goal Selector */}
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-sm">
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
          <div className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary" /> Target Job Context (Optional)
              </label>
              {jobContext && (
                <button
                  type="button"
                  onClick={() => setJobContext("")}
                  className="text-[11px] text-on-surface-variant hover:text-error cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={jobContext}
              onChange={(e) => setJobContext(e.target.value)}
              disabled={isLoading}
              rows={4}
              placeholder="Paste specific job requirements or responsibilities to tailor terminology..."
              className="w-full text-xs font-normal text-on-surface bg-surface-container-lowest border border-border-subtle rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y placeholder:text-on-surface-variant/50"
            />

            <div className="text-[11px] text-on-surface-variant/70 italic flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Job context is used strictly for phrase alignment and is never stored permanently.</span>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Before-and-After Comparison & Actions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Error Banner */}
          {apiError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Rewrite Request Notice</p>
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
          <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle/80 flex items-start gap-3 text-xs text-on-surface-variant">
            <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
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
          <p className="text-sm text-on-surface-variant font-medium">
            Loading AI Rewriter Workspace...
          </p>
        </div>
      }
    >
      <AiRewriterContent />
    </Suspense>
  );
}
