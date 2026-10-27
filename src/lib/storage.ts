"use client";

/**
 * ResumeLoops Storage Architecture (Phase 3J: Cloud PostgreSQL & Local Fallback)
 *
 * Integrates Supabase PostgreSQL persistence when authenticated with Row Level Security,
 * while safely supporting local draft fallback and explicit import workflows.
 */

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import type { Resume, TemplateId } from "../types/resume.ts";
import { DEMO_RESUME } from "./sample-data.ts";
import { isSupabaseConfigured } from "./supabase/config.ts";
import { createClient } from "./supabase/client.ts";
import {
  fetchUserResumes,
  createCloudResume,
  updateCloudResume,
  duplicateCloudResume,
  deleteCloudResume,
  importDraftsToCloud,
} from "./resume-service.ts";

const STORAGE_KEY = "resumeloops_resumes_v1";
const STORAGE_EVENT_NAME = "resumeloops_storage_change";
const DRAFTS_IMPORTED_FLAG = "resumeloops_drafts_imported_v1";

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
 * Pure reader: safely retrieves stored resumes from localStorage
 */
export function getStoredResumes(): Resume[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialPayload: StoredDataSchema = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        resumes: INITIAL_SAMPLE_RESUMES,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayload));
      return INITIAL_SAMPLE_RESUMES;
    }

    const parsed = JSON.parse(raw) as Partial<StoredDataSchema>;
    if (parsed && Array.isArray(parsed.resumes)) {
      return parsed.resumes;
    }

    return INITIAL_SAMPLE_RESUMES;
  } catch (error) {
    console.warn("[ResumeLoops] Failed to read from localStorage:", error);
    return INITIAL_SAMPLE_RESUMES;
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    emitChange();
    return true;
  } catch (error) {
    console.error("[ResumeLoops] Failed to save to localStorage:", error);
    return false;
  }
}

/**
 * Retrieve a single resume by ID from local cache
 */
export function getResumeById(id: string): Resume | undefined {
  const resumes = getStoredResumes();
  return resumes.find((r) => r.id === id);
}

/**
 * Retrieve unimported local drafts (excluding sample fixtures)
 */
export function getLocalDrafts(): Resume[] {
  if (typeof window === "undefined") return [];
  const resumes = getStoredResumes();
  return resumes.filter((r) => !r.id.startsWith("sample-"));
}

/**
 * Clear local drafts after successful verified cloud import
 */
export function clearLocalDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFTS_IMPORTED_FLAG, "true");
    saveStoredResumes(INITIAL_SAMPLE_RESUMES);
  } catch (err) {
    console.error("[ResumeLoops] Failed to clear local drafts:", err);
  }
}

/**
 * Check whether unimported custom local drafts exist
 */
export function hasLocalDrafts(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const isImported = window.localStorage.getItem(DRAFTS_IMPORTED_FLAG);
    if (isImported === "true") return false;
    const drafts = getLocalDrafts();
    return drafts.length > 0;
  } catch {
    return false;
  }
}

/**
 * Create a new resume (local standalone fallback)
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
    atsScore: undefined,
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
 * Update an existing resume (local standalone fallback)
 */
export function updateResume(id: string, updates: Partial<Resume>): Resume | undefined {
  const resumes = getStoredResumes();
  const index = resumes.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  const current = resumes[index];
  const updated: Resume = {
    ...current,
    ...updates,
    id: current.id,
    lastModified: "Just now",
  };

  const newResumes = [...resumes];
  newResumes[index] = updated;
  saveStoredResumes(newResumes);
  return updated;
}

/**
 * Duplicate an existing resume (local standalone fallback)
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
 * Delete a resume by ID (local standalone fallback)
 */
export function deleteResume(id: string): boolean {
  const resumes = getStoredResumes();
  const filtered = resumes.filter((r) => r.id !== id);
  if (filtered.length === resumes.length) return false;

  saveStoredResumes(filtered);
  return true;
}

/**
 * Reset workspace to default sample resumes (local standalone fallback)
 */
