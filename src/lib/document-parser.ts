/**
 * ResumeLoops Document Parser (Phase 3K)
 *
 * Secure server-side PDF and DOCX text extraction with:
 * - Magic byte file signature validation (anti-spoofing).
 * - Scanned PDF detection (OCR unsupported honesty).
 * - Password/encrypted PDF protection.
 * - Resource limits (10 MB max file size, 500k char text limit).
 * - Whitespace normalization preserving section boundaries and bullet points.
 * - Strict privacy: zero logging of personal contact data or full document contents.
 */

import { extractText } from "unpdf";
import mammoth from "mammoth";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_EXTRACTED_CHAR_LENGTH = 500_000;
export const MIN_EXTRACTABLE_TEXT_LENGTH = 15;

export type SupportedDocType = "pdf" | "docx";

export interface ParseDocumentResult {
  success: boolean;
  text?: string;
  pageCount?: number;
  detectedType?: SupportedDocType;
  fileSizeBytes: number;
  error?: string;
  errorCode?:
    | "EMPTY_FILE"
    | "FILE_TOO_LARGE"
    | "SIGNATURE_MISMATCH"
    | "UNSUPPORTED_TYPE"
    | "CORRUPT_DOCUMENT"
    | "ENCRYPTED_DOCUMENT"
    | "SCANNED_NO_TEXT"
    | "INTERNAL_ERROR";
}

/**
 * Detect file format using magic bytes rather than trusting filename or mime type alone.
 */
export function detectDocumentSignature(buffer: Buffer | Uint8Array): SupportedDocType | "unknown" {
  if (!buffer || buffer.length < 4) {
    return "unknown";
  }

  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  // 1. PDF Magic Bytes: begins with %PDF- (0x25 0x50 0x44 0x46 0x2D)
  // Check within first 1024 bytes per PDF standard
  const checkLength = Math.min(bytes.length, 1024);
  const headSlice = bytes.subarray(0, checkLength);
  const headStr = String.fromCharCode(...headSlice);
  if (headStr.includes("%PDF-")) {
    return "pdf";
  }

  // 2. DOCX Magic Bytes: ZIP standard container signature PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return "docx";
  }

  return "unknown";
}

/**
 * Clean and normalize extracted text without destroying section headers or bullet points.
 */
export function normalizeExtractedText(raw: string): string {
  if (!raw) return "";

  return raw
    // Normalize newlines
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove null bytes and non-printable control characters (preserve tabs and newlines)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize common unicode bullet point characters to standard bullets
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB]/g, "•")
    // Replace three or more newlines with two newlines
    .replace(/\n{3,}/g, "\n\n")
    // Trim trailing whitespace per line
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim()
    // Enforce reasonable character cap
    .slice(0, MAX_EXTRACTED_CHAR_LENGTH);
}

/**
 * Extract raw text from a PDF document using unpdf (Mozilla PDF.js).
 */
