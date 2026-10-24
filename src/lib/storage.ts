"use client";

/**
 * ResumeLoops Client-Side Resume Storage
 *
 * Provides typed, versioned localStorage persistence for resume drafts.
 * - Safe for SSR: avoids accessing window/localStorage during server rendering.
 * - Reactive: updates state within the active tab via CustomEvents and across tabs via storage event.
 * - Resilient: falls back safely when localStorage is missing, full, or corrupt.
 * - Zero sensitive data: strictly stores non-sensitive resume document models.
 */

import { useSyncExternalStore, useCallback } from "react";
import { Resume, TemplateId } from "@/types/resume";
import { DEMO_RESUME } from "@/lib/sample-data";

const STORAGE_KEY = "resumeloops_resumes_v1";
const STORAGE_EVENT_NAME = "resumeloops_storage_change";

export interface CreateResumeInput {
  title: string;
  targetRole?: string;
  targetCompany?: string;
  templateId: TemplateId;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface StoredDataSchema {
  version: 1;
  lastUpdated: string;
  resumes: Resume[];
}

/**
 * Default sample resumes derived from DEMO_RESUME fixtures.
 * Explicitly tagged with sample IDs so they can be identified as demo fixtures.
 */
export const INITIAL_SAMPLE_RESUMES: Resume[] = [
  {
    ...DEMO_RESUME,
    id: "sample-resume-1",
    title: "Staff Infrastructure Engineer v4",
    targetRole: "Staff Infrastructure Engineer",
    targetCompany: "Stripe",
    templateId: "swiss-chronicle",
    lastModified: "2 hours ago",
    atsScore: 96,
  },
  {
    ...DEMO_RESUME,
    id: "sample-resume-2",
    title: "Principal Product Designer",
    targetRole: "Lead Product Designer",
    targetCompany: "Linear",
    templateId: "linear-grid",
    lastModified: "1 day ago",
    atsScore: 92,
    personalInfo: {
      ...DEMO_RESUME.personalInfo,
      title: "Principal Product Designer & Systems Architect",
    },
  },
  {
    ...DEMO_RESUME,
    id: "sample-resume-3",
    title: "Core Platform Tech Lead",
    targetRole: "Engineering Manager - Platform",
    targetCompany: "Vercel",
    templateId: "stripe-mono",
    lastModified: "4 days ago",
    atsScore: 88,
    personalInfo: {
      ...DEMO_RESUME.personalInfo,
      title: "Senior Engineering Manager & Platform Architect",
    },
  },
];

/**
 * Helper to dispatch intra-tab change events
 */
function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME));
  }
}

/**
 * Cache references to ensure reference equality between getSnapshot calls
 */
let cachedRaw: string | null = null;
let cachedResumes: Resume[] = INITIAL_SAMPLE_RESUMES;

/**
 * Pure reader: safely retrieves and validates stored resumes from localStorage
 */
export function getStoredResumes(): Resume[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit: initialize with explicit sample resumes
      const initialPayload: StoredDataSchema = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        resumes: INITIAL_SAMPLE_RESUMES,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayload));
      cachedRaw = JSON.stringify(initialPayload);
      cachedResumes = INITIAL_SAMPLE_RESUMES;
      return INITIAL_SAMPLE_RESUMES;
    }

    if (raw === cachedRaw) {
      return cachedResumes;
    }

    cachedRaw = raw;
    const parsed = JSON.parse(raw) as Partial<StoredDataSchema>;
    if (parsed && Array.isArray(parsed.resumes)) {
      cachedResumes = parsed.resumes;
      return cachedResumes;
    }

    // Corrupted payload recovery
    console.warn("[ResumeLoops] Stored resumes were malformed. Resetting to initial sample.");
    cachedResumes = INITIAL_SAMPLE_RESUMES;
    return INITIAL_SAMPLE_RESUMES;
  } catch (error) {
    console.warn("[ResumeLoops] Failed to read from localStorage:", error);
    return cachedResumes;
  }
}

/**
 * Pure writer: safely saves resumes array to localStorage
 */
export function saveStoredResumes(resumes: Resume[]): boolean {
  if (typeof window === "undefined") return false;

  try {
    const payload: StoredDataSchema = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      resumes,
    };
    const stringified = JSON.stringify(payload);
    window.localStorage.setItem(STORAGE_KEY, stringified);
    cachedRaw = stringified;
    cachedResumes = resumes;
    emitChange();
    return true;
  } catch (error) {
    console.error("[ResumeLoops] Failed to save to localStorage:", error);
    return false;
  }
}

