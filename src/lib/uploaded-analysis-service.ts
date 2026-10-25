/**
 * ResumeLoops Uploaded Analysis Client Service
 *
 * Handles API communication for uploaded document parsing, private Storage persistence,
 * user history fetching, and record deletion.
 */

import type { UploadedReadinessResult } from "./uploaded-ats-analysis.ts";
import type { JobMatchResult } from "./ats-analysis.ts";

export interface UploadedResumeAnalysis {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  mime_type?: string;
  extracted_text: string;
  ats_score: number;
  analysis_results: {
    readiness: UploadedReadinessResult;
    jobMatch?: JobMatchResult | null;
    pageCount?: number;
  };
  job_description?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ParseApiResponse {
  success: boolean;
  text?: string;
  pageCount?: number;
  detectedType?: "pdf" | "docx";
  fileSizeBytes?: number;
  fileName?: string;
  readiness?: UploadedReadinessResult;
  jobMatch?: JobMatchResult | null;
  error?: string;
  errorCode?: string;
}

/**
 * Send document to server parser for text extraction and ATS analysis
 */
export async function parseResumeDocument(
  file: File,
  jobDescription?: string
): Promise<ParseApiResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (jobDescription && jobDescription.trim().length >= 20) {
    formData.append("jobDescription", jobDescription.trim());
  }

  const response = await fetch("/api/resumes/parse", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as ParseApiResponse;
  return data;
}

/**
 * Persist an uploaded resume file and its analysis to the authenticated user's account
 */
export async function persistUploadedAnalysis(
  file: File,
  jobDescription?: string
): Promise<{ success: boolean; analysis?: UploadedResumeAnalysis; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (jobDescription && jobDescription.trim().length >= 20) {
    formData.append("jobDescription", jobDescription.trim());
  }

  const response = await fetch("/api/resumes/upload-analysis", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as {
    success: boolean;
    analysis?: UploadedResumeAnalysis;
    error?: string;
  };
  return data;
}

/**
 * Fetch all saved uploaded analyses belonging to the authenticated user
 */
export async function fetchUserUploadedAnalyses(): Promise<UploadedResumeAnalysis[]> {
  try {
    const response = await fetch("/api/resumes/upload-analysis", {
      method: "GET",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      success: boolean;
      analyses?: UploadedResumeAnalysis[];
    };
    return data.analyses || [];
  } catch (err) {
    console.warn("[ResumeLoops] Failed to fetch uploaded analyses:", err);
    return [];
  }
}

/**
 * Delete a saved uploaded analysis and its associated storage file
 */
export async function deleteUserUploadedAnalysis(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/resumes/upload-analysis?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    const data = (await response.json()) as { success: boolean };
    return Boolean(data.success);
  } catch (err) {
    console.error("[ResumeLoops] Failed to delete analysis:", err);
    return false;
  }
}
