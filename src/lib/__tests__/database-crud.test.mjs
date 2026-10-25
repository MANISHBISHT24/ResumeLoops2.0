/**
 * Unit & Integration Tests for PostgreSQL Database Model & RLS Simulation
 *
 * Verifies:
 * - Bidirectional transformation between TypeScript Resume model and PostgreSQL DbResumeRow
 * - Correct serialization of structured document data (personal info, bullets, education, skills)
 * - User ownership attribution and strict cross-user data isolation
 * - RLS policy enforcement simulation across two distinct user IDs (User A vs User B)
 * - Preserves all resume fields, template identifiers, and section orders
 *
 * NOTE: These tests verify domain transformations and simulated database isolation logic locally.
 * Real PostgreSQL RLS enforcement is governed by `supabase/migrations/20261025120000_create_resumes_table.sql`.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  dbRowToResume,
  resumeToDbRow,
  formatRelativeTime,
} from "../resume-service.ts";

const MOCK_RESUME_A = {
  id: "resume-userA-101",
  title: "Principal Infrastructure Lead",
  targetRole: "Staff Site Reliability Engineer",
  targetCompany: "Stripe",
  templateId: "stripe-mono",
  lastModified: "Just now",
  atsScore: 94,
  personalInfo: {
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena@example.com",
    phone: "+1 555 0192",
    location: "Seattle, WA",
    title: "Principal Infrastructure Lead",
  },
  summary: "Infrastructure architect specialized in resilient multi-region architectures.",
  experience: [
    {
      id: "exp-1",
      role: "Staff SRE",
      company: "CloudCore",
      startDate: "2021",
      endDate: "Present",
      isCurrentRole: true,
      bullets: [
        "Architected multi-region failover cluster reducing recovery time from 40m to 90s.",
        "Scaled Kubernetes control plane across 4 global regions.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      institution: "University of Washington",
      graduationYear: "2018",
    },
  ],
  skillCategories: [
    {
      id: "skills-1",
      categoryName: "Core Competencies",
      skills: ["Kubernetes", "Distributed Systems", "Terraform", "PostgreSQL"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Global DNS Router",
      description: "Anycast latency router deployed across edge nodes.",
      technologies: ["Go", "BGP", "WireGuard"],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Certified Kubernetes Security Specialist",
      issuer: "Linux Foundation",
      date: "2024",
    },
  ],
  sectionOrder: [
    "personal",
    "summary",
    "experience",
    "skills",
    "projects",
    "education",
    "certifications",
  ],
};

test("resumeToDbRow: transforms TypeScript Resume model into PostgreSQL row schema", () => {
  const userId = "00000000-0000-0000-0000-000000000001";
  const row = resumeToDbRow(MOCK_RESUME_A, userId);

  assert.equal(row.id, "resume-userA-101");
  assert.equal(row.user_id, userId);
  assert.equal(row.title, "Principal Infrastructure Lead");
  assert.equal(row.target_role, "Staff Site Reliability Engineer");
  assert.equal(row.target_company, "Stripe");
  assert.equal(row.template_id, "stripe-mono");
  assert.equal(row.ats_score, 94);

  // Document data structured JSONB payload
  assert.ok(row.document_data);
  assert.equal(row.document_data.personalInfo.firstName, "Elena");
  assert.equal(row.document_data.personalInfo.lastName, "Rostova");
  assert.equal(row.document_data.experience.length, 1);
  assert.equal(row.document_data.experience[0].bullets.length, 2);
  assert.deepEqual(row.document_data.sectionOrder, MOCK_RESUME_A.sectionOrder);
});

test("dbRowToResume: reconstitutes complete Resume model from PostgreSQL row", () => {
  const mockDbRow = {
    id: "resume-12345",
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "Senior Product Designer",
    target_role: "Lead Product Designer",
    target_company: "Linear",
    template_id: "linear-grid",
    ats_score: 91,
    created_at: "2026-10-25T10:00:00.000Z",
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    document_data: {
      personalInfo: {
        firstName: "Marcus",
        lastName: "Vance",
        email: "marcus@example.com",
        title: "Lead Product Designer",
      },
      summary: "Systems designer with a passion for micro-interactions.",
      experience: [],
      education: [],
      skillCategories: [],
      projects: [],
      certifications: [],
      sectionOrder: ["personal", "summary", "experience", "education", "skills"],
    },
  };

  const domain = dbRowToResume(mockDbRow);

  assert.equal(domain.id, "resume-12345");
  assert.equal(domain.title, "Senior Product Designer");
  assert.equal(domain.targetRole, "Lead Product Designer");
  assert.equal(domain.targetCompany, "Linear");
  assert.equal(domain.templateId, "linear-grid");
  assert.equal(domain.atsScore, 91);
  assert.equal(domain.personalInfo.firstName, "Marcus");
  assert.equal(domain.summary, "Systems designer with a passion for micro-interactions.");
  assert.equal(domain.lastModified, "5 mins ago");
});

test("formatRelativeTime: accurately handles varying time intervals", () => {
  const now = new Date();

  const thirtySecsAgo = new Date(now.getTime() - 30 * 1000).toISOString();
  assert.equal(formatRelativeTime(thirtySecsAgo), "Just now");

  const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(tenMinsAgo), "10 mins ago");

  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(twoHoursAgo), "2 hours ago");

  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatRelativeTime(threeDaysAgo), "3 days ago");
});

test("Cross-User Isolation & RLS Simulation: users can only query their own records", () => {
  const userA = "11111111-1111-1111-1111-111111111111";
  const userB = "22222222-2222-2222-2222-222222222222";

  // Simulated in-memory PostgreSQL table backing
  const table = [
    {
      id: "res-A-1",
      user_id: userA,
      title: "User A Resume 1",
      target_role: "Staff Engineer",
      target_company: "Stripe",
      template_id: "swiss-chronicle",
      ats_score: 95,
      document_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "res-A-2",
      user_id: userA,
      title: "User A Resume 2",
      target_role: "Architect",
      target_company: "Vercel",
      template_id: "stripe-mono",
      ats_score: 89,
      document_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "res-B-1",
      user_id: userB,
      title: "User B Confidential Resume",
      target_role: "VP Engineering",
      target_company: "Stealth Startup",
      template_id: "linear-grid",
      ats_score: 99,
      document_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Simulate SELECT policy: auth.uid() = user_id
  const queryForUser = (authUid) => table.filter((row) => row.user_id === authUid);

  const resultsForUserA = queryForUser(userA);
  assert.equal(resultsForUserA.length, 2);
  assert.ok(resultsForUserA.every((r) => r.user_id === userA));
  assert.equal(resultsForUserA.find((r) => r.id === "res-B-1"), undefined);

  const resultsForUserB = queryForUser(userB);
  assert.equal(resultsForUserB.length, 1);
  assert.equal(resultsForUserB[0].title, "User B Confidential Resume");
  assert.equal(resultsForUserB.find((r) => r.id === "res-A-1"), undefined);
});

test("Cross-User Isolation & RLS Simulation: prevents unauthorized update and delete", () => {
  const userA = "11111111-1111-1111-1111-111111111111";
  const userB = "22222222-2222-2222-2222-222222222222";

  let table = [
    { id: "res-B-secret", user_id: userB, title: "Secret B Resume" },
  ];

  // Simulate UPDATE policy: auth.uid() = user_id
  const attemptUpdate = (authUid, resumeId, newTitle) => {
    const row = table.find((r) => r.id === resumeId);
    if (!row || row.user_id !== authUid) {
      return { success: false, error: "RLS policy violation: unauthorized" };
    }
    row.title = newTitle;
    return { success: true, updated: row };
  };

  // User A attempts to overwrite User B's resume
  const updateResult = attemptUpdate(userA, "res-B-secret", "Hacked Title");
  assert.equal(updateResult.success, false);
  assert.equal(table[0].title, "Secret B Resume"); // Unchanged

  // Simulate DELETE policy: auth.uid() = user_id
  const attemptDelete = (authUid, resumeId) => {
    const row = table.find((r) => r.id === resumeId);
    if (!row || row.user_id !== authUid) {
      return { success: false, error: "RLS policy violation: unauthorized" };
    }
    table = table.filter((r) => r.id !== resumeId);
    return { success: true };
  };

  // User A attempts to delete User B's resume
  const deleteResult = attemptDelete(userA, "res-B-secret");
  assert.equal(deleteResult.success, false);
  assert.equal(table.length, 1); // Not deleted

  // User B deletes own resume
  const authorizedDelete = attemptDelete(userB, "res-B-secret");
  assert.equal(authorizedDelete.success, true);
  assert.equal(table.length, 0);
});
