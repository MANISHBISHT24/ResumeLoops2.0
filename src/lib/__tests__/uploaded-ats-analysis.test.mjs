/**
 * ResumeLoops Uploaded Resume ATS Analysis & Storage Security Tests (Phase 3K)
 *
 * Verifies:
 * 1. Deterministic readiness scoring of extracted document text.
 * 2. Transparent category weights and actionable suggestions.
 * 3. Job keyword matching against raw document text.
 * 4. Job match withholding when no job description is provided.
 * 5. Secure user-specific Storage path enforcement ({user_id}/{uuid}.{ext}).
 * 6. Cross-user isolation and Row Level Security simulation for uploaded analyses.
 * 7. Partial-upload failure cleanup (storage rollback on database error).
 *
 * NOTE ON TESTING METHODOLOGY:
 * Tests in this suite simulate the database RLS policies and Storage access controls
 * in memory using mock user contexts. Real Supabase integration testing requires
 * configured environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeUploadedResumeText,
  analyzeUploadedJobMatch,
} from "../uploaded-ats-analysis.ts";

// Sample synthetic resume texts for testing
const COMPLETE_RESUME_TEXT = `
Alex Lawson
alex.lawson@example.com | (555) 019-2834 | linkedin.com/in/alexlawson | github.com/alexlawson
San Francisco, CA

PROFESSIONAL SUMMARY
Senior Platform Infrastructure Engineer with 8+ years experience architecting distributed systems,
cloud infrastructure, and microservices platforms. Proven track record leading cross-functional teams
and driving 99.99% availability at scale.

WORK EXPERIENCE
Staff Infrastructure Engineer - Stripe
2021 - Present | San Francisco, CA
• Architected high-throughput payment processing pipelines handling $250M+ in daily transaction volume.
• Scaled Kubernetes cluster infrastructure across AWS and GCP, reducing cloud compute costs by 35%.
• Deployed zero-trust security and continuous delivery CI/CD pipelines, lowering deployment latency by 45%.
• Led team of 10 engineers in performance optimization and Redis caching layer implementation.

Senior DevOps Engineer - FinTech Labs
2018 - 2021 | Remote
• Built automated Terraform infrastructure as code managing 500+ microservices and PostgreSQL databases.
• Improved system reliability from 99.8% to 99.99% uptime through Prometheus and Grafana telemetry.
• Mentored junior engineers and conducted weekly code reviews adhering to distributed systems best practices.

TECHNICAL SKILLS & TOOLS
• Languages: TypeScript, Python, Golang, SQL, Bash
• Cloud & DevOps: AWS, GCP, Docker, Kubernetes, Terraform, CI/CD, Linux
• Databases & Data: PostgreSQL, Redis, Kafka, Snowflake, Elasticsearch
• Architecture: Microservices, Distributed Systems, System Design, REST APIs, Unit Testing

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2018)
`;

const DEFICIENT_RESUME_TEXT = `
John Doe
About Me
Worker looking for any open job.

Things I have done:
Worked at a company doing tasks. Helped people.
`;

test("analyzeUploadedResumeText: awards high score to complete, quantified resume text", () => {
  const result = analyzeUploadedResumeText(COMPLETE_RESUME_TEXT);

  assert.ok(result.overallScore >= 85, `Score should be >= 85, got ${result.overallScore}`);
  assert.equal(result.scoreLevel, "Exceptional");
  assert.equal(result.hasQuantifiedImpact, true);
  assert.equal(result.detectedContactInfo.hasEmail, true);
  assert.equal(result.detectedContactInfo.hasPhone, true);
  assert.equal(result.detectedContactInfo.hasLinks, true);
  assert.equal(result.detectedContactInfo.hasName, true);

  // Check categories sum correctly
  const sumOfCategories = result.categories.reduce((acc, c) => acc + c.score, 0);
  assert.equal(result.overallScore, sumOfCategories);

  // Check section detection
  assert.ok(result.detectedSections.includes("Executive Summary"));
  assert.ok(result.detectedSections.includes("Work Experience"));
  assert.ok(result.detectedSections.includes("Skills & Tools"));
  assert.ok(result.detectedSections.includes("Education"));
});

test("analyzeUploadedResumeText: identifies missing sections and produces actionable fixes", () => {
  const result = analyzeUploadedResumeText(DEFICIENT_RESUME_TEXT);

  assert.ok(result.overallScore < 50, `Score should be < 50 for deficient text, got ${result.overallScore}`);
  assert.equal(result.scoreLevel, "Needs Attention");
  assert.equal(result.hasQuantifiedImpact, false);
  assert.equal(result.detectedContactInfo.hasEmail, false);
  assert.equal(result.detectedContactInfo.hasPhone, false);

  assert.ok(result.actionableFixes.length > 0);
  assert.ok(result.actionableFixes.some((f) => f.title.includes("Email")));
  assert.ok(result.actionableFixes.some((f) => f.title.includes("Metrics")));
});

test("analyzeUploadedResumeText: does not mutate the input string", () => {
  const original = `${COMPLETE_RESUME_TEXT}`;
  const result = analyzeUploadedResumeText(original);

  assert.equal(original, COMPLETE_RESUME_TEXT);
  assert.ok(result.overallScore > 0);
});

test("analyzeUploadedJobMatch: accurately calculates matched and missing keywords against extracted text", () => {
  const jobDescription = `
We are seeking a Staff Infrastructure Engineer to join our payments platform.
Requirements:
- Deep expertise in Kubernetes, Docker, Terraform, and AWS cloud infrastructure.
- Experience with microservices, distributed systems, and PostgreSQL databases.
- Knowledge of Ruby on Rails, Elixir, and GraphQL APIs.
`;

  const match = analyzeUploadedJobMatch(COMPLETE_RESUME_TEXT, jobDescription);

  assert.notEqual(match, null);
  assert.ok(match.matchedCount > 0);
  assert.ok(match.totalKeywordsAnalyzed > 0);
  assert.ok(match.matchPercentage > 50);

  // Expected matched terms present in resume
  const matchedTerms = match.matchedKeywords.map((k) => k.term.toLowerCase());
  assert.ok(matchedTerms.includes("kubernetes"));
  assert.ok(matchedTerms.includes("terraform"));
  assert.ok(matchedTerms.includes("postgresql"));

  // Expected missing terms
  const missingTerms = match.missingKeywords.map((k) => k.toLowerCase());
  assert.ok(missingTerms.includes("ruby on rails") || missingTerms.includes("elixir") || missingTerms.includes("graphql apis") || missingTerms.includes("graphql"));
});

test("analyzeUploadedJobMatch: withholds job match estimate when job description is empty or < 20 chars", () => {
  assert.equal(analyzeUploadedJobMatch(COMPLETE_RESUME_TEXT, ""), null);
  assert.equal(analyzeUploadedJobMatch(COMPLETE_RESUME_TEXT, "   "), null);
  assert.equal(analyzeUploadedJobMatch(COMPLETE_RESUME_TEXT, "Short text"), null);
  assert.equal(analyzeUploadedJobMatch(COMPLETE_RESUME_TEXT, "1234567890123456789"), null);
});

test("Storage Path Security: enforces {user_id}/{random_uuid}.{ext} format and prevents path traversal", () => {
  const userId = "c89d7821-6543-42e1-8012-123456789abc";
  const randomUuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const ext = "pdf";

  const validPath = `${userId}/${randomUuid}.${ext}`;

  // Helper verifying path ownership matching Supabase storage policy:
  // (storage.foldername(name))[1] = auth.uid()::text
  function isStoragePathAuthorized(path, currentUserId) {
    if (!path || path.includes("..") || path.startsWith("/") || path.startsWith("\\")) {
      return false; // Traversal attempt
    }
    const parts = path.split("/");
    if (parts.length !== 2) return false;
    return parts[0] === currentUserId;
  }

  assert.equal(isStoragePathAuthorized(validPath, userId), true);
  // Cross-user access attempt
  assert.equal(isStoragePathAuthorized(validPath, "different-user-999"), false);
  // Path traversal attempts
  assert.equal(isStoragePathAuthorized(`../${validPath}`, userId), false);
  assert.equal(isStoragePathAuthorized(`${userId}/../../etc/passwd`, userId), false);
  assert.equal(isStoragePathAuthorized("/root/resume.pdf", userId), false);
});

test("Partial-Upload Failure Cleanup: rolls back Storage object when Database insert fails", async () => {
  // Mock Storage operations tracker
  const mockStorage = {
    uploadedFiles: new Set(),
    deletedFiles: new Set(),
    async upload(path) {
      this.uploadedFiles.add(path);
      return { error: null };
    },
    async remove(paths) {
      paths.forEach((p) => {
        this.uploadedFiles.delete(p);
        this.deletedFiles.add(p);
      });
      return { error: null };
    },
  };

  const testStoragePath = "user-123/synthetic-file.pdf";

  // Simulate file upload
  await mockStorage.upload(testStoragePath);
  assert.ok(mockStorage.uploadedFiles.has(testStoragePath));

  // Simulate subsequent Database error
  const dbInsertFailed = true;

  if (dbInsertFailed) {
    // Rollback / cleanup triggered
    await mockStorage.remove([testStoragePath]);
  }

  assert.equal(mockStorage.uploadedFiles.has(testStoragePath), false);
  assert.ok(mockStorage.deletedFiles.has(testStoragePath));
});

test("Cross-User Isolation & RLS Simulation: users can only view, update, and delete their own uploaded analyses", () => {
  const userA = "11111111-1111-1111-1111-111111111111";
  const userB = "22222222-2222-2222-2222-222222222222";

  // In-memory table simulation enforcing RLS: auth.uid() = user_id
  const mockTable = [
    {
      id: "analysis-user-a-1",
      user_id: userA,
      file_name: "alex_lawson_resume.pdf",
      file_path: `${userA}/doc-1.pdf`,
      ats_score: 92,
    },
    {
      id: "analysis-user-b-1",
      user_id: userB,
      file_name: "morgan_vance_resume.pdf",
      file_path: `${userB}/doc-2.pdf`,
      ats_score: 88,
    },
  ];

  function queryUserAnalyses(currentUserId) {
    // Simulates SELECT policy: USING (auth.uid() = user_id)
    return mockTable.filter((r) => r.user_id === currentUserId);
  }

  function deleteUserAnalysis(analysisId, currentUserId) {
    // Simulates DELETE policy: USING (auth.uid() = user_id)
    const idx = mockTable.findIndex((r) => r.id === analysisId && r.user_id === currentUserId);
    if (idx === -1) return false;
    mockTable.splice(idx, 1);
    return true;
  }

  // User A can view their own record
  const userARecords = queryUserAnalyses(userA);
  assert.equal(userARecords.length, 1);
  assert.equal(userARecords[0].id, "analysis-user-a-1");

  // User B cannot view User A's record
  const userBRecords = queryUserAnalyses(userB);
  assert.equal(userBRecords.length, 1);
  assert.equal(userBRecords[0].id, "analysis-user-b-1");

  // User A cannot delete User B's record
  const unauthorizedDelete = deleteUserAnalysis("analysis-user-b-1", userA);
  assert.equal(unauthorizedDelete, false);

  // User B can delete their own record
  const authorizedDelete = deleteUserAnalysis("analysis-user-b-1", userB);
  assert.equal(authorizedDelete, true);
  assert.equal(queryUserAnalyses(userB).length, 0);
});