export async function extractTextFromPdf(
  bytes: Uint8Array,
  fileSizeBytes: number
): Promise<ParseDocumentResult> {
  try {
    const result = await extractText(bytes);
    const pages = Array.isArray(result.text) ? result.text : [result.text];
    const rawCombined = pages.join("\n\n");
    const normalized = normalizeExtractedText(rawCombined);

    // Scanned PDF detection: check non-whitespace character count
    const nonWhitespaceCount = normalized.replace(/\s+/g, "").length;
    if (nonWhitespaceCount < MIN_EXTRACTABLE_TEXT_LENGTH) {
      return {
        success: false,
        fileSizeBytes,
        detectedType: "pdf",
        errorCode: "SCANNED_NO_TEXT",
        error:
          "No extractable text was found in this PDF. It appears to be a scanned image or empty. Optical Character Recognition (OCR) is not supported in this version. Please upload a text-based PDF or DOCX file.",
      };
    }

    return {
      success: true,
      text: normalized,
      pageCount: result.totalPages || pages.length,
      detectedType: "pdf",
      fileSizeBytes,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const lower = errorMsg.toLowerCase();

    if (lower.includes("password") || lower.includes("encrypted")) {
      return {
        success: false,
        fileSizeBytes,
        detectedType: "pdf",
        errorCode: "ENCRYPTED_DOCUMENT",
        error:
          "Password-protected or encrypted PDF documents cannot be processed. Please upload an unprotected resume.",
      };
    }

    return {
      success: false,
      fileSizeBytes,
      detectedType: "pdf",
      errorCode: "CORRUPT_DOCUMENT",
      error:
        "The PDF document could not be read. The file may be corrupt, truncated, or formatted with an unsupported PDF stream.",
    };
  }
}

/**
 * Extract raw text from a Word document (.docx) using Mammoth.
 */
export async function extractTextFromDocx(
  buffer: Buffer,
  fileSizeBytes: number
): Promise<ParseDocumentResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const normalized = normalizeExtractedText(result.value || "");

    const nonWhitespaceCount = normalized.replace(/\s+/g, "").length;
    if (nonWhitespaceCount < MIN_EXTRACTABLE_TEXT_LENGTH) {
      return {
        success: false,
        fileSizeBytes,
        detectedType: "docx",
        errorCode: "SCANNED_NO_TEXT",
        error:
          "No extractable text was found in this Word document. Please verify the document contains readable text and try again.",
      };
    }

    return {
      success: true,
      text: normalized,
      pageCount: 1, // DOCX does not have fixed physical pages without rendering
      detectedType: "docx",
      fileSizeBytes,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const lower = errorMsg.toLowerCase();

    if (lower.includes("password") || lower.includes("encrypted")) {
      return {
        success: false,
        fileSizeBytes,
        detectedType: "docx",
        errorCode: "ENCRYPTED_DOCUMENT",
        error:
          "Password-protected Word documents cannot be processed. Please upload an unprotected file.",
      };
    }

    return {
      success: false,
      fileSizeBytes,
      detectedType: "docx",
      errorCode: "CORRUPT_DOCUMENT",
      error:
        "The Word document could not be read. Please ensure it is a valid .docx file (older binary .doc files are not supported).",
    };
  }
}

/**
 * Universal document parsing entry point.
 * Enforces size limits, signature verification, and invokes the appropriate parser.
 */
export async function parseDocumentBuffer(
  input: Buffer | Uint8Array,
  expectedType?: string
): Promise<ParseDocumentResult> {
  const fileSizeBytes = input.byteLength;

  if (fileSizeBytes === 0) {
    return {
      success: false,
      fileSizeBytes: 0,
      errorCode: "EMPTY_FILE",
      error: "The uploaded file is empty (0 bytes).",
    };
  }

  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      fileSizeBytes,
      errorCode: "FILE_TOO_LARGE",
      error: `File size exceeds the 10 MB limit (${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  const detected = detectDocumentSignature(input);

  if (detected === "unknown") {
    return {
      success: false,
      fileSizeBytes,
      errorCode: "UNSUPPORTED_TYPE",
      error:
        "Unsupported file type. Please upload a valid text-based PDF or Word document (.docx).",
    };
  }

  // Cross-verify with user-claimed file type/extension if provided
  if (expectedType) {
    const lower = expectedType.toLowerCase();
    if (lower.includes("pdf") && detected !== "pdf") {
      return {
        success: false,
        fileSizeBytes,
        detectedType: detected,
        errorCode: "SIGNATURE_MISMATCH",
        error:
          "File content does not match the expected PDF format. The file extension or MIME type claims PDF, but the document signature is invalid.",
      };
    }
    if ((lower.includes("docx") || lower.includes("word")) && detected !== "docx") {
      return {
        success: false,
        fileSizeBytes,
        detectedType: detected,
        errorCode: "SIGNATURE_MISMATCH",
        error:
          "File content does not match the expected DOCX format. The file extension or MIME type claims Word (.docx), but the document signature is invalid.",
      };
    }
  }

  if (detected === "pdf") {
    const uint8 = new Uint8Array(input);
    return extractTextFromPdf(uint8, fileSizeBytes);
  }

  if (detected === "docx") {
    const nodeBuf = Buffer.isBuffer(input) ? input : Buffer.from(input);
    return extractTextFromDocx(nodeBuf, fileSizeBytes);
  }

  return {
    success: false,
    fileSizeBytes,
    errorCode: "UNSUPPORTED_TYPE",
    error: "Unsupported document format.",
  };
}
