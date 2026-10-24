/**
 * ResumeLoops Algorithmic ATS Analyzer Engine
 *
 * Deterministic, rule-based resume readiness scoring and job description keyword matching.
 * - Zero artificial delays or simulated AI timeouts.
 * - Transparent scoring rubric based on concrete resume fields.
 * - Accurate keyword tokenization, stop-word elimination, and occurrence counting.
 * - Strict separation between Resume Readiness (0-100) and Job Match (0-100%).
 * - Explicit disclaimer that no score guarantees interview outcomes or represents a proprietary ATS algorithm.
 */

import type { Resume } from "../types/resume";

export interface ResumeCheck {
  id: string;
  category: "contact" | "summary" | "experience" | "education" | "skills" | "structure";
  title: string;
  status: "passed" | "warning" | "needs-attention";
  score: number;
  maxScore: number;
  message: string;
  suggestion?: string;
}

export interface CategoryScore {
  id: string;
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  description: string;
}

export interface ActionableFix {
  id: string;
  title: string;
  impact: "High" | "Medium" | "Low";
  category: string;
  suggestion: string;
}

export interface ReadinessResult {
  overallScore: number;
  scoreLevel: "Exceptional" | "Competitive" | "Developing" | "Needs Attention";
  levelDescription: string;
  parserReadableRate: number; // percentage of critical structural fields present
  hasQuantifiedImpact: boolean;
  categories: CategoryScore[];
  checks: ResumeCheck[];
  actionableFixes: ActionableFix[];
}

export interface KeywordMatchItem {
  term: string;
  count: number;
  matchStrength: "high" | "medium" | "missing";
  percentage: number;
}

export interface JobMatchResult {
  matchPercentage: number;
  matchedCount: number;
  totalKeywordsAnalyzed: number;
  matchedKeywords: KeywordMatchItem[];
  missingKeywords: string[];
  targetRoleDetected?: string;
  disclaimer: string;
}

/* ==========================================================================
   STOP WORDS & BOILERPLATE LIST
   Comprehensive filter for English functional words and recruiting boilerplate.
   ========================================================================== */

const ENGLISH_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "also", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't", "did",
  "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few",
  "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't",
  "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
  "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", "just", "me",
  "more", "most", "must", "my", "myself", "no", "nor", "not", "of", "off", "on",
  "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over",
  "own", "same", "she", "should", "shouldn't", "so", "some", "such", "than", "that",
  "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
  "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "wasn't", "we", "were", "weren't", "what", "when", "where", "which", "while", "who",
  "whom", "why", "with", "won't", "would", "wouldn't", "you", "your", "yours",
  "yourself", "yourselves",
]);

const RECRUITING_BOILERPLATE = new Set([
  "ability", "able", "across", "action", "actions", "applicant", "applicants",
  "apply", "applying", "background", "best", "building", "built", "candidate",
  "candidates", "career", "collaborate", "collaborating", "collaboration", "company",
  "culture", "degree", "demonstrated", "department", "description", "duty", "duties",
  "employment", "environment", "equal", "etc", "excellent", "experience", "experiences",
  "expert", "expertise", "familiar", "familiarity", "fast", "field", "fields", "flexible",
  "full", "good", "great", "group", "groups", "grow", "growth", "hands", "help",
  "helping", "high", "hire", "hiring", "ideal", "impact", "including", "industry",
  "initiative", "intern", "internship", "job", "join", "joining", "knowledge", "learn",
  "learning", "level", "looking", "manage", "managing", "must", "needed", "needs",
  "new", "offer", "offering", "open", "opportunity", "opportunities", "our", "part",
  "people", "person", "plus", "position", "positions", "post", "posting", "practice",
  "practices", "prefer", "preferred", "professional", "proven", "provide", "providing",
  "qualification", "qualifications", "qualified", "require", "required", "requirement",
  "requirements", "responsibility", "responsibilities", "responsible", "role", "roles",
  "salary", "seeking", "self", "skill", "skills", "solutions", "someone", "standards",
  "starter", "status", "strong", "successful", "suit", "suitable", "support", "supporting",
  "talent", "team", "teams", "time", "track", "understanding", "using", "valuable",
  "values", "variety", "well", "willing", "work", "worker", "workers", "working",
  "workplace", "year", "years",
]);

