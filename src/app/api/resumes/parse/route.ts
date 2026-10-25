/**
 * ResumeLoops API: Document Parser Route
 * POST /api/resumes/parse
 *
 * Extracts text from uploaded PDF or DOCX file using secure server-side parsers.
 * Enforces file size limits, magic bytes verification, and scanned PDF detection.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  parseDocumentBuffer,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/document-parser";
import {
  analyzeUploadedResumeText,
  analyzeUploadedJobMatch,
} from "@/lib/uploaded-ats-analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file was uploaded. Please select a valid PDF or Word (.docx) document.",
          errorCode: "EMPTY_FILE",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
          errorCode: "FILE_TOO_LARGE",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file instanceof File ? file.name : "uploaded-document";
    const fileType = file.type || fileName;

    const parseResult = await parseDocumentBuffer(buffer, fileType);

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

    // Deterministically compute readiness
    const readiness = analyzeUploadedResumeText(parseResult.text);

    // Optional job description analysis
    const jobDescription = formData.get("jobDescription");
    let jobMatch = null;
    if (typeof jobDescription === "string" && jobDescription.trim().length >= 20) {
      jobMatch = analyzeUploadedJobMatch(parseResult.text, jobDescription.trim());
    }

    return NextResponse.json({
      success: true,
      text: parseResult.text,
      pageCount: parseResult.pageCount || 1,
      detectedType: parseResult.detectedType,
      fileSizeBytes: parseResult.fileSizeBytes,
      fileName,
      readiness,
      jobMatch,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server parsing error";
    // Avoid returning raw stacks or logging private info
    return NextResponse.json(
      {
        success: false,
        error: message,
        errorCode: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
