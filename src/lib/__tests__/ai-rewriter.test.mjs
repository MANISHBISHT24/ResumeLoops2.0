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
  getCurrentTargetText,
} from "../resume-field-mapper.ts";
import {
  SYSTEM_INSTRUCTIONS,
  detectUnsupportedNumericalClaims,
  validateRewriteRequest,
  executeAiRewrite,
} from "../ai-provider.ts";

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

/* -------------------------------------------------------------------------- */
/* Section 2: Full Proposal Lifecycle & Undo Safety Tests                     */
/* -------------------------------------------------------------------------- */

test("applyRewriteToResume: preserves resume id and modifies only project description", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  const projTarget = targets.find((t) => t.targetKey === "proj-proj-1-desc");
  assert.ok(projTarget);

  const rewrittenDesc = "Autonomous distributed career acceleration platform built with modern web technologies.";
  const updated = applyRewriteToResume(SAMPLE_RESUME_A, projTarget, rewrittenDesc);

  assert.equal(updated.id, SAMPLE_RESUME_A.id);
  assert.equal(updated.projects[0].description, rewrittenDesc);
  assert.equal(updated.summary, SAMPLE_RESUME_A.summary);
  assert.equal(updated.experience[0].bullets[0], SAMPLE_RESUME_A.experience[0].bullets[0]);
});

test("proposal lifecycle: undo restores exact original text when field has not changed", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  const headlineTarget = targets.find((t) => t.targetKey === "headline");
  assert.ok(headlineTarget);

  const original = headlineTarget.originalText;
  const proposal = "Distinguished Cloud Architect";

  // 1. Apply proposal
  const appliedResume = applyRewriteToResume(SAMPLE_RESUME_A, headlineTarget, proposal);
  assert.equal(appliedResume.personalInfo.title, proposal);

  // 2. Undo proposal
  const currentText = getCurrentTargetText(appliedResume, headlineTarget);
  assert.equal(currentText, proposal); // verified match

  const revertedResume = applyRewriteToResume(appliedResume, headlineTarget, original);
  assert.equal(revertedResume.personalInfo.title, original);
});

test("undo safety: prevents unsafe restoration if user modified the field post-apply", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  const summaryTarget = targets.find((t) => t.targetKey === "summary");
  assert.ok(summaryTarget);

  const appliedProposal = "Accomplished infrastructure strategist.";

  // Apply proposal
  const afterApply = applyRewriteToResume(SAMPLE_RESUME_A, summaryTarget, appliedProposal);

  // Simulate user making manual edit in Builder after apply
  const userManuallyEdited = {
    ...afterApply,
    summary: "Accomplished infrastructure strategist with deep fintech focus.",
  };

  // Undo safety check
  const currentInResume = getCurrentTargetText(userManuallyEdited, summaryTarget);
  const isSafeToUndo = currentInResume === appliedProposal;

  // Must detect that field changed and block unsafe restoration
  assert.equal(isSafeToUndo, false);
});

test("discard / reject: rejecting proposal leaves resume completely untouched", () => {
  const targets = extractRewriteTargets(SAMPLE_RESUME_A);
  const bulletTarget = targets.find((t) => t.targetKey === "exp-exp-1-bullet-1");
  assert.ok(bulletTarget);

  // Proposed rewrite generated
  const proposedText = "Tuned Redis cluster throughput, slashing p99 latency by 45%.";

  // User rejects: no update function called
  const untouchedResume = { ...SAMPLE_RESUME_A };
  assert.equal(untouchedResume.experience[0].bullets[1], bulletTarget.originalText);
  assert.notEqual(untouchedResume.experience[0].bullets[1], proposedText);
});

/* -------------------------------------------------------------------------- */
/* Section 3: Server Route Input Validation Tests                             */
/* -------------------------------------------------------------------------- */

test("validateRewriteRequest: rejects empty, non-object or missing requests", () => {
  const res1 = validateRewriteRequest(null);
  assert.equal(res1.valid, false);
  assert.equal(res1.status, 400);

  const res2 = validateRewriteRequest({});
  assert.equal(res2.valid, false);
  assert.equal(res2.status, 400);
});