export function resetToSampleResumes(): Resume[] {
  saveStoredResumes(INITIAL_SAMPLE_RESUMES);
  return INITIAL_SAMPLE_RESUMES;
}

/**
 * Clear all resumes (local standalone fallback)
 */
export function clearAllResumes(): void {
  saveStoredResumes([]);
}

/**
 * React Hook: useResumeStore
 *
 * Automatically connects to Supabase PostgreSQL when authenticated, providing
 * asynchronous loading, cloud CRUD, error handling, and clean record isolation.
 * Automatically clears memory cache when the user signs out or switches accounts.
 */
const emptySubscribe = () => () => {};

export function useResumeStore() {
  const isClientHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [hasUnimportedDrafts, setHasUnimportedDrafts] = useState(false);

  const isMountedRef = useRef(true);
  const isCloudSyncedRef = useRef(isCloudSynced);

  useEffect(() => {
    isCloudSyncedRef.current = isCloudSynced;
  }, [isCloudSynced]);

  const loadData = useCallback(async () => {
    const configured = isSupabaseConfigured();

    if (configured) {
      try {
        const supabase = createClient();
        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const cloudResumes = await fetchUserResumes();
            if (isMountedRef.current) {
              setResumes(cloudResumes);
              setIsCloudSynced(true);
              setHasUnimportedDrafts(hasLocalDrafts());
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (err: unknown) {
        console.warn("[ResumeLoops Store] Cloud load error, checking local fallback:", err);
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : "Cloud database connection failed");
        }
      }
    }

    if (isMountedRef.current) {
      const local = getStoredResumes();
      setResumes(local);
      setIsCloudSynced(false);
      setHasUnimportedDrafts(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Listen to account logout/switch events to avoid stale cross-user data
    const handleSignedOut = () => {
      if (isMountedRef.current) {
        setResumes([]);
        setIsCloudSynced(false);
        setIsLoading(false);
      }
    };

    // Listen to account sign in to reload cloud resumes
    const handleSignedIn = () => {
      if (isMountedRef.current) {
        setIsLoading(true);
        void loadData();
      }
    };

    // Listen to storage events for cross-tab local updates
    const handleStorageChange = () => {
      if (!isCloudSyncedRef.current) {
        setResumes(getStoredResumes());
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resumeloops_auth_signed_out", handleSignedOut);
      window.addEventListener("resumeloops_auth_signed_in", handleSignedIn);
      window.addEventListener(STORAGE_EVENT_NAME, handleStorageChange);
      window.addEventListener("storage", handleStorageChange);
    }

    // Trigger initial data load after mount
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        void loadData();
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("resumeloops_auth_signed_out", handleSignedOut);
        window.removeEventListener("resumeloops_auth_signed_in", handleSignedIn);
        window.removeEventListener(STORAGE_EVENT_NAME, handleStorageChange);
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, [loadData]);

  // Cloud & local unified create
  const handleCreateResume = useCallback(
    async (input: CreateResumeInput): Promise<Resume> => {
      setError(null);
      if (isCloudSynced) {
        try {
          const created = await createCloudResume(input);
          setResumes((prev) => [created, ...prev]);
          return created;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to create resume in cloud";
          setError(msg);
          throw err;
        }
      } else {
        const created = createResume(input);
        setResumes((prev) => [created, ...prev]);
        return created;
      }
    },
    [isCloudSynced]
  );

  // Cloud & local unified update
  const handleUpdateResume = useCallback(
    async (id: string, updates: Partial<Resume>): Promise<Resume | undefined> => {
      setError(null);

      // Optimistic update
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates, lastModified: "Just now" } : r))
      );

      if (isCloudSynced) {
        try {
          const updated = await updateCloudResume(id, updates);
          if (updated) {
            setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
            return updated;
          }
        } catch (err: unknown) {
          console.error("[ResumeLoops Store] Cloud update failed:", err);
          setError(err instanceof Error ? err.message : "Failed to save changes to cloud");
        }
      } else {
        return updateResume(id, updates);
      }
    },
    [isCloudSynced]
  );

  // Cloud & local unified duplicate
  const handleDuplicateResume = useCallback(
    async (id: string): Promise<Resume | undefined> => {
      setError(null);
      if (isCloudSynced) {
        try {
          const cloned = await duplicateCloudResume(id);
          if (cloned) {
            setResumes((prev) => [cloned, ...prev]);
            return cloned;
          }
        } catch (err: unknown) {
          console.error("[ResumeLoops Store] Cloud duplicate failed:", err);
          setError(err instanceof Error ? err.message : "Failed to duplicate resume in cloud");
        }
      } else {
        const cloned = duplicateResume(id);
        if (cloned) {
          setResumes((prev) => [cloned, ...prev]);
          return cloned;
        }
      }
      return undefined;
    },
    [isCloudSynced]
  );

  // Cloud & local unified delete
  const handleDeleteResume = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);
      const previous = [...resumes];
      // Optimistic removal
      setResumes((prev) => prev.filter((r) => r.id !== id));

      if (isCloudSynced) {
        try {
          const success = await deleteCloudResume(id);
          if (!success) {
            setResumes(previous); // Rollback
            return false;
          }
          return true;
        } catch (err: unknown) {
          console.error("[ResumeLoops Store] Cloud delete failed:", err);
          setResumes(previous); // Rollback
          setError(err instanceof Error ? err.message : "Failed to delete resume from cloud");
          return false;
        }
      } else {
        return deleteResume(id);
      }
    },
    [isCloudSynced, resumes]
  );

  // Reset to sample resumes
  const handleResetToSamples = useCallback(async (): Promise<Resume[]> => {
    if (isCloudSynced) {
      const imported = await importDraftsToCloud(INITIAL_SAMPLE_RESUMES);
      if (imported.importedCount > 0) {
        const refreshed = await fetchUserResumes();
        setResumes(refreshed);
        return refreshed;
      }
      return resumes;
    } else {
      const reset = resetToSampleResumes();
      setResumes(reset);
      return reset;
    }
  }, [isCloudSynced, resumes]);

  // Clear all resumes
  const handleClearAll = useCallback(async (): Promise<void> => {
    if (isCloudSynced) {
      for (const r of resumes) {
        await deleteCloudResume(r.id);
      }
      setResumes([]);
    } else {
      clearAllResumes();
      setResumes([]);
    }
  }, [isCloudSynced, resumes]);

  // Explicit local draft import workflow
  const handleImportLocalDrafts = useCallback(async (): Promise<{
    importedCount: number;
    errors: string[];
  }> => {
    const drafts = getLocalDrafts();
    if (drafts.length === 0) {
      return { importedCount: 0, errors: [] };
    }

    try {
      const result = await importDraftsToCloud(drafts);
      if (result.importedCount > 0) {
        // Verified successful import: safely archive local drafts
        clearLocalDrafts();
        setHasUnimportedDrafts(false);
        const refreshed = await fetchUserResumes();
        setResumes(refreshed);
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed";
      return { importedCount: 0, errors: [msg] };
    }
  }, []);

  const handleDismissLocalDrafts = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DRAFTS_IMPORTED_FLAG, "dismissed");
    }
    setHasUnimportedDrafts(false);
  }, []);

  const isHydrated = isClientHydrated && !isLoading;

  return {
    resumes,
    isHydrated,
    isClientHydrated,
    isReady: isHydrated,
    isLoading,
    error,
    isCloudSynced,
    hasUnimportedDrafts,
    reload: loadData,
    createResume: handleCreateResume,
    updateResume: handleUpdateResume,
    duplicateResume: handleDuplicateResume,
    deleteResume: handleDeleteResume,
    resetToSampleResumes: handleResetToSamples,
    clearAllResumes: handleClearAll,
    importLocalDrafts: handleImportLocalDrafts,
    dismissLocalDrafts: handleDismissLocalDrafts,
    getLocalDrafts,
  };
}