/**
 * Common technical and domain compound phrases (bigrams/trigrams) to extract accurately.
 */
const KNOWN_DOMAIN_PHRASES = [
  "distributed systems",
  "system architecture",
  "system design",
  "cloud infrastructure",
  "payment processing",
  "microservices architecture",
  "event-driven architecture",
  "zero trust",
  "zero-trust",
  "pci-dss",
  "pci-dss compliance",
  "continuous integration",
  "continuous delivery",
  "ci/cd",
  "ci/cd pipelines",
  "machine learning",
  "data pipelines",
  "data engineering",
  "front end",
  "back end",
  "full stack",
  "infrastructure as code",
  "object-oriented programming",
  "rest api",
  "rest apis",
  "graphql api",
  "unit testing",
  "integration testing",
  "code review",
  "performance optimization",
  "high throughput",
  "low latency",
  "fault tolerance",
  "relational database",
  "nosql database",
  "product design",
  "design systems",
  "design system",
  "user experience",
  "user research",
  "information architecture",
  "wireframing and prototyping",
  "interaction design",
  "cross-functional collaboration",
  "stakeholder management",
  "technical leadership",
  "agile methodology",
  "scrum master",
];

/* ==========================================================================
   PART A: RESUME READINESS ENGINE (0 - 100)
   ========================================================================== */

/**
 * Evaluates the structural completeness, contact validity, quantifiable achievement depth,
 * and content balance of a given Resume object.
 */
