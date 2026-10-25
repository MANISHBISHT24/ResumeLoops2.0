/**
 * ResumeLoops Cloud Database Service
 * Provides typed PostgreSQL data access via Supabase with Row Level Security (RLS).
 */

import { createClient } from "./supabase/client.ts";
import { isSupabaseConfigured } from "./supabase/config.ts";
import type { Resume, TemplateId, SectionType, PersonalInfo, ExperienceItem, EducationItem, SkillCategory, ProjectItem, CertificationItem } from "../types/resume.ts";
import type { CreateResumeInput } from "./storage.ts";

export interface DbResumeRow {
  id: string;
  user_id: string;
  title: string;
  target_role: string | null;
  target_company: string | null;
  template_id: string;
  document_data: {
    personalInfo: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skillCategories: SkillCategory[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    sectionOrder: SectionType[];
  };
  ats_score: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Format relative time for UI display from ISO timestamp
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "min" : "mins"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Recently";
  }
}

/**
 * Maps a PostgreSQL database row to the TypeScript Resume domain model
 */
export function dbRowToResume(row: DbResumeRow): Resume {
  const doc = row.document_data || {};
  return {
    id: row.id,
    title: row.title,
    targetRole: row.target_role || undefined,
    targetCompany: row.target_company || undefined,
    templateId: (row.template_id as TemplateId) || "swiss-chronicle",
    personalInfo: doc.personalInfo || {
      firstName: "",
      lastName: "",
      email: "",
      title: row.target_role || "Professional",
    },
    summary: doc.summary || "",
    experience: Array.isArray(doc.experience) ? doc.experience : [],
    education: Array.isArray(doc.education) ? doc.education : [],
    skillCategories: Array.isArray(doc.skillCategories) ? doc.skillCategories : [],
    projects: Array.isArray(doc.projects) ? doc.projects : [],
    certifications: Array.isArray(doc.certifications) ? doc.certifications : [],
    sectionOrder: Array.isArray(doc.sectionOrder)
      ? doc.sectionOrder
      : [
          "personal",
          "summary",
          "experience",
          "education",
          "skills",
          "projects",
          "certifications",
        ],
    lastModified: formatRelativeTime(row.updated_at),
    atsScore: typeof row.ats_score === "number" ? row.ats_score : undefined,
  };
}

/**
 * Maps a TypeScript Resume domain model to the PostgreSQL database payload
 */
export function resumeToDbRow(
  resume: Resume,
  userId: string
): Omit<DbResumeRow, "created_at" | "updated_at"> {
  return {
    id: resume.id,
    user_id: userId,
    title: resume.title.trim() || "Untitled Resume",
    target_role: resume.targetRole?.trim() || null,
    target_company: resume.targetCompany?.trim() || null,
    template_id: resume.templateId || "swiss-chronicle",
    document_data: {
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      experience: resume.experience,
      education: resume.education,
      skillCategories: resume.skillCategories,
      projects: resume.projects,
      certifications: resume.certifications,
      sectionOrder: resume.sectionOrder,
    },
    ats_score: typeof resume.atsScore === "number" ? resume.atsScore : null,
  };
}

/**
 * Fetch all resumes belonging to the currently authenticated user from PostgreSQL
 */
export async function fetchUserResumes(): Promise<Resume[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[ResumeLoops Cloud DB] Failed to fetch resumes:", error);
    throw new Error(error.message);
  }

  return (data as DbResumeRow[]).map(dbRowToResume);
}

/**
 * Fetch a single resume by ID for the authenticated user
 */
export async function fetchResumeById(id: string): Promise<Resume | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error(`[ResumeLoops Cloud DB] Failed to fetch resume ${id}:`, error);
    throw new Error(error.message);
  }

  return dbRowToResume(data as DbResumeRow);
}

/**
 * Create a new resume in the PostgreSQL database for the authenticated user
 */
export async function createCloudResume(input: CreateResumeInput): Promise<Resume> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to create a cloud resume.");
  }

  const resumeId = `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const defaultResume: Resume = {
    id: resumeId,
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
      email: input.email?.trim() || user.email || "alex.lawson@example.com",
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

  const payload = resumeToDbRow(defaultResume, user.id);

  const { data, error } = await supabase
    .from("resumes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[ResumeLoops Cloud DB] Failed to create resume:", error);
    throw new Error(error.message);
  }

  return dbRowToResume(data as DbResumeRow);
}

/**
 * Update an existing resume in PostgreSQL
 */
export async function updateCloudResume(
  id: string,
  updates: Partial<Resume>
): Promise<Resume | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be authenticated to update a resume.");

  // Fetch current row to merge document data cleanly
  const existing = await fetchResumeById(id);
  if (!existing) return null;

  const merged: Resume = {
    ...existing,
    ...updates,
    id: existing.id, // ID immutability
  };

  const payload = resumeToDbRow(merged, user.id);

  const { data, error } = await supabase
    .from("resumes")
    .update({
      title: payload.title,
      target_role: payload.target_role,
      target_company: payload.target_company,
      template_id: payload.template_id,
      document_data: payload.document_data,
      ats_score: payload.ats_score,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`[ResumeLoops Cloud DB] Failed to update resume ${id}:`, error);
    throw new Error(error.message);
  }

  return dbRowToResume(data as DbResumeRow);
}

/**
 * Duplicate a resume in PostgreSQL
 */
export async function duplicateCloudResume(id: string): Promise<Resume | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be authenticated to duplicate a resume.");

  const source = await fetchResumeById(id);
  if (!source) return null;

  const newId = `resume-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cloned: Resume = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    title: `Copy of ${source.title}`,
    lastModified: "Just now",
  };

  const payload = resumeToDbRow(cloned, user.id);

  const { data, error } = await supabase
    .from("resumes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(`[ResumeLoops Cloud DB] Failed to duplicate resume ${id}:`, error);
    throw new Error(error.message);
  }

  return dbRowToResume(data as DbResumeRow);
}

/**
 * Delete a resume from PostgreSQL
 */
export async function deleteCloudResume(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`[ResumeLoops Cloud DB] Failed to delete resume ${id}:`, error);
    return false;
  }

  return true;
}

/**
 * Batch import local drafts into the authenticated user's PostgreSQL account
 */
export async function importDraftsToCloud(
  drafts: Resume[]
): Promise<{ importedCount: number; errors: string[] }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to import drafts.");
  }

  let importedCount = 0;
  const errors: string[] = [];

  for (const draft of drafts) {
    try {
      // Ensure each imported draft has a clean ID and belongs to current user
      const payload = resumeToDbRow(draft, user.id);
      const { error } = await supabase
        .from("resumes")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        errors.push(`Failed to import "${draft.title}": ${error.message}`);
      } else {
        importedCount++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`Failed to import "${draft.title}": ${msg}`);
    }
  }

  return { importedCount, errors };
}
