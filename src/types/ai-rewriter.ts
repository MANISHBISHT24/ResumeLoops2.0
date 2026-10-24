/**
 * ResumeLoops AI Rewriter Types
 * Defines data structures for section targeting, rewrite goals, and proposal management.
 */

export type RewriteGoalId =
  | "professional"
  | "concise"
  | "action"
  | "clear"
  | "tailored";

export interface RewriteGoal {
  id: RewriteGoalId;
  label: string;
  description: string;
  badge: string;
}

export type RewriteSectionType =
  | "headline"
  | "summary"
  | "experience-bullet"
  | "project-description";

export interface RewriteTarget {
  targetKey: string;
  sectionType: RewriteSectionType;
  label: string;
  subtitle: string;
  originalText: string;
  meta: {
    expId?: string;
    bulletIndex?: number;
    projectId?: string;
  };
}

export interface RewriteRequestBody {
  text: string;
  goal: RewriteGoalId;
  jobContext?: string;
  targetLabel?: string;
}

export interface RewriteResponseBody {
  success: boolean;
  rewrittenText?: string;
  factualCaution?: string;
  modelUsed?: string;
  error?: "PROVIDER_NOT_CONFIGURED" | "INVALID_INPUT" | "RATE_LIMITED" | "PROVIDER_ERROR" | "TIMEOUT";
  message?: string;
}

export interface ProposalState {
  targetKey: string;
  originalText: string;
  proposedText: string;
  goal: RewriteGoalId;
  applied: boolean;
  appliedAt?: string;
  previousText?: string;
}