export function analyzeResumeReadiness(resume: Resume): ReadinessResult {
  const checks: ResumeCheck[] = [];
  const actionableFixes: ActionableFix[] = [];

  // ----------------------------------------------------
  // 1. Contact & Identity (Max: 20 pts)
  // ----------------------------------------------------
  let contactScore = 0;
  const fullName = `${resume.personalInfo.firstName || ""} ${resume.personalInfo.lastName || ""}`.trim();
  if (fullName.length >= 3) {
    contactScore += 5;
    checks.push({
      id: "contact-name",
      category: "contact",
      title: "Full Candidate Name",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: `Candidate name "${fullName}" is clearly defined.`,
    });
  } else {
    checks.push({
      id: "contact-name",
      category: "contact",
      title: "Full Candidate Name",
      status: "needs-attention",
      score: 0,
      maxScore: 5,
      message: "First and last name are missing or incomplete.",
      suggestion: "Enter your legal or preferred full name in the Personal Details section.",
    });
    actionableFixes.push({
      id: "fix-name",
      title: "Complete Full Name",
      impact: "High",
      category: "Personal Details",
      suggestion: "Recruiters and automated systems require a valid full name on the resume.",
    });
  }

  const title = (resume.personalInfo.title || "").trim();
  if (title.length >= 3) {
    contactScore += 5;
    checks.push({
      id: "contact-title",
      category: "contact",
      title: "Professional Headline",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: `Professional title "${title}" aligns your primary specialization.`,
    });
  } else {
    checks.push({
      id: "contact-title",
      category: "contact",
      title: "Professional Headline",
      status: "warning",
      score: 0,
      maxScore: 5,
      message: "No professional headline or title provided.",
      suggestion: "Add a clear professional headline (e.g. 'Senior Software Engineer' or 'Staff Product Designer').",
    });
    actionableFixes.push({
      id: "fix-title",
      title: "Add Professional Title",
      impact: "Medium",
      category: "Personal Details",
      suggestion: "A targeted headline clarifies your seniority and primary domain for recruiters.",
    });
  }

  const email = (resume.personalInfo.email || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && emailRegex.test(email)) {
    contactScore += 5;
    checks.push({
      id: "contact-email",
      category: "contact",
      title: "Valid Email Address",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: `Contact email (${email}) adheres to standard format.`,
    });
  } else {
    checks.push({
      id: "contact-email",
      category: "contact",
      title: "Valid Email Address",
      status: "needs-attention",
      score: 0,
      maxScore: 5,
      message: email ? `Email "${email}" has an invalid format.` : "Email address is missing.",
      suggestion: "Provide a valid, professional email address (e.g., name@domain.com).",
    });
    actionableFixes.push({
      id: "fix-email",
      title: "Provide Valid Email",
      impact: "High",
      category: "Personal Details",
      suggestion: "Recruiters and automated scheduling systems rely heavily on valid email contact.",
    });
  }

  const phone = (resume.personalInfo.phone || "").trim();
  const links = [
    resume.personalInfo.linkedin,
    resume.personalInfo.github,
    resume.personalInfo.website,
  ].filter(Boolean);

  if (phone.length >= 7 && links.length >= 1) {
    contactScore += 5;
    checks.push({
      id: "contact-reachability",
      category: "contact",
      title: "Phone & Online Portfolio",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: "Both telephone contact and verified professional profiles (LinkedIn/GitHub/Site) are included.",
    });
  } else if (phone.length >= 7 || links.length >= 1) {
    contactScore += 3;
    checks.push({
      id: "contact-reachability",
      category: "contact",
      title: "Phone & Online Portfolio",
      status: "warning",
      score: 3,
      maxScore: 5,
      message: phone.length >= 7 ? "Phone is included, but no LinkedIn/GitHub/Portfolio profile was found." : "Online profile included, but direct phone number is missing.",
      suggestion: "Add both a phone number and a LinkedIn or GitHub profile link for maximum recruiter convenience.",
    });
    actionableFixes.push({
      id: "fix-reachability",
      title: "Enhance Contact Reachability",
      impact: "Medium",
      category: "Personal Details",
      suggestion: phone.length < 7 ? "Add a direct phone number for screening calls." : "Add your LinkedIn or portfolio URL.",
    });
  } else {
    checks.push({
      id: "contact-reachability",
      category: "contact",
      title: "Phone & Online Portfolio",
      status: "needs-attention",
      score: 0,
      maxScore: 5,
      message: "Missing both direct phone contact and professional online links.",
      suggestion: "Add your phone number and LinkedIn/GitHub profile.",
    });
    actionableFixes.push({
      id: "fix-reachability-urgent",
      title: "Add Phone & Profile Links",
      impact: "High",
      category: "Personal Details",
      suggestion: "Recruiters need at least one reliable voice contact and online verification profile.",
    });
  }

  // ----------------------------------------------------
  // 2. Executive Summary (Max: 15 pts)
  // ----------------------------------------------------
  let summaryScore = 0;
  const summaryText = (resume.summary || "").trim();
  const wordCount = summaryText ? summaryText.split(/\s+/).filter(Boolean).length : 0;

  if (wordCount >= 30 && wordCount <= 120) {
    summaryScore = 15;
    checks.push({
      id: "summary-quality",
      category: "summary",
      title: "Professional Summary Quality",
      status: "passed",
      score: 15,
      maxScore: 15,
      message: `Optimal summary length (${wordCount} words) provides quick scanning velocity for recruiters.`,
    });
  } else if (wordCount > 120) {
    summaryScore = 10;
    checks.push({
      id: "summary-quality",
      category: "summary",
      title: "Professional Summary Length",
      status: "warning",
      score: 10,
      maxScore: 15,
      message: `Summary is slightly long (${wordCount} words). Recruiters typically spend 6-8 seconds scanning.`,
      suggestion: "Condense your summary to 3-4 impactful sentences (40-90 words).",
    });
    actionableFixes.push({
      id: "fix-summary-length",
      title: "Trim Summary Length",
      impact: "Low",
      category: "Executive Summary",
      suggestion: `Keep the summary between 40-90 words (currently ${wordCount} words) for rapid recruiter parsing.`,
    });
  } else if (wordCount >= 10) {
    summaryScore = 8;
    checks.push({
      id: "summary-quality",
      category: "summary",
      title: "Professional Summary Depth",
      status: "warning",
      score: 8,
      maxScore: 15,
      message: `Summary is brief (${wordCount} words). Elaborate on leadership scope and core specialization.`,
      suggestion: "Expand your summary to 30-80 words highlighting your key impact, seniority, and primary stack.",
    });
    actionableFixes.push({
      id: "fix-summary-depth",
      title: "Deepen Executive Summary",
      impact: "Medium",
      category: "Executive Summary",
      suggestion: "Summarize your career focus, notable achievements, and primary domain expertise in 3-4 sentences.",
    });
  } else {
    checks.push({
      id: "summary-quality",
      category: "summary",
      title: "Professional Summary",
      status: "needs-attention",
      score: 0,
      maxScore: 15,
      message: "No executive summary provided.",
      suggestion: "Add a concise summary statement highlighting your top qualifications.",
    });
    actionableFixes.push({
      id: "fix-summary-missing",
      title: "Add Executive Summary",
      impact: "High",
      category: "Executive Summary",
      suggestion: "An opening summary anchors the recruiter's understanding of your target level and domain.",
    });
  }

  // ----------------------------------------------------
  // 3. Work Experience & Quantifiable Impact (Max: 30 pts)
  // ----------------------------------------------------
  let experienceScore = 0;
  const experienceItems = resume.experience || [];

  if (experienceItems.length >= 2) {
    experienceScore += 10;
    checks.push({
      id: "exp-presence",
      category: "experience",
      title: "Work History Breadth",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `${experienceItems.length} professional roles documented with companies and dates.`,
    });
  } else if (experienceItems.length === 1) {
    experienceScore += 6;
    checks.push({
      id: "exp-presence",
      category: "experience",
      title: "Work History Breadth",
      status: "warning",
      score: 6,
      maxScore: 10,
      message: "Single experience role listed. Additional roles demonstrate career trajectory.",
      suggestion: "Add previous positions, internships, or relevant contracting roles.",
    });
  } else {
    checks.push({
      id: "exp-presence",
      category: "experience",
      title: "Work History Breadth",
      status: "needs-attention",
      score: 0,
      maxScore: 10,
      message: "No work experience entries found.",
      suggestion: "Add at least one professional position detailing role, company, and timeline.",
    });
    actionableFixes.push({
      id: "fix-exp-missing",
      title: "Add Work Experience Entries",
      impact: "High",
      category: "Work Experience",
      suggestion: "Professional experience is the core evaluation criteria for automated and manual screening.",
    });
  }

  // Bullet points depth check
  const allBullets = experienceItems.flatMap((e) => e.bullets || []).filter((b) => b.trim().length > 0);
  const avgBullets = experienceItems.length > 0 ? allBullets.length / experienceItems.length : 0;

  if (avgBullets >= 2.5) {
    experienceScore += 10;
    checks.push({
      id: "exp-bullets",
      category: "experience",
      title: "Achievement Bullet Density",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `Roles average ${avgBullets.toFixed(1)} achievement bullet points each.`,
    });
  } else if (avgBullets >= 1) {
    experienceScore += 5;
    checks.push({
      id: "exp-bullets",
      category: "experience",
      title: "Achievement Bullet Density",
      status: "warning",
      score: 5,
      maxScore: 10,
      message: "Some positions have fewer than 2-3 bullet points.",
      suggestion: "Aim for 3-5 concise achievement bullets per significant role.",
    });
    actionableFixes.push({
      id: "fix-exp-bullets",
      title: "Expand Achievement Bullets",
      impact: "Medium",
      category: "Work Experience",
      suggestion: "Add 2-3 detailed bullet points describing your technical contributions and team impact.",
    });
  } else {
    checks.push({
      id: "exp-bullets",
      category: "experience",
      title: "Achievement Bullet Density",
      status: "needs-attention",
      score: 0,
      maxScore: 10,
      message: "No achievement bullet points found in your work experience.",
      suggestion: "Add bullet points outlining your actions and outcomes for each position.",
    });
    actionableFixes.push({
      id: "fix-exp-bullets-urgent",
      title: "Add Role Bullet Points",
      impact: "High",
      category: "Work Experience",
      suggestion: "List concrete deliverables and responsibilities under each employer.",
    });
  }

  // Quantifiable Impact check: inspect bullets for numbers, percentages, currency, multipliers
  const metricRegex = /\b(\d+[\d,.]*%\b|\$\d+[\d,.]*[kmb]?\b|\b\d+x\b|\b\d+k\b|\b\d{2,}\b)/i;
  const quantifiedBullets = allBullets.filter((b) => metricRegex.test(b));
  const hasQuantifiedImpact = quantifiedBullets.length >= 2;

  if (quantifiedBullets.length >= 3) {
    experienceScore += 10;
    checks.push({
      id: "exp-metrics",
      category: "experience",
      title: "Quantifiable Impact & Metrics",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `Strong metric density: ${quantifiedBullets.length} bullets include measurable outcomes (%, $, scale, or volume).`,
    });
  } else if (quantifiedBullets.length >= 1) {
    experienceScore += 6;
    checks.push({
      id: "exp-metrics",
      category: "experience",
      title: "Quantifiable Impact & Metrics",
      status: "warning",
      score: 6,
      maxScore: 10,
      message: `Only ${quantifiedBullets.length} bullet contains numerical data or percentages.`,
      suggestion: "Quantify more accomplishments (e.g., 'reduced latency by 35%', 'scaled to 2M users', 'saved $120k').",
    });
    actionableFixes.push({
      id: "fix-metrics",
      title: "Quantify Key Achievements",
      impact: "Medium",
      category: "Work Experience",
      suggestion: "Incorporate metrics such as percentage gains, cost savings, user scale, or throughput numbers.",
    });
  } else {
    checks.push({
      id: "exp-metrics",
      category: "experience",
      title: "Quantifiable Impact & Metrics",
      status: "needs-attention",
      score: 0,
      maxScore: 10,
      message: "No quantifiable outcomes (percentages, dollar amounts, scaling metrics) detected.",
      suggestion: "Add specific metrics demonstrating the tangible impact of your work.",
    });
    actionableFixes.push({
      id: "fix-metrics-urgent",
      title: "Add Quantifiable Metrics",
      impact: "High",
      category: "Work Experience",
      suggestion: "High-scoring resumes substantiate claims with measurable metrics (e.g. latency, scale, volume).",
    });
  }

  // ----------------------------------------------------
  // 4. Skills Coverage & Organization (Max: 20 pts)
  // ----------------------------------------------------
  let skillsScore = 0;
  const allSkills = (resume.skillCategories || []).flatMap((c) => c.skills || []).map((s) => s.trim()).filter(Boolean);

  if (allSkills.length >= 8) {
    skillsScore += 10;
    checks.push({
      id: "skills-count",
      category: "skills",
      title: "Skills Inventory Depth",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `${allSkills.length} technical and domain skills listed across competency groups.`,
    });
  } else if (allSkills.length >= 4) {
    skillsScore += 6;
    checks.push({
      id: "skills-count",
      category: "skills",
      title: "Skills Inventory Depth",
      status: "warning",
      score: 6,
      maxScore: 10,
      message: `${allSkills.length} skills listed. Adding complementary tools or methodologies enhances search match.`,
      suggestion: "Aim for 8-15 core skills relevant to your target role.",
    });
    actionableFixes.push({
      id: "fix-skills-count",
      title: "Expand Relevant Skills",
      impact: "Medium",
      category: "Skills",
      suggestion: "Add 3-5 additional tools, frameworks, or methodologies you actively use.",
    });
  } else {
    checks.push({
      id: "skills-count",
      category: "skills",
      title: "Skills Inventory Depth",
      status: "needs-attention",
      score: 0,
      maxScore: 10,
      message: "Few or no skills listed.",
      suggestion: "List your primary technical competencies, tools, and methodologies.",
    });
    actionableFixes.push({
      id: "fix-skills-urgent",
      title: "List Core Competencies",
      impact: "High",
      category: "Skills",
      suggestion: "Skills sections allow recruiters to instantly filter candidates on core technical proficiencies.",
    });
  }

  // Skills categorization check
  const validCategories = (resume.skillCategories || []).filter((c) => (c.skills || []).length > 0);
  if (validCategories.length >= 1) {
    skillsScore += 10;
    checks.push({
      id: "skills-organization",
      category: "skills",
      title: "Categorized Taxonomy",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `Skills organized into ${validCategories.length} structured group(s).`,
    });
  } else {
    checks.push({
      id: "skills-organization",
      category: "skills",
      title: "Categorized Taxonomy",
      status: "needs-attention",
      score: 0,
      maxScore: 10,
      message: "No structured skill groups found.",
      suggestion: "Group your skills by category (e.g. 'Languages', 'Frameworks', 'DevOps & Tools').",
    });
  }

  // ----------------------------------------------------
  // 5. Education & Credentials (Max: 15 pts)
  // ----------------------------------------------------
  let educationScore = 0;
  const educationItems = resume.education || [];

  if (educationItems.length >= 1) {
    const validItem = educationItems.find((e) => e.degree?.trim() && e.institution?.trim());
    if (validItem) {
      educationScore += 10;
      checks.push({
        id: "edu-credentials",
        category: "education",
        title: "Academic & Degree Credentials",
        status: "passed",
        score: 10,
        maxScore: 10,
        message: `${validItem.degree} from ${validItem.institution} verified.`,
      });

      if (validItem.graduationYear?.trim()) {
        educationScore += 5;
        checks.push({
          id: "edu-timeline",
          category: "education",
          title: "Graduation Timeline",
          status: "passed",
          score: 5,
          maxScore: 5,
          message: `Graduation year (${validItem.graduationYear}) is clearly designated.`,
        });
      } else {
        checks.push({
          id: "edu-timeline",
          category: "education",
          title: "Graduation Timeline",
          status: "warning",
          score: 0,
          maxScore: 5,
          message: "Graduation year or completion date is omitted.",
          suggestion: "Add your graduation year or expected completion date.",
        });
      }
    } else {
      checks.push({
        id: "edu-credentials",
        category: "education",
        title: "Academic & Degree Credentials",
        status: "warning",
        score: 4,
        maxScore: 10,
        message: "Education entry is missing either degree title or institution name.",
        suggestion: "Specify both your degree and institution.",
      });
      actionableFixes.push({
        id: "fix-edu-details",
        title: "Specify Degree & Institution",
        impact: "Medium",
        category: "Education",
        suggestion: "Ensure both degree title and university/institution name are filled in.",
      });
    }
  } else {
    // If no formal education, check if extensive senior experience or certifications exist
    const hasCertifications = (resume.certifications || []).length > 0;
    const hasProjects = (resume.projects || []).length > 0;

    if (experienceItems.length >= 3 || hasCertifications || hasProjects) {
      educationScore += 8; // Informational / context-aware allowance for senior candidates
      checks.push({
        id: "edu-credentials",
        category: "education",
        title: "Education or Equivalent Track",
        status: "passed",
        score: 8,
        maxScore: 10,
        message: "Practical work experience or certifications provided in lieu of formal degree.",
      });
    } else {
      checks.push({
        id: "edu-credentials",
        category: "education",
        title: "Academic or Professional Training",
        status: "warning",
        score: 0,
        maxScore: 10,
        message: "No education entries, certifications, or portfolio projects found.",
        suggestion: "Add your educational background, bootcamp, or equivalent professional coursework.",
      });
      actionableFixes.push({
        id: "fix-edu-missing",
        title: "Include Educational Background",
        impact: "Medium",
        category: "Education",
        suggestion: "List your degree, university, bootcamp, or major professional training.",
      });
    }
  }

  // ----------------------------------------------------
  // TOTAL CALCULATION & RUBRIC ASSEMBLY
  // ----------------------------------------------------
  const overallScore = Math.min(100, Math.max(0,
    contactScore + summaryScore + experienceScore + skillsScore + educationScore
  ));

  let scoreLevel: ReadinessResult["scoreLevel"] = "Needs Attention";
  let levelDescription = "Essential resume sections are missing or require substantial detail.";

  if (overallScore >= 90) {
    scoreLevel = "Exceptional";
    levelDescription = "Comprehensive, well-structured document meeting professional recruiter scanning criteria.";
  } else if (overallScore >= 75) {
    scoreLevel = "Competitive";
    levelDescription = "Strong foundation with minor opportunities to deepen metrics or formatting clarity.";
  } else if (overallScore >= 60) {
    scoreLevel = "Developing";
    levelDescription = "Key credentials present, but would benefit from greater metric depth and summary refinement.";
  }

  // Structural readability rate (percentage of core structural headers present)
  const structuralCheckCount = 5;
  let structuralPassCount = 0;
  if (fullName.length > 0 && email.length > 0) structuralPassCount++;
  if (summaryText.length > 0) structuralPassCount++;
  if (experienceItems.length > 0) structuralPassCount++;
  if (allSkills.length > 0) structuralPassCount++;
  if (educationItems.length > 0 || (resume.projects || []).length > 0) structuralPassCount++;
  const parserReadableRate = Math.round((structuralPassCount / structuralCheckCount) * 100);

  const categories: CategoryScore[] = [
    {
      id: "cat-contact",
      category: "Contact & Identity",
      score: contactScore,
      maxScore: 20,
      percentage: Math.round((contactScore / 20) * 100),
      description: "Full name, professional headline, verified email, phone, and profile links.",
    },
    {
      id: "cat-summary",
      category: "Executive Summary",
      score: summaryScore,
      maxScore: 15,
      percentage: Math.round((summaryScore / 15) * 100),
      description: "Concise summary (30-100 words) articulating career focus and seniority.",
    },
    {
      id: "cat-experience",
      category: "Experience & Metrics",
      score: experienceScore,
      maxScore: 30,
      percentage: Math.round((experienceScore / 30) * 100),
      description: "Chronological employment history with quantifiable achievement bullet points.",
    },
    {
      id: "cat-skills",
      category: "Skills Organization",
      score: skillsScore,
      maxScore: 20,
      percentage: Math.round((skillsScore / 20) * 100),
      description: "Structured technical competencies, languages, frameworks, and tools.",
    },
    {
      id: "cat-education",
      category: "Education & Credentials",
      score: educationScore,
      maxScore: 15,
      percentage: Math.round((educationScore / 15) * 100),
      description: "Degrees, institutions, academic achievements, or equivalent credentials.",
    },
  ];

  return {
    overallScore,
    scoreLevel,
    levelDescription,
    parserReadableRate,
    hasQuantifiedImpact,
    categories,
    checks,
    actionableFixes,
  };
}