/**
 * Retrieve a single resume by ID
 */
export function getResumeById(id: string): Resume | undefined {
  const resumes = getStoredResumes();
  return resumes.find((r) => r.id === id);
}

/**
 * Create a new resume
 */
export function createResume(input: CreateResumeInput): Resume {
  const resumes = getStoredResumes();
  const id = `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newResume: Resume = {
    id,
    title: input.title.trim() || "Untitled Resume",
    targetRole: input.targetRole?.trim() || "Software Engineer",
    targetCompany: input.targetCompany?.trim() || "",
    templateId: input.templateId,
    lastModified: "Just now",
    atsScore: undefined, // Honest: no ATS score until real analysis is performed
    sectionOrder: [
      "personal",
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
    ],
    personalInfo: {
      firstName: input.firstName?.trim() || "Alex",
      lastName: input.lastName?.trim() || "Lawson",
      email: input.email?.trim() || "alex.lawson@example.com",
      phone: "+1 (555) 019-2834",
      location: "San Francisco, CA",
      title: input.targetRole?.trim() || "Professional",
    },
    summary:
      "Accomplished professional with a proven track record of driving impact, optimizing workflows, and delivering high-value outcomes in fast-paced environments.",
    experience: [
      {
        id: `exp-${Date.now()}-1`,
        role: input.targetRole?.trim() || "Senior Specialist",
        company: input.targetCompany?.trim() || "High Growth Tech Co",
        location: "Remote",
        startDate: "2023",
        endDate: "Present",
        isCurrentRole: true,
        bullets: [
          "Spearheaded critical initiatives resulting in a 25% efficiency improvement across core operations.",
          "Collaborated with cross-functional teams to deliver high-quality solutions on tight deadlines.",
        ],
      },
    ],
    education: [
      {
        id: `edu-${Date.now()}-1`,
        degree: "B.S. in Computer Science or Related Field",
        institution: "University of California",
        graduationYear: "2020",
      },
    ],
    skillCategories: [
      {
        id: `skills-${Date.now()}-1`,
        categoryName: "Core Competencies",
        skills: ["Project Leadership", "System Architecture", "Continuous Improvement"],
      },
    ],
    projects: [],
    certifications: [],
  };

  const updated = [newResume, ...resumes];
  saveStoredResumes(updated);
  return newResume;
}

/**
 * Duplicate an existing resume
 */
export function duplicateResume(id: string): Resume | undefined {
  const resumes = getStoredResumes();
  const source = resumes.find((r) => r.id === id);
  if (!source) return undefined;

  const newId = `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const clone: Resume = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    title: `Copy of ${source.title}`,
    lastModified: "Just now",
  };

  const updated = [clone, ...resumes];
  saveStoredResumes(updated);
  return clone;
}

/**
 * Delete a resume by ID
 */
export function deleteResume(id: string): boolean {
  const resumes = getStoredResumes();
  const filtered = resumes.filter((r) => r.id !== id);
  if (filtered.length === resumes.length) return false;

  saveStoredResumes(filtered);
  return true;
}

/**
 * Reset workspace to default sample resumes
 */
export function resetToSampleResumes(): Resume[] {
  saveStoredResumes(INITIAL_SAMPLE_RESUMES);
  return INITIAL_SAMPLE_RESUMES;
}

/**
 * Clear all resumes (for testing empty states)
 */
export function clearAllResumes(): void {
  saveStoredResumes([]);
}

/**
 * External store subscription helpers for useSyncExternalStore
 */
const emptyServerResumes: Resume[] = [];
function getServerSnapshot(): Resume[] {
  return emptyServerResumes;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    cachedRaw = null;
    callback();
  };

  window.addEventListener(STORAGE_EVENT_NAME, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORAGE_EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

function subscribeHydration(): () => void {
  return () => {};
}

/**
 * React Hook: useResumeStore
 * Provides SSR-safe, reactive state synchronized across components and browser tabs.
 */
export function useResumeStore() {
  const resumes = useSyncExternalStore(subscribe, getStoredResumes, getServerSnapshot);
  const isHydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);

  const reload = useCallback(() => {
    cachedRaw = null;
    emitChange();
  }, []);

  return {
    resumes,
    isHydrated,
    reload,
    createResume,
    duplicateResume,
    deleteResume,
    resetToSampleResumes,
    clearAllResumes,
  };
}
