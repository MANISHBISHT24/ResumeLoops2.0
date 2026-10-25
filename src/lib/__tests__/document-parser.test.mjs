/**
 * ResumeLoops Document Parser Unit Tests
 *
 * Verifies secure server-side text extraction for PDF and DOCX,
 * magic byte signature validation, scanned PDF detection,
 * file size/length limits, and error handling.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import {
  parseDocumentBuffer,
  detectDocumentSignature,
  normalizeExtractedText,
  MAX_FILE_SIZE_BYTES,
  MAX_EXTRACTED_CHAR_LENGTH,
} from "../document-parser.ts";

/**
 * Helper to build a valid synthetic text-based PDF buffer without external dependencies.
 */
function createSyntheticPdf(textContent) {
  const clean = textContent.replace(/[()\\]/g, "");
  const streamContent = `BT\n/F1 10 Tf\n50 700 Td\n(${clean}) Tj\nET\n`;
  const streamLength = Buffer.byteLength(streamContent);

  const pdfStr =
    `%PDF-1.4\n` +
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n` +
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n` +
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n` +
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n` +
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n` +
    `xref\n0 6\n` +
    `0000000000 65535 f \n` +
    `0000000009 00000 n \n` +
    `0000000058 00000 n \n` +
    `0000000115 00000 n \n` +
    `0000000229 00000 n \n` +
    `0000000305 00000 n \n` +
    `trailer\n<< /Size 6 /Root 1 0 R >>\n` +
    `startxref\n400\n%%EOF`;

  return Buffer.from(pdfStr);
}

/**
 * Helper to build a valid synthetic DOCX buffer using JSZip.
 */
async function createSyntheticDocx(textContent) {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      "</Types>"
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      "</Relationships>"
  );
  const escaped = textContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  zip.file(
    "word/document.xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      `<w:body><w:p><w:r><w:t>${escaped}</w:t></w:r></w:p></w:body>` +
      "</w:document>"
  );
  return zip.generateAsync({ type: "nodebuffer" });
}

test("detectDocumentSignature: identifies PDF and DOCX magic bytes correctly", async () => {
  const pdfBytes = Buffer.from("%PDF-1.4 synthetic header");
  const docxBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  const unknownBytes = Buffer.from("plain text file contents");

  assert.equal(detectDocumentSignature(pdfBytes), "pdf");
  assert.equal(detectDocumentSignature(docxBytes), "docx");
  assert.equal(detectDocumentSignature(unknownBytes), "unknown");
});

test("parseDocumentBuffer: successfully extracts text from valid text-based PDF", async () => {
  const sampleText = "Alex Lawson Senior Infrastructure Engineer Stripe";
  const pdfBuffer = createSyntheticPdf(sampleText);

  const result = await parseDocumentBuffer(pdfBuffer, "application/pdf");

  assert.equal(result.success, true);
  assert.equal(result.detectedType, "pdf");
  assert.ok(result.text?.includes("Alex Lawson"));
  assert.ok(result.text?.includes("Stripe"));
  assert.equal(result.pageCount, 1);
});

test("parseDocumentBuffer: successfully extracts text from valid DOCX", async () => {
  const sampleText = "Morgan Vance Principal Product Designer Figma Design System";
  const docxBuffer = await createSyntheticDocx(sampleText);

  const result = await parseDocumentBuffer(docxBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  assert.equal(result.success, true);
  assert.equal(result.detectedType, "docx");
  assert.ok(result.text?.includes("Morgan Vance"));
  assert.ok(result.text?.includes("Principal Product Designer"));
});

test("parseDocumentBuffer: rejects empty 0-byte file with EMPTY_FILE", async () => {
  const emptyBuffer = Buffer.alloc(0);
  const result = await parseDocumentBuffer(emptyBuffer, "application/pdf");

  assert.equal(result.success, false);
  assert.equal(result.errorCode, "EMPTY_FILE");
  assert.ok(result.error?.includes("empty"));
});

test("parseDocumentBuffer: rejects oversized file exceeding 10 MB with FILE_TOO_LARGE", async () => {
  // Simulate oversized buffer check using Uint8Array slice length
  const fakeLargeBuffer = {
    byteLength: MAX_FILE_SIZE_BYTES + 1024,
    length: MAX_FILE_SIZE_BYTES + 1024,
  };

  const result = await parseDocumentBuffer(fakeLargeBuffer, "application/pdf");

  assert.equal(result.success, false);
  assert.equal(result.errorCode, "FILE_TOO_LARGE");
  assert.ok(result.error?.includes("10 MB"));
});

test("parseDocumentBuffer: rejects file with signature mismatch (claimed PDF, actually DOCX or unknown)", async () => {
  const textBuffer = Buffer.from("This is a plain text file disguised with .pdf");
  const result = await parseDocumentBuffer(textBuffer, "application/pdf");

  assert.equal(result.success, false);
  assert.equal(result.errorCode, "UNSUPPORTED_TYPE");
});

test("parseDocumentBuffer: handles corrupt PDF document gracefully", async () => {
  const corruptPdf = Buffer.from("%PDF-1.4\ncorrupted bytes content invalid stream truncated");
  const result = await parseDocumentBuffer(corruptPdf, "application/pdf");

  assert.equal(result.success, false);
  assert.equal(result.errorCode, "CORRUPT_DOCUMENT");
  assert.ok(result.error?.includes("could not be read"));
});

test("parseDocumentBuffer: detects scanned/empty PDF and displays clear OCR unsupported notice", async () => {
  // PDF with empty or sub-15-character text stream
  const minimalPdf = createSyntheticPdf("");
  const result = await parseDocumentBuffer(minimalPdf, "application/pdf");

  assert.equal(result.success, false);
  assert.equal(result.errorCode, "SCANNED_NO_TEXT");
  assert.ok(result.error?.includes("scanned image or empty"));
  assert.ok(result.error?.includes("Optical Character Recognition (OCR) is not supported in this version"));
});

test("normalizeExtractedText: strips non-printable characters, normalizes CRLF and standardizes bullet glyphs", () => {
  const rawText = "Line 1\r\n\x00• First achievement\r\n\x08▪ Second achievement\n\n\n\nLine 2";
  const normalized = normalizeExtractedText(rawText);

  assert.ok(!normalized.includes("\r"));
  assert.ok(!normalized.includes("\x00"));
  assert.ok(!normalized.includes("\x08"));
  assert.ok(!normalized.includes("\n\n\n")); // max 2 consecutive newlines
  assert.ok(normalized.includes("• First achievement"));
  assert.ok(normalized.includes("• Second achievement"));
});

test("normalizeExtractedText: strictly enforces character length cap", () => {
  const giantText = "a".repeat(MAX_EXTRACTED_CHAR_LENGTH + 5000);
  const normalized = normalizeExtractedText(giantText);

  assert.equal(normalized.length, MAX_EXTRACTED_CHAR_LENGTH);
});

test("error safety: error messages do not leak raw file contents or sensitive personal data", async () => {
  const privateContent = "SecretSSN: 000-11-2222 SensitiveMedicalInfo: XYZ";
  const corruptPdf = Buffer.from(`%PDF-1.4\n${privateContent}\ncorrupted`);
  const result = await parseDocumentBuffer(corruptPdf, "application/pdf");

  assert.equal(result.success, false);
  assert.ok(!result.error?.includes("000-11-2222"));
  assert.ok(!result.error?.includes("SensitiveMedicalInfo"));
});