/* ==========================================================================
   PART B: JOB DESCRIPTION KEYWORD MATCHING ENGINE (0 - 100%)
   ========================================================================== */

/**
 * Extracts normalized, unique keywords and domain phrases from a raw job description text.
 */
export function extractKeywordsFromJobDescription(text: string): {
  terms: string[];
  detectedRole?: string;
} {
  if (!text || text.trim().length === 0) {
    return { terms: [] };
  }

  const normalized = text.toLowerCase();
  const extractedTerms = new Set<string>();

  // 1. Detect common target role from common introductory patterns
  let detectedRole: string | undefined;
  const roleMatch = text.match(/(?:looking for|seeking|hiring|role of|position of|as)\s+(?:an?|the)?\s*([A-Za-z\s/-]+?)(?:\s+at|\s+to|\s+who|\.|\n|,)/i);
  if (roleMatch && roleMatch[1]) {
    const candidate = roleMatch[1].replace(/^(?:an?|the)\s+/i, "").trim();
    if (candidate.length >= 4 && candidate.length <= 45 && !candidate.toLowerCase().includes("candidate")) {
      detectedRole = candidate;
    }
  }

  // 2. Extract multi-word domain phrases
  for (const phrase of KNOWN_DOMAIN_PHRASES) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(normalized)) {
      extractedTerms.add(phrase);
    }
  }

  // 3. Extract technical unigrams and terms
  // Matches alphanumeric tokens, hyphens, slashes, or plus signs (e.g., C++, CI/CD, Next.js, Node.js)
  const words = normalized
    .replace(/[^\w\s/+.#-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const word of words) {
    const cleaned = word.replace(/^[./-]+|[./-]+$/g, "");
    if (cleaned.length < 3) continue;

    // Check stop words and boilerplate
    if (ENGLISH_STOP_WORDS.has(cleaned)) continue;
    if (RECRUITING_BOILERPLATE.has(cleaned)) continue;
    if (/^\d+$/.test(cleaned)) continue; // ignore pure numbers

    // Check if word is part of an already extracted phrase to avoid redundancy
    let alreadySubsumed = false;
    for (const phrase of extractedTerms) {
      if (phrase.includes(cleaned)) {
        alreadySubsumed = true;
        break;
      }
    }

    if (!alreadySubsumed) {
      extractedTerms.add(cleaned);
    }
  }

  // Limit to most significant top 25 keywords/phrases to prevent dilution
  const sorted = Array.from(extractedTerms).slice(0, 25);

  return {
    terms: sorted,
    detectedRole,
  };
}

