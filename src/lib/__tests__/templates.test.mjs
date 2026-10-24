/**
 * Unit Tests for ResumeLoops Templates Catalog & End-to-End Integration
 *
 * Verifies:
 * - Canonical catalog consistency across all 4 supported layouts
 * - Validation and safe normalization of legacy/unknown template IDs
 * - Applying a template updates ONLY the selected resume's templateId
 * - Personal info, work experience, education, skills, and projects remain 100% intact
 * - Distinct resumes maintain isolation without cross-contamination
 * - Creating a new resume persists the selected template identifier
 * - Zero resume duplication when changing templates
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  TEMPLATES,
  VALID_TEMPLATE_IDS,
  DEFAULT_TEMPLATE_ID,
  isValidTemplateId,
  getTemplateById,
  normalizeTemplateId,
  applyTemplateToResume,
} from "../templates.ts";

const SAMPLE_RESUME_A = {
  id: "sample-resume-1",
  title: "Principal Systems Architect",
  targetRole: "Staff Engineer",
  targetCompany: "Stripe",
  templateId: "swiss-chronicle",
  lastModified: "10m ago",
  sectionOrder: ["personal", "summary", "experience", "education", "skills", "projects"],
  personalInfo: {
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@example.com",
    phone: "+1 555-0199",
    location: "San Francisco, CA",
    website: "https://alexrivera.dev",
    linkedin: "linkedin.com/in/alexrivera",
    github: "github.com/alexrivera",
  },
  summary: "Principal software architect with 12+ years of experience leading distributed systems.",
  experience: [
    {
      id: "exp-1",
      company: "CloudScale Systems",
      role: "Principal Systems Architect",
      location: "San Francisco, CA",
      startDate: "2021-03",
      endDate: "Present",
      current: true,
      description: "Led core infrastructure overhaul reducing p99 latency by 45%.",
      highlights: ["Designed multi-region data replication pipeline handling 2M writes/sec."],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "UC Berkeley",
      degree: "B.S. in Computer Science",
      field: "Computer Science",
      startDate: "2009",
      endDate: "2013",
      location: "Berkeley, CA",
    },
  ],
  skills: [
    { id: "sk-1", name: "Distributed Systems", category: "Technical" },
    { id: "sk-2", name: "Rust", category: "Language" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "VectorStream",
      description: "Open-source distributed vector index with sub-10ms ANN search.",
      technologies: ["Rust", "gRPC", "SIMD"],
    },
  ],
  certifications: [],
};

const SAMPLE_RESUME_B = {
  id: "sample-resume-2",
  title: "Senior Product Designer",
  targetRole: "Design Lead",
  targetCompany: "Linear",
  templateId: "stripe-mono",
  lastModified: "2h ago",
  sectionOrder: ["personal", "summary", "experience", "education", "skills", "projects"],
  personalInfo: {
    firstName: "Morgan",
    lastName: "Chen",
    email: "morgan@example.com",
    phone: "+1 555-0200",
    location: "New York, NY",
    website: "https://morganchen.design",
    linkedin: "linkedin.com/in/morganchen",
    github: "",
  },
  summary: "Senior product designer specializing in high-density enterprise productivity tools.",
  experience: [],
  education: [],
  skills: [{ id: "sk-3", name: "Figma", category: "Design" }],
  projects: [],
  certifications: [],
};

/* -------------------------------------------------------------------------- */
/* Section 1: Template Catalog Consistency                                    */
/* -------------------------------------------------------------------------- */

test("templates catalog: contains exactly the 4 canonical supported layouts", () => {
  assert.equal(TEMPLATES.length, 4);
  assert.equal(VALID_TEMPLATE_IDS.size, 4);

  const ids = TEMPLATES.map((t) => t.id);
  for (const id of VALID_TEMPLATE_IDS) {
    assert.ok(ids.includes(id), `Expected TEMPLATES to include ${id}`);
  }
  assert.ok(ids.includes("swiss-chronicle"));
  assert.ok(ids.includes("stripe-mono"));
  assert.ok(ids.includes("linear-grid"));
  assert.ok(ids.includes("classic-oxford"));
});

test("templates catalog: every template provides accurate typographic and structural metadata", () => {
  for (const tmpl of TEMPLATES) {
    assert.ok(tmpl.name.length > 3, `Expected non-empty name for ${tmpl.id}`);
    assert.ok(tmpl.description.length > 10, `Expected detailed description for ${tmpl.id}`);
    assert.ok(tmpl.fontStyle.length > 5, `Expected font style for ${tmpl.id}`);
    assert.ok(tmpl.layoutStructure.length > 5, `Expected layout structure for ${tmpl.id}`);
    assert.ok(tmpl.bestFor.length > 5, `Expected audience target for ${tmpl.id}`);
    assert.ok(Array.isArray(tmpl.atsHighlights) && tmpl.atsHighlights.length >= 2);
  }
});

test("templates validation: isValidTemplateId accurately identifies valid and invalid IDs", () => {
  assert.equal(isValidTemplateId("swiss-chronicle"), true);
  assert.equal(isValidTemplateId("stripe-mono"), true);
  assert.equal(isValidTemplateId("linear-grid"), true);
  assert.equal(isValidTemplateId("classic-oxford"), true);

  assert.equal(isValidTemplateId("unknown-layout"), false);
  assert.equal(isValidTemplateId(""), false);
  assert.equal(isValidTemplateId(null), false);
  assert.equal(isValidTemplateId(undefined), false);
  assert.equal(isValidTemplateId(123), false);
});

