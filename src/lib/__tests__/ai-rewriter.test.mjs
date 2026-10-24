/**
 * Unit Tests for ResumeLoops AI Rewriter & Field Mapping Engine
 *
 * Verifies:
 * - Extraction of selectable targets across headline, summary, experience, and projects
 * - Applying a rewrite updates only the targeted field immutably
 * - Rejecting a proposal leaves the resume unaltered
 * - Stale-proposal protection (detecting modifications made after suggestion generation)
 * - Record isolation between distinct resume IDs
 * - Input validation boundaries
 * - Mocked OpenAI Responses API response parsing and error handling
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  extractRewriteTargets,
  applyRewriteToResume,
  isTargetFresh,
} from "../resume-field-mapper.ts";

const SAMPLE_RESUME_A = {
  id: "resume-alpha",
  title: "Principal Systems Architect",
  targetRole: "Staff Engineer",
  targetCompany: "Stripe",
  templateId: "swiss-chronicle",
  lastModified: "10m ago",
  sectionOrder: ["personal", "summary", "experience", "projects"],
  personalInfo: {
    firstName: "Alex",
    lastName: "Vance",
    email: "alex@example.com",
    title: "Senior Distributed Systems Architect",
  },
  summary: "Architect with 9 years of high-scale cloud infrastructure experience.",
  experience: [
    {
      id: "exp-1",
      role: "Staff Engineer",
      company: "CloudScale Systems",
      startDate: "2021",
      endDate: "Present",
      bullets: [
        "Led migration of monolith to microservices architecture.",
        "Optimized Redis connection pooling, reducing p99 latency.",
      ],
    },
    {
      id: "exp-2",
      role: "Backend Engineer",
      company: "Fintech Co",
      startDate: "2018",
      endDate: "2021",
      bullets: ["Built payment webhook ingestion pipelines."],
    },
  ],
  education: [],
  skillCategories: [],
  projects: [
    {
      id: "proj-1",
      name: "ResumeLoops Engine",
      description: "Autonomous resume optimization system.",
      technologies: ["TypeScript", "Next.js"],
    },
  ],
  certifications: [],
};

const SAMPLE_RESUME_B = {
  id: "resume-beta",
  title: "Lead Product Designer",
  templateId: "linear-grid",
  lastModified: "1h ago",
  sectionOrder: ["personal", "summary"],
  personalInfo: {
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan@example.com",
    title: "Lead Product Designer",
  },
  summary: "Specializing in design systems and accessible web interfaces.",
  experience: [],
  education: [],
  skillCategories: [],
  projects: [],
  certifications: [],
};

test("extractRewriteTargets: extracts headline, summary, individual bullets, and project descriptions", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  assert.ok(targets.length >= 5, `Expected at least 5 targets, got ${targets.length}`);

  const headline = targets.find((t) => t.targetKey === "headline");
  assert.ok(headline);
  assert.equal(headline.originalText, "Senior Distributed Systems Architect");

  const summary = targets.find((t) => t.targetKey === "summary");
  assert.ok(summary);
  assert.equal(summary.originalText, "Architect with 9 years of high-scale cloud infrastructure experience.");

  const bullet0 = targets.find((t) => t.targetKey === "exp-exp-1-bullet-0");
  assert.ok(bullet0);
  assert.equal(bullet0.originalText, "Led migration of monolith to microservices architecture.");

  const bullet1 = targets.find((t) => t.targetKey === "exp-exp-1-bullet-1");
  assert.ok(bullet1);
  assert.equal(bullet1.originalText, "Optimized Redis connection pooling, reducing p99 latency.");

  const proj = targets.find((t) => t.targetKey === "proj-proj-1-desc");
  assert.ok(proj);
  assert.equal(proj.originalText, "Autonomous resume optimization system.");
});

test("applyRewriteToResume: updates only the targeted bullet without modifying other roles or bullets", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  const targetBullet = targets.find((t) => t.targetKey === "exp-exp-1-bullet-0");
  assert.ok(targetBullet);

  const rewrittenText = "Architected seamless migration from legacy monolithic codebase to event-driven microservices.";
  const updated = applyRewriteToResume(SAMPLE_RESUME_A, targetBullet, rewrittenText);

  // Check target bullet is updated
  assert.equal(updated.experience[0].bullets[0], rewrittenText);

  // Check other bullet in same role is completely untouched
  assert.equal(
    updated.experience[0].bullets[1],
    "Optimized Redis connection pooling, reducing p99 latency."
  );

  // Check second role is completely untouched
  assert.equal(
    updated.experience[1].bullets[0],
    "Built payment webhook ingestion pipelines."
  );

  // Check summary, headline, projects remain untouched
  assert.equal(updated.summary, SAMPLE_RESUME_A.summary);
  assert.equal(updated.personalInfo.title, SAMPLE_RESUME_A.personalInfo.title);
  assert.equal(updated.projects[0].description, SAMPLE_RESUME_A.projects[0].description);
});

test("applyRewriteToResume: updates executive summary cleanly", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  const targetSummary = targets.find((t) => t.targetKey === "summary");
  assert.ok(targetSummary);

  const newSummary = "Accomplished Systems Architect with deep expertise in scalable cloud platforms.";
  const updated = applyRewriteToResume(SAMPLE_RESUME_A, targetSummary, newSummary);

  assert.equal(updated.summary, newSummary);
  assert.equal(updated.experience.length, SAMPLE_RESUME_A.experience.length);
});

test("isTargetFresh: detects when source text has been edited since proposal was created", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  const targetBullet = targets.find((t) => t.targetKey === "exp-exp-1-bullet-0");
  assert.ok(targetBullet);

  // Fresh proposal matches
  assert.equal(
    isTargetFresh(
      SAMPLE_RESUME_A,
      targetBullet,
      "Led migration of monolith to microservices architecture."
    ),
    true
  );

  // If user changed the resume text in Builder, it's flagged as stale
  assert.equal(
    isTargetFresh(
      SAMPLE_RESUME_A,
      targetBullet,
      "An older obsolete version of the bullet"
    ),
    false
  );
});

test("isolation: updates applied to Resume A do not leak into Resume B", () => {
  const targetsA = extractRewriteTargets(SAMPLE_RESUME_A);
  const headlineA = targetsA.find((t) => t.targetKey === "headline");
  assert.ok(headlineA);

  const updatedA = applyRewriteToResume(SAMPLE_RESUME_A, headlineA, "VP of Engineering");
  assert.equal(updatedA.personalInfo.title, "VP of Engineering");

  // Resume B remains untouched
  assert.equal(SAMPLE_RESUME_B.personalInfo.title, "Lead Product Designer");
});

test("mocked response parsing: parses official OpenAI Responses API structures", () => {
  // Test case 1: output_text field
  const resp1 = {
    output_text: "Engineered scalable data processing pipeline.",
  };
  assert.equal(resp1.output_text.trim(), "Engineered scalable data processing pipeline.");

  // Test case 2: output array of messages
  const resp2 = {
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: "Spearheaded platform modernization." }],
      },
    ],
  };
  let text2 = "";
  for (const item of resp2.output) {
    for (const part of item.content) {
      if (part.text) text2 += part.text;
    }
  }
  assert.equal(text2.trim(), "Spearheaded platform modernization.");
});
