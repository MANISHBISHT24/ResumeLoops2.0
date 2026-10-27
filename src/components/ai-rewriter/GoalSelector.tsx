"use client";

import React from "react";
import { RewriteGoalId } from "@/types/ai-rewriter";
import { Wand2, Zap, Briefcase, Sparkles, Feather } from "lucide-react";

interface GoalSelectorProps {
  selectedGoal: RewriteGoalId;
  onSelectGoal: (goal: RewriteGoalId) => void;
  disabled?: boolean;
}

const REWRITE_GOALS: {
  id: RewriteGoalId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "action",
    label: "Stronger Action Verbs",
    description: "Lead with high-impact ownership verbs (Architected, Spearheaded, Engineered).",
    icon: Zap,
  },
  {
    id: "professional",
    label: "More Professional",
    description: "Elevate vocabulary with an articulate executive tone for senior reviewers.",
    icon: Briefcase,
  },
  {
    id: "concise",
    label: "More Concise",
    description: "Eliminate filler phrases and passive wording for faster recruiter reading.",
    icon: Feather,
  },
  {
    id: "clear",
    label: "Clearer Wording",
    description: "Streamline convoluted phrasing and improve syntactic clarity.",
    icon: Sparkles,
  },
  {
    id: "tailored",
    label: "Tailored to Job",
    description: "Align domain terminology with target job requirements where supported.",
    icon: Wand2,
  },
];

export function GoalSelector({
  selectedGoal,
  onSelectGoal,
  disabled,
}: GoalSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-semibold flex items-center justify-between">
        <span>Rewrite Objective</span>
        <span className="font-mono text-[11px] font-normal text-on-surface-variant/70">
          Optimization Vector
        </span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {REWRITE_GOALS.map((g) => {
          const Icon = g.icon;
          const isSelected = selectedGoal === g.id;

          return (
            <button
              key={g.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectGoal(g.id)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between space-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-surface-container-highest border-on-surface text-on-surface shadow-2xs"
                  : "bg-surface-container-lowest hover:bg-surface-container-low border-outline-variant/40 text-on-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-title-md text-body-sm font-semibold flex items-center gap-1.5 text-on-surface">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-secondary"}`} />
                  {g.label}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant leading-snug">
                {g.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