/**
 * Searches a resume for occurrences of extracted job keywords.
 */
export function analyzeJobMatch(resume: Resume, jobDescription: string): JobMatchResult | null {
  const trimmedJd = (jobDescription || "").trim();
  if (trimmedJd.length < 20) {
    return null;
  }

  const { terms, detectedRole } = extractKeywordsFromJobDescription(trimmedJd);
  if (terms.length === 0) {
    return null;
  }

  // Compile entire searchable text from the resume
  const resumeTokens: string[] = [
    resume.title || "",
    resume.personalInfo.title || "",
    resume.summary || "",
    ...(resume.experience || []).flatMap((e) => [
      e.role,
      e.company,
      ...(e.bullets || []),
    ]),
    ...(resume.education || []).flatMap((e) => [e.degree, e.institution]),
    ...(resume.skillCategories || []).flatMap((c) => [
      c.categoryName,
      ...(c.skills || []),
    ]),
    ...(resume.projects || []).flatMap((p) => [
      p.name,
      p.description,
      ...(p.technologies || []),
    ]),
    ...(resume.certifications || []).map((c) => c.name),
  ];

  const fullResumeText = resumeTokens.join(" ").toLowerCase();

  const matchedKeywords: KeywordMatchItem[] = [];
  const missingKeywords: string[] = [];

  for (const term of terms) {
    const normalizedTerm = term.toLowerCase();
    // Word boundary match
    const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = fullResumeText.match(regex);
    const count = matches ? matches.length : 0;

    if (count > 0) {
      const matchStrength: KeywordMatchItem["matchStrength"] = count >= 3 ? "high" : "medium";
      const percentage = count >= 3 ? 100 : Math.min(85, count * 35);
      matchedKeywords.push({
        term,
        count,
        matchStrength,
        percentage,
      });
    } else {
      missingKeywords.push(term);
    }
  }

  // Sort matched by frequency descending
  matchedKeywords.sort((a, b) => b.count - a.count);

  const matchedCount = matchedKeywords.length;
  const totalCount = terms.length;
  const matchPercentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

  return {
    matchPercentage,
    matchedCount,
    totalKeywordsAnalyzed: totalCount,
    matchedKeywords,
    missingKeywords,
    targetRoleDetected: detectedRole,
    disclaimer:
      "Rule-based keyword occurrence analysis. This is an informative estimate and does not represent any specific company's proprietary ATS ranking system.",
  };
}
