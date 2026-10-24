/**
 * ResumeLoops Canonical Templates Catalog
 * Single source of truth for template metadata, styling characteristics, and safe ID resolution.
 *
 * All four templates are engineered with publication-grade typography and single-column ATS compatibility:
 * 1. swiss-chronicle: Editorial Serif hierarchy for leadership and staff roles.
 * 2. stripe-mono: Monospaced metadata and high scanning velocity for tech/systems roles.
 * 3. linear-grid: Modern structured sans with accent indicator markers for product/UI roles.
 * 4. classic-oxford: Centered masthead traditional single-column for corporate/academic roles.
 */

import type { Resume, TemplateId } from "../types/resume";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: "Executive" | "Minimal" | "Modern" | "Professional";
  description: string;
  fontStyle: string;
  layoutStructure: string;
  bestFor: string;
  atsHighlights: string[];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "swiss-chronicle",
    name: "The Swiss Chronicle",
    category: "Executive",
    description:
      "A masterclass in editorial typography and structured hierarchy, built for senior engineering leadership, staff engineers, and directors.",
    fontStyle: "Editorial Serif & Structured Headings",
    layoutStructure: "Single-column linear hierarchy with crisp dividers",
    bestFor: "Engineering Directors, Staff/Principal Engineers, VP of Engineering",
    atsHighlights: [
      "Standard semantic heading hierarchy",
      "Linear top-to-bottom parse stream",
      "Zero graphic parsing obstacles",
    ],
  },
  {
    id: "stripe-mono",
    name: "Stripe Mono",
    category: "Minimal",
    description:
      "Ultra-clean structural layout emphasizing whitespace, monospaced metadata, and high scanning velocity for technology firms.",
    fontStyle: "Clean Sans-Serif with Monospaced Metadata",
    layoutStructure: "Left-aligned minimal layout with monospace date tokens",
    bestFor: "Full-Stack Developers, Cloud Architects, Systems Engineers",
    atsHighlights: [
      "Monospace date and contact tokens",
      "High-contrast section separation",
      "Single-column flow with bullet safety",
    ],
  },
  {
    id: "linear-grid",
    name: "Linear Grid",
    category: "Modern",
    description:
      "Precision-engineered layout inspired by modern developer tooling interfaces and product engineering platforms.",
    fontStyle: "Modern Geometric Sans with Primary Accent Indicators",
    layoutStructure: "Accent-indicator structured layout with bold section tags",
    bestFor: "Product Managers, Frontend Specialists, UI/UX Engineers",
    atsHighlights: [
      "Clean semantic section markers",
      "Bullet-safe formatting across parsers",
      "Universal text-stream extraction",
    ],
  },
  {
    id: "classic-oxford",
    name: "Classic Oxford",
    category: "Professional",
    description:
      "Traditional centered masthead formatting optimized for formal corporate, financial institutional, and academic requirements.",
    fontStyle: "Classical Serif with Centered Header",
    layoutStructure: "Centered header traditional single-column",
    bestFor: "Finance, Enterprise Tech, Academic & Corporate Applications",
    atsHighlights: [
      "100% linear text stream without columns",
      "Standardized bulleted achievement points",
      "Universal ATS parser compatibility",
    ],
  },
];

export const VALID_TEMPLATE_IDS = new Set<TemplateId>([
  "swiss-chronicle",
  "stripe-mono",
  "linear-grid",
  "classic-oxford",
]);

export const DEFAULT_TEMPLATE_ID: TemplateId = "swiss-chronicle";

/**
 * Validates if an unknown string is a supported TemplateId.
 */
export function isValidTemplateId(id: unknown): id is TemplateId {
  return typeof id === "string" && VALID_TEMPLATE_IDS.has(id as TemplateId);
}

/**
 * Retrieves template metadata by ID, falling back to DEFAULT_TEMPLATE_ID if unrecognized.
 */
export function getTemplateById(id: string): TemplateDefinition {
  const normalized = normalizeTemplateId(id);
  const found = TEMPLATES.find((t) => t.id === normalized);
  return found || TEMPLATES[0];
}

/**
 * Safely resolves legacy or malformed template identifiers without data loss.
 */
export function normalizeTemplateId(id: unknown): TemplateId {
  if (isValidTemplateId(id)) {
    return id;
  }

  if (typeof id === "string") {
    const lower = id.toLowerCase().trim();
    if (lower.includes("swiss") || lower.includes("chronicle")) return "swiss-chronicle";
    if (lower.includes("stripe") || lower.includes("mono")) return "stripe-mono";
    if (lower.includes("linear") || lower.includes("grid")) return "linear-grid";
    if (lower.includes("oxford") || lower.includes("classic")) return "classic-oxford";
  }

  return DEFAULT_TEMPLATE_ID;
}

/**
 * Immutably applies a new template to an existing Resume, preserving all content and identifiers.
 */
export function applyTemplateToResume(resume: Resume, templateId: TemplateId): Resume {
  return {
    ...resume,
    templateId: normalizeTemplateId(templateId),
    lastModified: "Just now",
  };
}

