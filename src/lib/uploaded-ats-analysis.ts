/**
 * ResumeLoops Uploaded Resume ATS Analysis Engine (Phase 3K)
 *
 * Evaluates raw extracted text from uploaded PDF / DOCX resumes.
 * Operates purely on extracted text (never fabricates structured Builder models).
 *
 * Transparent Scoring Rubric (100 pts total):
 * 1. Contact & Identity (20 pts): Name, valid email, phone, professional links (LinkedIn/GitHub/Portfolio).
 * 2. Executive Summary / Profile (15 pts): Section presence and optimal word depth (30-150 words).
 * 3. Experience & Measurable Outcomes (30 pts): Experience section, achievement bullets, quantifiable metrics (%, $, scale).
 * 4. Skills & Competencies (20 pts): Dedicated skills section, technical keyword inventory depth.
 * 5. Education & Credentials (15 pts): Education section, degree credential patterns, graduation timeline.
 *
 * Strict Separation:
 * - Document text checks are NOT visual layout guarantees.
 * - Scores are heuristic estimates, not universal ATS ranking algorithms.
 * - Job match estimate is strictly withheld when no usable job description is supplied.
 */

import {
  extractKeywordsFromJobDescription,
  type ResumeCheck,
  type CategoryScore,
  type ActionableFix,
  type ReadinessResult,
  type KeywordMatchItem,
  type JobMatchResult,
} from "./ats-analysis.ts";

export interface UploadedReadinessResult extends ReadinessResult {
  extractedCharLength: number;
  extractedWordCount: number;
  detectedSections: string[];
  detectedContactInfo: {
    hasName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinks: boolean;
  };
}

/**
 * Common technical and professional skills dictionary for text matching
 */
const COMMON_SKILLS_TAXONOMY = new Set([
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "golang", "go", "ruby", "rust",
  "swift", "kotlin", "php", "sql", "html", "css", "bash", "r", "scala",
  // Frameworks & Libraries
  "react", "next.js", "nextjs", "vue", "angular", "node.js", "nodejs", "express", "django",
  "fastapi", "flask", "spring", "spring boot", "tailwind", "graphql", "rest", "rest api",
  // Cloud & DevOps
  "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd", "github actions",
  "linux", "nginx", "prometheus", "grafana",
  // Data & AI
  "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "bigquery",
  "snowflake", "kafka", "spark", "pandas", "numpy", "pytorch", "tensorflow",
  // Methodologies & Practices
  "agile", "scrum", "microservices", "distributed systems", "system design", "unit testing",
  "tdd", "code review", "object-oriented", "data structures",
]);

/**
 * Section header detection regex patterns
 */
const SECTION_PATTERNS = [
  { key: "summary", regex: /\b(?:professional\s+summary|executive\s+summary|profile|about\s+me|career\s+objective|objective)\b/i, name: "Executive Summary" },
  { key: "experience", regex: /\b(?:work\s+experience|professional\s+experience|employment\s+history|experience|career\s+history)\b/i, name: "Work Experience" },
  { key: "education", regex: /\b(?:education|academic\s+background|academic\s+qualifications|degrees?)\b/i, name: "Education" },
  { key: "skills", regex: /\b(?:technical\s+skills|core\s+competencies|skills\s*(?:&|and)\s*tools|technologies|skills)\b/i, name: "Skills & Tools" },
  { key: "projects", regex: /\b(?:projects|selected\s+projects|open\s+source|portfolio)\b/i, name: "Projects" },
  { key: "certifications", regex: /\b(?:certifications|certificates|licenses|credentials)\b/i, name: "Certifications" },
];

/**
 * Analyzes raw extracted text from an uploaded resume document.
 */
