import JSZip from "jszip";
import fs from "node:fs";
import path from "node:path";

const fixturesDir = path.resolve("./test-fixtures");
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// 1. Synthetic PDF fixture
const pdfText = "Taylor Swift Senior Distributed Systems Engineer AWS Kubernetes Docker PostgreSQL 2022";
const clean = pdfText.replace(/[()\\]/g, "");
const streamContent = `BT\n/F1 10 Tf\n50 700 Td\n(${clean}) Tj\nET\n`;
const streamLength = Buffer.byteLength(streamContent);

const pdfStr =
  `%PDF-1.4\n` +
  `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n` +
  `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n` +
  `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n` +
  `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n` +
  `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n` +
  `xref\n0 6\n` +
  `0000000000 65535 f \n` +
  `0000000009 00000 n \n` +
  `0000000058 00000 n \n` +
  `0000000115 00000 n \n` +
  `0000000229 00000 n \n` +
  `0000000305 00000 n \n` +
  `trailer\n<< /Size 6 /Root 1 0 R >>\n` +
  `startxref\n400\n%%EOF`;

fs.writeFileSync(path.join(fixturesDir, "synthetic-resume.pdf"), Buffer.from(pdfStr));

// 2. Synthetic DOCX fixture
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
const docxText =
  "Jordan Lee\n" +
  "jordan.lee@example.com | (555) 234-5678 | linkedin.com/in/jordanlee\n\n" +
  "PROFESSIONAL SUMMARY\n" +
  "Staff Frontend Architect with deep expertise in React, Next.js, TypeScript, and Design Systems.\n\n" +
  "WORK EXPERIENCE\n" +
  "Lead Engineer - Design Systems Co\n" +
  "• Built component library used by 50+ engineering teams, increasing delivery velocity by 30%.\n" +
  "• Scaled web performance achieving 99 Lighthouse performance score and reducing load time by 45%.\n\n" +
  "EDUCATION\n" +
  "B.S. in Computer Science - University of Washington (2019)";

zip.file(
  "word/document.xml",
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    `<w:body><w:p><w:r><w:t>${docxText}</w:t></w:r></w:p></w:body>` +
    "</w:document>"
);

const docxBuf = await zip.generateAsync({ type: "nodebuffer" });
fs.writeFileSync(path.join(fixturesDir, "synthetic-resume.docx"), docxBuf);

console.log("Synthetic test fixtures generated successfully in:", fixturesDir);
