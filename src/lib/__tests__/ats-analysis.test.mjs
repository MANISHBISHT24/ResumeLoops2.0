/**
 * Unit Tests for ResumeLoops ATS Analyzer Engine
 *
 * Verifies:
 * - Deterministic scoring for complete vs deficient resumes
 * - Separation between Resume Readiness and Job Match
 * - Keyword extraction, stop-word elimination, and occurrence counting
 * - Edge cases: empty resumes, missing sections, short job descriptions
 * - Non-mutation of input resume objects
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeResumeReadiness,
  extractKeywordsFromJobDescription,
  analyzeJobMatch,
} from "../ats-analysis.ts";

const SAMPLE_COMPLETE_RESUME = {
  id: "test-resume-1",
  title: "Senior Staff Infrastructure Engineer",
  targetRole: "Staff Infrastructure Engineer",
  targetCompany: "Stripe",
  templateId: "swiss-chronicle",
  lastModified: "Today",
  sectionOrder: ["personal", "summary", "experience", "skills", "education"],
  personalInfo: {
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    title: "Staff Infrastructure Engineer & Systems Architect",
    linkedin: "linkedin.com/in/alex-morgan",
    github: "github.com/alex-morgan",
    website: "https://alexmorgan.dev",
  },
  summary:
    "Distinguished Systems Engineer with 9+ years of expertise architecting high-throughput distributed infrastructure. Proven track record scaling core payments platforms to 100k RPS while improving system reliability to 99.999% and mentoring high-velocity engineering squads.",
  experience: [
    {
      id: "exp-1",
      role: "Staff Infrastructure Engineer",
      company: "Stripe",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      isCurrentRole: true,
      bullets: [
        "Architected distributed event-driven payment processing platform handling $2.5B annual GMV.",
        "Reduced p99 database query latency by 45% using Redis caching and connection pooling.",
        "Scaled Kubernetes clusters across multi-region AWS topology supporting 120k RPS throughput.",
      ],
    },
    {
      id: "exp-2",
      role: "Senior Distributed Systems Engineer",
      company: "Cloudflare",
      location: "San Francisco, CA",
      startDate: "2018",
      endDate: "2021",
      bullets: [
        "Implemented edge computing services in Golang and Rust, slashing egress bandwidth costs by $400k annually.",
        "Managed zero-trust network access compliance under rigorous PCI-DSS regulations.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      institution: "Stanford University",
      graduationYear: "2018",
      honors: "Magna Cum Laude",
    },
  ],
  skillCategories: [
    {
      id: "skills-1",
      categoryName: "Languages & Frameworks",
      skills: ["Golang", "Rust", "TypeScript", "Python", "React"],
    },
    {
      id: "skills-2",
      categoryName: "Cloud & Infrastructure",
      skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD"],
    },
    {
      id: "skills-3",
      categoryName: "Architecture & Security",
      skills: ["Distributed Systems", "PCI-DSS", "Zero-Trust", "Microservices"],
    },
  ],
  projects: [],
  certifications: [],
};

const DEFICIENT_RESUME = {
  id: "test-resume-empty",
  title: "Incomplete Resume",
  templateId: "stripe-mono",
  lastModified: "Never",
  sectionOrder: ["personal"],
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "not-an-email",
    title: "",
  },
  summary: "Too short",
  experience: [],
  education: [],
  skillCategories: [],
  projects: [],
  certifications: [],
};

test("analyzeResumeReadiness: awards high score to complete, quantified resume", () => {
  const result = analyzeResumeReadiness(SAMPLE_COMPLETE_RESUME);
  assert.ok(result.overallScore >= 90, `Expected score >= 90, got ${result.overallScore}`);
  assert.equal(result.scoreLevel, "Exceptional");
  assert.equal(result.parserReadableRate, 100);
  assert.equal(result.hasQuantifiedImpact, true);
  assert.equal(result.categories.length, 5);

  // Check categories
  const contactCat = result.categories.find((c) => c.id === "cat-contact");
  assert.ok(contactCat && contactCat.score === 20);

  const expCat = result.categories.find((c) => c.id === "cat-experience");
  assert.ok(expCat && expCat.score === 30);
});

test("analyzeResumeReadiness: identifies deficiencies and generates actionable fixes", () => {
  const result = analyzeResumeReadiness(DEFICIENT_RESUME);
  assert.ok(result.overallScore < 50, `Expected score < 50, got ${result.overallScore}`);
  assert.equal(result.scoreLevel, "Needs Attention");
  assert.ok(result.actionableFixes.length >= 3);

  // Check that missing email and name were flagged
  const nameCheck = result.checks.find((c) => c.id === "contact-name");
  assert.equal(nameCheck?.status, "needs-attention");

  const emailCheck = result.checks.find((c) => c.id === "contact-email");
  assert.equal(emailCheck?.status, "needs-attention");
});

test("analyzeResumeReadiness: does not mutate the input resume", () => {
  const clone = JSON.parse(JSON.stringify(SAMPLE_COMPLETE_RESUME));
  analyzeResumeReadiness(SAMPLE_COMPLETE_RESUME);
  assert.deepEqual(SAMPLE_COMPLETE_RESUME, clone);
});

test("extractKeywordsFromJobDescription: extracts technical phrases and filters stop words", () => {
  const jobDescription = `
    We are seeking a Staff Infrastructure Engineer to join our Payments Platform team at Stripe.
    Requirements:
    - 7+ years of experience with distributed systems and microservices architecture.
    - Deep knowledge of Kubernetes, Docker, and AWS cloud infrastructure.
    - Experience with PCI-DSS compliance and zero-trust security.
    - Proficiency in Golang, Rust, or TypeScript.
    - Proven ability to optimize low latency services under high throughput.
  `;

  const { terms, detectedRole } = extractKeywordsFromJobDescription(jobDescription);

  assert.ok(terms.includes("distributed systems"));
  assert.ok(terms.includes("microservices architecture"));
  assert.ok(terms.includes("kubernetes"));
  assert.ok(terms.includes("pci-dss"));
  assert.ok(terms.includes("golang"));

  // Check stop words are filtered
  assert.ok(!terms.includes("we"));
  assert.ok(!terms.includes("seeking"));
  assert.ok(!terms.includes("years"));
  assert.ok(!terms.includes("experience"));
  assert.ok(!terms.includes("team"));

  assert.equal(detectedRole, "Staff Infrastructure Engineer");
});

test("analyzeJobMatch: accurately calculates matched and missing keywords", () => {
  const jobDescription = `
    Looking for a Staff Engineer with expertise in:
    - Distributed systems, Golang, Kubernetes, and PCI-DSS compliance.
    - Experience in Apache Cassandra and GraphQL federation.
  `;

  const match = analyzeJobMatch(SAMPLE_COMPLETE_RESUME, jobDescription);
  assert.ok(match !== null);
  assert.ok(match.matchedCount > 0);
  assert.ok(match.totalKeywordsAnalyzed > 0);

  // Cassandra is not in sample resume, so it must be missing
  assert.ok(match.missingKeywords.some((k) => k.toLowerCase().includes("cassandra")));

  // Distributed systems and Kubernetes are in sample resume, so they must be matched
  assert.ok(match.matchedKeywords.some((k) => k.term.toLowerCase().includes("distributed systems")));
  assert.ok(match.matchedKeywords.some((k) => k.term.toLowerCase().includes("kubernetes")));
});

test("analyzeJobMatch: returns null when job description is empty or too short", () => {
  assert.equal(analyzeJobMatch(SAMPLE_COMPLETE_RESUME, ""), null);
  assert.equal(analyzeJobMatch(SAMPLE_COMPLETE_RESUME, "   "), null);
  assert.equal(analyzeJobMatch(SAMPLE_COMPLETE_RESUME, "short text"), null);
});