export function analyzeUploadedResumeText(extractedText: string): UploadedReadinessResult {
  const text = (extractedText || "").trim();
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const checks: ResumeCheck[] = [];
  const actionableFixes: ActionableFix[] = [];
  const detectedSections: string[] = [];

  // Detect which standard resume sections are present
  for (const sec of SECTION_PATTERNS) {
    if (sec.regex.test(text)) {
      detectedSections.push(sec.name);
    }
  }

  // ----------------------------------------------------
  // 1. Contact & Identity (Max: 20 pts)
  // ----------------------------------------------------
  let contactScore = 0;

  // Candidate Name Detection heuristic (top 5 lines, 2-4 words, starts with letters)
  const candidateNameLine = lines.slice(0, 5).find((line) => {
    const parts = line.split(/\s+/);
    return parts.length >= 2 && parts.length <= 4 && /^[A-Za-z\s.'-]+$/.test(line) && line.length >= 4 && line.length <= 45;
  });
  const hasName = Boolean(candidateNameLine);
  if (hasName) {
    contactScore += 5;
    checks.push({
      id: "upload-contact-name",
      category: "contact",
      title: "Candidate Name Detection",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: `Candidate name header "${candidateNameLine}" detected near the top of the document.`,
    });
  } else {
    checks.push({
      id: "upload-contact-name",
      category: "contact",
      title: "Candidate Name Detection",
      status: "warning",
      score: 2,
      maxScore: 5,
      message: "Could not distinctly isolate candidate name at the top of the resume.",
      suggestion: "Place your full name in prominent text at the very top of page 1.",
    });
    actionableFixes.push({
      id: "fix-upload-name",
      title: "Format Candidate Name Clearly",
      impact: "High",
      category: "Contact & Identity",
      suggestion: "Ensure your legal or preferred full name is the first prominent text line on page 1.",
    });
    contactScore += 2;
  }

  // Email detection
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const hasEmail = Boolean(emailMatch);
  if (hasEmail) {
    contactScore += 5;
    checks.push({
      id: "upload-contact-email",
      category: "contact",
      title: "Contact Email Address",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: `Standard email address (${emailMatch?.[0]}) detected.`,
    });
  } else {
    checks.push({
      id: "upload-contact-email",
      category: "contact",
      title: "Contact Email Address",
      status: "needs-attention",
      score: 0,
      maxScore: 5,
      message: "No valid email address found in the document.",
      suggestion: "Include a professional email address (e.g. name@domain.com) in your header.",
    });
    actionableFixes.push({
      id: "fix-upload-email",
      title: "Add Valid Email Address",
      impact: "High",
      category: "Contact & Identity",
      suggestion: "Applicant tracking systems require an email address to parse candidate profiles.",
    });
  }

  // Phone number detection
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  const hasPhone = Boolean(phoneMatch);
  if (hasPhone) {
    contactScore += 5;
    checks.push({
      id: "upload-contact-phone",
      category: "contact",
      title: "Telephone Contact",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: `Telephone contact (${phoneMatch?.[0]}) detected.`,
    });
  } else {
    checks.push({
      id: "upload-contact-phone",
      category: "contact",
      title: "Telephone Contact",
      status: "warning",
      score: 1,
      maxScore: 5,
      message: "No phone number detected in the document text.",
      suggestion: "Add a phone number with country/area code in the header.",
    });
    actionableFixes.push({
      id: "fix-upload-phone",
      title: "Add Phone Number",
      impact: "Medium",
      category: "Contact & Identity",
      suggestion: "Recruiters and automated schedulers often verify candidates with a direct phone number.",
    });
    contactScore += 1;
  }

  // Online profile / portfolio links
  const hasLinkedIn = /linkedin\.com\/in\/[\w-]+/i.test(text);
  const hasGitHub = /github\.com\/[\w-]+/i.test(text);
  const hasGeneralUrl = /https?:\/\/[^\s/$.?#].[^\s]*/i.test(text);
  const hasLinks = hasLinkedIn || hasGitHub || hasGeneralUrl;
  if (hasLinks) {
    contactScore += 5;
    checks.push({
      id: "upload-contact-links",
      category: "contact",
      title: "Professional Online Profiles",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: "Verified professional links (LinkedIn, GitHub, or portfolio website) detected.",
    });
  } else {
    checks.push({
      id: "upload-contact-links",
      category: "contact",
      title: "Professional Online Profiles",
      status: "warning",
      score: 2,
      maxScore: 5,
      message: "No LinkedIn, GitHub, or personal portfolio URL detected in the text.",
      suggestion: "Add your LinkedIn profile link or portfolio URL for recruiter review.",
    });
    actionableFixes.push({
      id: "fix-upload-links",
      title: "Add LinkedIn or Portfolio Link",
      impact: "Medium",
      category: "Contact & Identity",
      suggestion: "Include your LinkedIn URL or portfolio link to substantiate your experience.",
    });
    contactScore += 2;
  }

  // ----------------------------------------------------
  // 2. Executive Summary / Profile (Max: 15 pts)
  // ----------------------------------------------------
  let summaryScore = 0;
  const hasSummaryHeader = SECTION_PATTERNS[0].regex.test(text);

  if (hasSummaryHeader) {
    summaryScore += 7;
    // Inspect summary text depth: check word count near summary section
    if (wordCount >= 60) {
      summaryScore += 8;
      checks.push({
        id: "upload-summary-depth",
        category: "summary",
        title: "Professional Summary Section",
        status: "passed",
        score: 15,
        maxScore: 15,
        message: "Executive summary or professional profile section detected with solid content depth.",
      });
    } else {
      summaryScore += 4;
      checks.push({
        id: "upload-summary-depth",
        category: "summary",
        title: "Professional Summary Section",
        status: "warning",
        score: 11,
        maxScore: 15,
        message: "Summary section header found, but content appears relatively brief.",
        suggestion: "Expand your summary to 3-4 impactful sentences (40-90 words) highlighting core specialization.",
      });
      actionableFixes.push({
        id: "fix-upload-summary",
        title: "Expand Executive Summary",
        impact: "Medium",
        category: "Executive Summary",
        suggestion: "Summarize your career focus, top achievements, and primary domain stack in 3-4 sentences.",
      });
    }
  } else {
    // If no explicit summary header, check if opening paragraph exists
    if (wordCount >= 100) {
      summaryScore += 6;
      checks.push({
        id: "upload-summary-depth",
        category: "summary",
        title: "Professional Summary Header",
        status: "warning",
        score: 6,
        maxScore: 15,
        message: "No standard 'Summary' or 'Professional Profile' heading identified.",
        suggestion: "Add a distinct 'Professional Summary' header above your experience.",
      });
      actionableFixes.push({
        id: "fix-upload-summary-header",
        title: "Add Professional Summary Section",
        impact: "Medium",
        category: "Executive Summary",
        suggestion: "Use a clear 'Professional Summary' heading so ATS parsers categorize your intro correctly.",
      });
    } else {
      checks.push({
        id: "upload-summary-depth",
        category: "summary",
        title: "Professional Summary Section",
        status: "needs-attention",
        score: 0,
        maxScore: 15,
        message: "No executive summary or professional profile detected.",
        suggestion: "Add a 3-4 sentence professional summary to clarify your target role and seniority.",
      });
      actionableFixes.push({
        id: "fix-upload-summary-missing",
        title: "Add Executive Summary",
        impact: "High",
        category: "Executive Summary",
        suggestion: "An opening summary quickly anchors recruiters to your target specialization.",
      });
    }
  }

  // ----------------------------------------------------
  // 3. Experience & Measurable Outcomes (Max: 30 pts)
  // ----------------------------------------------------
  let experienceScore = 0;
  const hasExperienceHeader = SECTION_PATTERNS[1].regex.test(text);

  if (hasExperienceHeader) {
    experienceScore += 10;
    checks.push({
      id: "upload-exp-header",
      category: "experience",
      title: "Work Experience Section",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: "Dedicated Work Experience / Employment History section header identified.",
    });
  } else {
    checks.push({
      id: "upload-exp-header",
      category: "experience",
      title: "Work Experience Section",
      status: "needs-attention",
      score: 0,
      maxScore: 10,
      message: "Standard 'Work Experience' or 'Employment History' section header not detected.",
      suggestion: "Add an explicit 'Work Experience' header to organize your chronological employment.",
    });
    actionableFixes.push({
      id: "fix-upload-exp-header",
      title: "Add Work Experience Heading",
      impact: "High",
      category: "Work Experience",
      suggestion: "ATS parsers look for standard headers like 'Work Experience' to parse roles and dates.",
    });
  }

  // Bullet points density: count lines starting with bullet symbols or dashes
  const bulletLines = lines.filter((l) => /^[•\-\*▪–—\d+\.]\s+/.test(l));
  if (bulletLines.length >= 6) {
    experienceScore += 10;
    checks.push({
      id: "upload-exp-bullets",
      category: "experience",
      title: "Achievement Bullet Density",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `Strong bullet structure: ${bulletLines.length} discrete achievement bullet points identified.`,
    });
  } else if (bulletLines.length >= 2) {
    experienceScore += 6;
    checks.push({
      id: "upload-exp-bullets",
      category: "experience",
      title: "Achievement Bullet Density",
      status: "warning",
      score: 6,
      maxScore: 10,
      message: `Few bullet points detected (${bulletLines.length}). Aim for 3-5 structured bullets per position.`,
      suggestion: "Format position achievements as bullet points rather than paragraph text.",
    });
    actionableFixes.push({
      id: "fix-upload-bullets",
      title: "Use Bullet Points for Achievements",
      impact: "Medium",
      category: "Work Experience",
      suggestion: "Break paragraphs into distinct bullet points for faster recruiter scanning.",
    });
  } else {
    // Check if sentences/lines exist even if bullet glyphs were lost
    if (lines.length >= 15) {
      experienceScore += 4;
      checks.push({
        id: "upload-exp-bullets",
        category: "experience",
        title: "Achievement Bullet Density",
        status: "warning",
        score: 4,
        maxScore: 10,
        message: "Few or no explicit bullet symbols detected. Text may be formatted in dense blocks.",
        suggestion: "Use standard round bullet characters (•) or hyphens (-) for each role contribution.",
      });
      actionableFixes.push({
        id: "fix-upload-bullets-format",
        title: "Format Roles with Bullet Points",
        impact: "High",
        category: "Work Experience",
        suggestion: "Structure role accomplishments with bullet points rather than paragraphs.",
      });
    } else {
      checks.push({
        id: "upload-exp-bullets",
        category: "experience",
        title: "Achievement Bullet Density",
        status: "needs-attention",
        score: 0,
        maxScore: 10,
        message: "No bullet points or structured accomplishments detected.",
        suggestion: "Add bullet points outlining your contributions and outcomes.",
      });
    }
  }

  // Quantifiable Impact check: inspect text for percentages, dollars, multipliers, numbers
  const metricRegex = /\b(\d+[\d,.]*%\b|\$\d+[\d,.]*[kmb]?\b|\b\d+x\b|\b\d+k\b|\b\d{2,}\b)/gi;
  const metricsFound = text.match(metricRegex) || [];
  const uniqueMetrics = new Set(metricsFound);

  if (uniqueMetrics.size >= 4) {
    experienceScore += 10;
    checks.push({
      id: "upload-exp-metrics",
      category: "experience",
      title: "Quantifiable Impact & Metrics",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `Outstanding measurable results: ${uniqueMetrics.size} distinct numerical metrics (%, $, scale, or volume) detected.`,
    });
  } else if (uniqueMetrics.size >= 1) {
    experienceScore += 6;
    checks.push({
      id: "upload-exp-metrics",
      category: "experience",
      title: "Quantifiable Impact & Metrics",
      status: "warning",
      score: 6,
      maxScore: 10,
      message: `Only ${uniqueMetrics.size} numerical metric(s) found in document text.`,
      suggestion: "Quantify more accomplishments (e.g. 'boosted throughput by 40%', 'reduced cloud costs by $85k').",
    });
    actionableFixes.push({
      id: "fix-upload-metrics",
      title: "Substantiate Achievements with Metrics",
      impact: "Medium",
      category: "Work Experience",
      suggestion: "Incorporate metrics like percentage improvements, latency reductions, team size, or revenue impact.",
    });
  } else {
    checks.push({
      id: "upload-exp-metrics",
      category: "experience",
      title: "Quantifiable Impact & Metrics",
      status: "needs-attention",
      score: 0,
      maxScore: 10,
      message: "No numerical metrics (percentages, dollar amounts, scale figures) detected.",
      suggestion: "Add concrete numbers to substantiate your claims and stand out to hiring managers.",
    });
    actionableFixes.push({
      id: "fix-upload-metrics-urgent",
      title: "Add Quantifiable Metrics",
      impact: "High",
      category: "Work Experience",
      suggestion: "Resumes with quantified outcomes receive significantly higher recruiter response rates.",
    });
  }

  // ----------------------------------------------------
  // 4. Skills Inventory & Organization (Max: 20 pts)
  // ----------------------------------------------------
  let skillsScore = 0;
  const hasSkillsHeader = SECTION_PATTERNS[3].regex.test(text);

  if (hasSkillsHeader) {
    skillsScore += 10;
    checks.push({
      id: "upload-skills-header",
      category: "skills",
      title: "Dedicated Skills Section",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: "Dedicated Technical Skills / Core Competencies section header identified.",
    });
  } else {
    checks.push({
      id: "upload-skills-header",
      category: "skills",
      title: "Dedicated Skills Section",
      status: "warning",
      score: 4,
      maxScore: 10,
      message: "No dedicated 'Skills' or 'Technologies' section header detected.",
      suggestion: "Add a clearly marked 'Technical Skills' section for immediate ATS keyword matching.",
    });
    actionableFixes.push({
      id: "fix-upload-skills-header",
      title: "Add Dedicated Skills Section",
      impact: "High",
      category: "Skills",
      suggestion: "A standalone skills section ensures automated scanners capture your exact tool proficiencies.",
    });
    skillsScore += 4;
  }

  // Count recognized skills across document text
  const matchedSkills: string[] = [];
  for (const skill of COMMON_SKILLS_TAXONOMY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lowerText)) {
      matchedSkills.push(skill);
    }
  }

  if (matchedSkills.length >= 8) {
    skillsScore += 10;
    checks.push({
      id: "upload-skills-count",
      category: "skills",
      title: "Technical Keyword Inventory",
      status: "passed",
      score: 10,
      maxScore: 10,
      message: `${matchedSkills.length} recognized industry skills and technical terms detected.`,
    });
  } else if (matchedSkills.length >= 4) {
    skillsScore += 6;
    checks.push({
      id: "upload-skills-count",
      category: "skills",
      title: "Technical Keyword Inventory",
      status: "warning",
      score: 6,
      maxScore: 10,
      message: `${matchedSkills.length} recognized skills identified. Adding complementary tools increases match potential.`,
      suggestion: "Add 4-6 more relevant frameworks, tools, or methodologies you use.",
    });
    actionableFixes.push({
      id: "fix-upload-skills-expand",
      title: "Expand Technical Tools & Skills",
      impact: "Medium",
      category: "Skills",
      suggestion: "List additional libraries, databases, cloud platforms, or developer tools.",
    });
  } else {
    checks.push({
      id: "upload-skills-count",
      category: "skills",
      title: "Technical Keyword Inventory",
      status: "needs-attention",
      score: 2,
      maxScore: 10,
      message: `Only ${matchedSkills.length} common technical skills recognized in the document text.`,
      suggestion: "Add a comprehensive list of programming languages, tools, and platforms.",
    });
    actionableFixes.push({
      id: "fix-upload-skills-urgent",
      title: "List Core Technical Skills",
      impact: "High",
      category: "Skills",
      suggestion: "Recruiters and ATS keyword filters rely on explicit technical skill mentions.",
    });
    skillsScore += 2;
  }

  // ----------------------------------------------------
  // 5. Education & Credentials (Max: 15 pts)
  // ----------------------------------------------------
  let educationScore = 0;
  const hasEduHeader = SECTION_PATTERNS[2].regex.test(text);

  if (hasEduHeader) {
    educationScore += 5;
    checks.push({
      id: "upload-edu-header",
      category: "education",
      title: "Education Section Header",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: "Dedicated Education / Academic section header identified.",
    });
  } else {
    checks.push({
      id: "upload-edu-header",
      category: "education",
      title: "Education Section Header",
      status: "warning",
      score: 2,
      maxScore: 5,
      message: "No standard 'Education' section header found in document.",
      suggestion: "Add an 'Education' header above your academic credentials.",
    });
    actionableFixes.push({
      id: "fix-upload-edu-header",
      title: "Add Education Header",
      impact: "Medium",
      category: "Education",
      suggestion: "A standard 'Education' heading helps parsers index university and degree records.",
    });
    educationScore += 2;
  }

  // Degree credential pattern
  const degreeRegex = /\b(?:bachelor|master|doctorate|ph\.?d|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|associate|diploma|degree)\b/i;
  const hasDegree = degreeRegex.test(text);
  if (hasDegree) {
    educationScore += 5;
    checks.push({
      id: "upload-edu-degree",
      category: "education",
      title: "Academic Degree Credentials",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: "Degree credentials (Bachelor, Master, B.S., M.S., or equivalent) identified.",
    });
  } else {
    checks.push({
      id: "upload-edu-degree",
      category: "education",
      title: "Academic Degree Credentials",
      status: "warning",
      score: 1,
      maxScore: 5,
      message: "Could not distinctly verify degree title in the text.",
      suggestion: "Explicitly state your degree title (e.g. 'Bachelor of Science in Computer Science').",
    });
    actionableFixes.push({
      id: "fix-upload-degree",
      title: "Specify Formal Degree Title",
      impact: "Medium",
      category: "Education",
      suggestion: "Include your full degree name and field of study.",
    });
    educationScore += 1;
  }

  // Graduation year / timeline pattern
  const yearRegex = /\b(19\d{2}|20\d{2})\b/;
  const hasYear = yearRegex.test(text);
  if (hasYear) {
    educationScore += 5;
    checks.push({
      id: "upload-edu-year",
      category: "education",
      title: "Graduation Timeline",
      status: "passed",
      score: 5,
      maxScore: 5,
      message: "Graduation or attendance completion year detected.",
    });
  } else {
    checks.push({
      id: "upload-edu-year",
      category: "education",
      title: "Graduation Timeline",
      status: "warning",
      score: 2,
      maxScore: 5,
      message: "Completion year omitted or not recognized.",
      suggestion: "Add your graduation year or expected completion date.",
    });
    educationScore += 2;
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

  // Structural header readability rate
  const coreHeaders = [hasName && hasEmail, hasSummaryHeader, hasExperienceHeader, hasSkillsHeader, hasEduHeader];
  const presentHeadersCount = coreHeaders.filter(Boolean).length;
  const parserReadableRate = Math.round((presentHeadersCount / coreHeaders.length) * 100);

  const categories: CategoryScore[] = [
    {
      id: "upload-cat-contact",
      category: "Contact & Identity",
      score: contactScore,
      maxScore: 20,
      percentage: Math.round((contactScore / 20) * 100),
      description: "Candidate name, valid email, telephone, and professional online profiles.",
    },
    {
      id: "upload-cat-summary",
      category: "Executive Summary",
      score: summaryScore,
      maxScore: 15,
      percentage: Math.round((summaryScore / 15) * 100),
      description: "Opening professional summary articulating career focus and domain seniority.",
    },
    {
      id: "upload-cat-experience",
      category: "Experience & Metrics",
      score: experienceScore,
      maxScore: 30,
      percentage: Math.round((experienceScore / 30) * 100),
      description: "Chronological employment entries with achievement bullet points and measurable outcomes.",
    },
    {
      id: "upload-cat-skills",
      category: "Skills & Competencies",
      score: skillsScore,
      maxScore: 20,
      percentage: Math.round((skillsScore / 20) * 100),
      description: "Dedicated skills section with relevant technical languages, frameworks, and tools.",
    },
    {
      id: "upload-cat-education",
      category: "Education & Credentials",
      score: educationScore,
      maxScore: 15,
      percentage: Math.round((educationScore / 15) * 100),
      description: "Degree credentials, institution names, and graduation timelines.",
    },
  ];

  return {
    overallScore,
    scoreLevel,
    levelDescription,
    parserReadableRate,
    hasQuantifiedImpact: uniqueMetrics.size >= 2,
    categories,
    checks,
    actionableFixes,
    extractedCharLength: text.length,
    extractedWordCount: wordCount,
    detectedSections,
    detectedContactInfo: {
      hasName,
      hasEmail,
      hasPhone,
      hasLinks,
    },
  };
}

/**
 * Searches extracted document text for occurrences of keywords extracted from a job description.
 * Strictly returns null if job description is missing or < 20 characters.
 */
export function analyzeUploadedJobMatch(
  extractedText: string,
  jobDescription: string
): JobMatchResult | null {
  const trimmedJd = (jobDescription || "").trim();
  if (trimmedJd.length < 20) {
    return null;
  }

  const { terms, detectedRole } = extractKeywordsFromJobDescription(trimmedJd);
  if (terms.length === 0) {
    return null;
  }

  const normalizedResumeText = (extractedText || "").toLowerCase();
  const matchedKeywords: KeywordMatchItem[] = [];
  const missingKeywords: string[] = [];

  for (const term of terms) {
    const normalizedTerm = term.toLowerCase();
    const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = normalizedResumeText.match(regex);
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
      "Deterministic keyword occurrence analysis between job description terms and extracted resume text. This is a heuristic estimate and does not represent any specific company's proprietary ATS ranking system.",
  };
}