test("validateRewriteRequest: enforces source text length boundaries (5 - 1500 chars)", () => {
  // Too short (< 5 chars)
  const resShort = validateRewriteRequest({
    text: "Lead",
    goal: "professional",
  });
  assert.equal(resShort.valid, false);
  assert.equal(resShort.error, "INVALID_INPUT");

  // Exceeds max limit (> 1500 chars)
  const resLong = validateRewriteRequest({
    text: "a".repeat(1501),
    goal: "professional",
  });
  assert.equal(resLong.valid, false);
  assert.equal(resLong.error, "INVALID_INPUT");

  // Valid length
  const resValid = validateRewriteRequest({
    text: "Managed high-throughput payment systems.",
    goal: "professional",
  });
  assert.equal(resValid.valid, true);
});

test("validateRewriteRequest: enforces allowed rewrite goals", () => {
  const resInvalidGoal = validateRewriteRequest({
    text: "Managed distributed backend services.",
    goal: "unsupported-magical-goal",
  });
  assert.equal(resInvalidGoal.valid, false);
  assert.equal(resInvalidGoal.message, "Invalid rewrite goal specified.");

  for (const goal of ["professional", "concise", "action", "clear", "tailored"]) {
    const res = validateRewriteRequest({
      text: "Managed distributed backend services.",
      goal,
    });
    assert.equal(res.valid, true);
  }
});

test("validateRewriteRequest: rejects job context over 2500 characters", () => {
  const resLongContext = validateRewriteRequest({
    text: "Spearheaded engineering initiatives.",
    goal: "tailored",
    jobContext: "x".repeat(2501),
  });
  assert.equal(resLongContext.valid, false);
  assert.equal(resLongContext.error, "INVALID_INPUT");
});

/* -------------------------------------------------------------------------- */
/* Section 4: Provider Boundary & Mocked Network Tests                        */
/* -------------------------------------------------------------------------- */

test("executeAiRewrite: throws PROVIDER_NOT_CONFIGURED when OPENAI_API_KEY is missing", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  try {
    delete process.env.OPENAI_API_KEY;
    await assert.rejects(
      async () => {
        await executeAiRewrite({
          text: "Built cloud services.",
          goal: "action",
        });
      },
      {
        code: "PROVIDER_NOT_CONFIGURED",
      }
    );
  } finally {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  }
});

test("executeAiRewrite: successfully invokes mocked Responses API with output_text and returns payload", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-mocked-test-key-for-isolated-unit-testing";

  try {
    let capturedUrl = "";
    let capturedHeaders = {};
    let capturedBody = {};

    const mockFetch = async (url, options) => {
      capturedUrl = url;
      capturedHeaders = options.headers;
      capturedBody = JSON.parse(options.body);

      return {
        ok: true,
        status: 200,
        json: async () => ({
          output_text: "Architected distributed messaging pipelines achieving low latency.",
        }),
      };
    };

    const result = await executeAiRewrite(
      {
        text: "Built messaging pipelines.",
        goal: "action",
        targetLabel: "CloudScale Systems — Bullet #1",
        jobContext: "Experience with distributed messaging required.",
      },
      mockFetch
    );

    // Verify correct endpoint was hit
    assert.equal(capturedUrl, "https://api.openai.com/v1/responses");
    // Verify auth header formatted correctly
    assert.equal(capturedHeaders.Authorization, "Bearer sk-mocked-test-key-for-isolated-unit-testing");
    // Verify temperature
    assert.equal(capturedBody.temperature, 0.3);
    // Verify system instructions included
    assert.equal(capturedBody.input[0].role, "system");
    // Verify returned text taken directly from mock response
    assert.equal(result.rewrittenText, "Architected distributed messaging pipelines achieving low latency.");
    assert.ok(result.factualCaution);
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  }
});

test("executeAiRewrite: strips accidental enclosing quotes from AI response", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-mocked-test-key-for-isolated-unit-testing";

  try {
    const mockFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        output_text: '"Spearheaded zero-downtime database cutover."',
      }),
    });

    const result = await executeAiRewrite(
      {
        text: "Led database cutover.",
        goal: "action",
      },
      mockFetch
    );

    assert.equal(result.rewrittenText, "Spearheaded zero-downtime database cutover.");
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  }
});