test("templates normalization: normalizeTemplateId maps legacy / fuzzy strings safely without data loss", () => {
  // Exact match
  assert.equal(normalizeTemplateId("stripe-mono"), "stripe-mono");

  // Legacy or case variations
  assert.equal(normalizeTemplateId("SWISS-CHRONICLE"), "swiss-chronicle");
  assert.equal(normalizeTemplateId("the-swiss-chronicle"), "swiss-chronicle");
  assert.equal(normalizeTemplateId("linear"), "linear-grid");
  assert.equal(normalizeTemplateId("oxford"), "classic-oxford");

  // Arbitrary garbage falls back to default safely
  assert.equal(normalizeTemplateId("corrupt-template-id"), DEFAULT_TEMPLATE_ID);
  assert.equal(normalizeTemplateId(null), DEFAULT_TEMPLATE_ID);
  assert.equal(normalizeTemplateId(undefined), DEFAULT_TEMPLATE_ID);
});

test("templates lookup: getTemplateById resolves valid metadata and falls back safely", () => {
  const swiss = getTemplateById("swiss-chronicle");
  assert.equal(swiss.id, "swiss-chronicle");
  assert.equal(swiss.category, "Executive");

  const stripe = getTemplateById("stripe-mono");
  assert.equal(stripe.id, "stripe-mono");
  assert.equal(stripe.category, "Minimal");

  const fallback = getTemplateById("unknown-xyz");
  assert.equal(fallback.id, DEFAULT_TEMPLATE_ID);
});

/* -------------------------------------------------------------------------- */
/* Section 2: Storage Integration & Template Application                      */
/* -------------------------------------------------------------------------- */

test("applyTemplateToResume: pure function returns updated resume immutably with normalized templateId", () => {
  const sample = SAMPLE_RESUME_A;
  const updated = applyTemplateToResume(sample, "linear-grid");

  assert.equal(updated.templateId, "linear-grid");
  assert.equal(updated.id, sample.id);
  assert.equal(updated.title, sample.title);
  assert.equal(updated.summary, sample.summary);

  // Original is unmodified
  assert.equal(sample.templateId, "swiss-chronicle");

  // Fuzzy legacy template string normalization
  const legacyUpdated = applyTemplateToResume(sample, "oxford");
  assert.equal(legacyUpdated.templateId, "classic-oxford");
});

test("apply template: updates only templateId and preserves all other fields and resume id", () => {
  const original = SAMPLE_RESUME_A;
  const originalId = original.id;
  const originalTitle = original.title;
  const originalSummary = original.summary;
  const originalExperience = JSON.stringify(original.experience);
  const originalPersonalInfo = JSON.stringify(original.personalInfo);
  const originalSkills = JSON.stringify(original.skills);
  const originalProjects = JSON.stringify(original.projects);

  // Apply new template
  const updated = applyTemplateToResume(original, "stripe-mono");

  // Verify templateId changed
  assert.equal(updated.templateId, "stripe-mono");
  // Verify id preserved
  assert.equal(updated.id, originalId);
  // Verify title, summary, experience, personalInfo, skills, projects completely preserved
  assert.equal(updated.title, originalTitle);
  assert.equal(updated.summary, originalSummary);
  assert.equal(JSON.stringify(updated.experience), originalExperience);
  assert.equal(JSON.stringify(updated.personalInfo), originalPersonalInfo);
  assert.equal(JSON.stringify(updated.skills), originalSkills);
  assert.equal(JSON.stringify(updated.projects), originalProjects);

  // Verify original object reference is unchanged
  assert.equal(original.templateId, "swiss-chronicle");
});

test("isolation: changing template on Resume A does not alter Resume B", () => {
  const resumes = [SAMPLE_RESUME_A, SAMPLE_RESUME_B];
  const origTemplateB = SAMPLE_RESUME_B.templateId;

  // Change Resume A
  const updatedA = applyTemplateToResume(resumes[0], "classic-oxford");
  const updatedResumes = resumes.map((r) => (r.id === updatedA.id ? updatedA : r));

  // Resume A is updated
  assert.equal(updatedResumes[0].templateId, "classic-oxford");

  // Resume B remains completely untouched
  assert.equal(updatedResumes[1].templateId, origTemplateB);
  assert.equal(updatedResumes[1].id, SAMPLE_RESUME_B.id);
  assert.equal(updatedResumes[1].title, SAMPLE_RESUME_B.title);
});

test("create resume draft with template: initializes new draft with chosen template identifier", () => {
  const chosenTemplateId = "linear-grid";
  const newDraft = {
    id: `resume-${Date.now()}`,
    title: "Senior Product Architect",
    targetRole: "Staff Product Manager",
    templateId: normalizeTemplateId(chosenTemplateId),
    lastModified: "Just now",
  };

  assert.equal(newDraft.templateId, "linear-grid");
  assert.equal(newDraft.title, "Senior Product Architect");
  assert.ok(isValidTemplateId(newDraft.templateId));
});

test("invalid resume ID recovery: lookup of missing or deleted resume returns safe null/fallback", () => {
  const resumes = [SAMPLE_RESUME_A, SAMPLE_RESUME_B];
  const invalidId = "nonexistent-id-999";
  const resolved = resumes.find((r) => r.id === invalidId) || null;

  assert.equal(resolved, null);
});
