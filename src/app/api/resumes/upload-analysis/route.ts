/**
 * ResumeLoops API: Uploaded Resume Analysis Persistence & Storage
 * POST /api/resumes/upload-analysis
 * GET /api/resumes/upload-analysis
 * DELETE /api/resumes/upload-analysis
 *
 * Enforces authenticated session, private Supabase Storage persistence under {user.id}/{uuid},
 * and PostgreSQL record persistence in uploaded_resume_analyses.
 * Includes partial-failure cleanup: deletes orphaned storage files if DB insert fails.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { parseDocumentBuffer, MAX_FILE_SIZE_BYTES } from "@/lib/document-parser";
import {
  analyzeUploadedResumeText,
  analyzeUploadedJobMatch,
} from "@/lib/uploaded-ats-analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase cloud persistence is not configured. Analysis was performed locally.",
          errorCode: "SETUP_REQUIRED",
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable.", errorCode: "SETUP_REQUIRED" },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to persist resume analysis to your account.",
          errorCode: "UNAUTHENTICATED",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded.", errorCode: "EMPTY_FILE" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10 MB limit.", errorCode: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file instanceof File ? file.name : "uploaded-resume";

    // Re-verify and parse server-side for integrity
    const parseResult = await parseDocumentBuffer(buffer, file.type || fileName);
    if (!parseResult.success || !parseResult.text) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error || "Failed to parse document text.",
          errorCode: parseResult.errorCode || "CORRUPT_DOCUMENT",
        },
        { status: 422 }
      );
    }

    const readiness = analyzeUploadedResumeText(parseResult.text);
    const rawJd = formData.get("jobDescription");
    const jobDescription = typeof rawJd === "string" && rawJd.trim().length >= 20 ? rawJd.trim() : null;
    const jobMatch = jobDescription ? analyzeUploadedJobMatch(parseResult.text, jobDescription) : null;

    // Secure object path: {authenticated_user_id}/{random_uuid}.{ext}
    const ext = parseResult.detectedType === "pdf" ? "pdf" : "docx";
    const randomId = crypto.randomUUID();
    const storagePath = `${user.id}/${randomId}.${ext}`;
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // Upload to private Supabase Storage bucket 'uploaded-resumes'
    const { error: storageError } = await supabase.storage
      .from("uploaded-resumes")
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (storageError) {
      console.error("[ResumeLoops Storage] Upload failed:", storageError.message);
      return NextResponse.json(
        {
          success: false,
          error: `Storage upload failed: ${storageError.message}`,
          errorCode: "STORAGE_ERROR",
        },
        { status: 500 }
      );
    }

    // Insert database record into uploaded_resume_analyses
    const analysisId = `analysis-${Date.now()}-${randomId.substring(0, 8)}`;
    const { data: dbData, error: dbError } = await supabase
      .from("uploaded_resume_analyses")
      .insert({
        id: analysisId,
        user_id: user.id,
        file_name: fileName,
        file_path: storagePath,
        file_size_bytes: file.size,
        mime_type: contentType,
        extracted_text: parseResult.text,
        ats_score: readiness.overallScore,
        analysis_results: {
          readiness,
          jobMatch,
          pageCount: parseResult.pageCount || 1,
        },
        job_description: jobDescription,
        status: "completed",
      })
      .select()
      .single();

    if (dbError) {
      console.error("[ResumeLoops DB] Analysis record insert failed, cleaning up storage:", dbError.message);
      // Clean up orphaned storage object to prevent leaks
      await supabase.storage.from("uploaded-resumes").remove([storagePath]);

      return NextResponse.json(
        {
          success: false,
          error: `Failed to save analysis record: ${dbError.message}`,
          errorCode: "DB_ERROR",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: dbData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message, errorCode: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, analyses: [] });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, analyses: [] });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", errorCode: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("uploaded_resume_analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analyses: data || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message, errorCode: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Supabase not configured", errorCode: "SETUP_REQUIRED" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Database client unavailable", errorCode: "SETUP_REQUIRED" },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", errorCode: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Analysis ID is required", errorCode: "MISSING_ID" },
        { status: 400 }
      );
    }

    // Fetch analysis record first to retrieve file_path (RLS ensures user ownership)
    const { data: record, error: fetchError } = await supabase
      .from("uploaded_resume_analyses")
      .select("id, file_path, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { success: false, error: "Analysis record not found", errorCode: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Delete DB record
    const { error: dbDeleteError } = await supabase
      .from("uploaded_resume_analyses")
      .delete()
      .eq("id", id);

    if (dbDeleteError) {
      return NextResponse.json(
        { success: false, error: dbDeleteError.message, errorCode: "DB_ERROR" },
        { status: 500 }
      );
    }

    // Delete private file from Storage
    if (record.file_path) {
      const { error: storageDeleteError } = await supabase.storage
        .from("uploaded-resumes")
        .remove([record.file_path]);

      if (storageDeleteError) {
        console.warn("[ResumeLoops Storage] Failed to delete file:", storageDeleteError.message);
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message, errorCode: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