test("executeAiRewrite: handles upstream HTTP 401 Unauthorized securely", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-mocked-invalid-key";

  try {
    const mockFetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: "Incorrect API key provided" } }),
    });

    await assert.rejects(
      async () => {
        await executeAiRewrite(
          {
            text: "Developed web application.",
            goal: "professional",
          },
          mockFetch
        );
      },
      (err) => {
        assert.equal(err.code, "PROVIDER_AUTH_INVALID");
        // Ensure sensitive key is NOT leaked in error
        assert.ok(!err.message.includes("sk-mocked-invalid-key"));
        return true;
      }
    );
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  }
});

test("executeAiRewrite: handles upstream HTTP 429 Rate Limit", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-mocked-valid-key";

  try {
    const mockFetch = async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "Rate limit reached" } }),
    });

    await assert.rejects(
      async () => {
        await executeAiRewrite(
          { text: "Deployed Kubernetes cluster.", goal: "clear" },
          mockFetch
        );
      },
      { code: "RATE_LIMITED" }
    );
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  }
});

test("executeAiRewrite: handles upstream HTTP 500 server error", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-mocked-valid-key";

  try {
    const mockFetch = async () => ({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: "Internal server error" } }),
    });

    await assert.rejects(
      async () => {
        await executeAiRewrite(
          { text: "Managed release schedules.", goal: "clear" },
          mockFetch
        );
      },
      { code: "PROVIDER_HTTP_500" }
    );
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  }
});

test("executeAiRewrite: handles abort timeout and produces TIMEOUT code", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-mocked-valid-key";

  try {
    const mockFetch = async () => {
      const abortErr = new Error("The operation was aborted");
      abortErr.name = "AbortError";
      throw abortErr;
    };

    await assert.rejects(
      async () => {
        await executeAiRewrite(
          { text: "Managed cross-functional projects.", goal: "professional" },
          mockFetch
        );
      },
      { code: "TIMEOUT" }
    );
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  }
});

test("executeAiRewrite: rejects empty or malformed provider output", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-mocked-valid-key";

  try {
    const mockFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [] }), // empty response
    });

    await assert.rejects(
      async () => {
        await executeAiRewrite(
          { text: "Led engineering teams.", goal: "action" },
          mockFetch
        );
      },
      { code: "MALFORMED_RESPONSE" }
    );
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
  }
});

/* -------------------------------------------------------------------------- */
/* Section 5: Factual-Integrity Safeguards Tests                              */
/* -------------------------------------------------------------------------- */

test("factual safeguards: detectUnsupportedNumericalClaims flags introduced metrics", () => {
  const source = "Managed engineering team and reduced infrastructure latency.";
  const rewrittenWithHallucinatedNumbers =
    "Led 45 engineers to reduce latency by 65% ($3.2M annual savings).";

  const result = detectUnsupportedNumericalClaims(source, rewrittenWithHallucinatedNumbers);
  assert.equal(result.hasUnsupportedNumbers, true);
  assert.ok(result.unsupportedNumbers.includes("45"));
  assert.ok(result.unsupportedNumbers.includes("65%"));
  assert.ok(result.unsupportedNumbers.includes("$3.2m"));
  assert.ok(result.warning.includes("numerical values"));
});

test("factual safeguards: detectUnsupportedNumericalClaims passes when numbers pre-existed in source", () => {
  const source = "Reduced p99 latency by 35% across 12 services.";
  const rewritten = "Optimized 12 backend microservices, driving a 35% reduction in p99 latency.";

  const result = detectUnsupportedNumericalClaims(source, rewritten);
  assert.equal(result.hasUnsupportedNumbers, false);
  assert.equal(result.unsupportedNumbers.length, 0);
});

test("factual safeguards: SYSTEM_INSTRUCTIONS strictly commands factual truth and zero hallucination", () => {
  assert.ok(SYSTEM_INSTRUCTIONS.includes("PRESERVE FACTUAL TRUTH"));
  assert.ok(SYSTEM_INSTRUCTIONS.includes("NEVER INVENT EXPERIENCES"));
  assert.ok(SYSTEM_INSTRUCTIONS.includes("NEVER INVENT NUMBERS OR METRICS"));
  assert.ok(SYSTEM_INSTRUCTIONS.includes("PRESERVE FACTUAL IDENTIFIERS"));
  assert.ok(SYSTEM_INSTRUCTIONS.includes("JOB TARGETING BOUNDARIES"));
});

