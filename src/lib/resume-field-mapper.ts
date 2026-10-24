/**
 * ResumeLoops Resume Field Mapper
 * Pure utilities for extracting editable rewrite targets and applying updates immutably.
 */

import type { Resume } from "../types/resume";
import type { RewriteTarget } from "../types/ai-rewriter";

/**
 * Extracts all valid, supported rewrite targets from a Resume document.
 * Prioritizes: Headline, Summary, Work Experience Bullets, Project Descriptions.
 */
export function extractRewriteTargets(resume: Resume): RewriteTarget[] {
  const targets: RewriteTarget[] = [];

  // 1. Professional Headline
  if (resume.personalInfo?.title !== undefined) {
    targets.push({
      targetKey: "headline",
      sectionType: "headline",
      label: "Professional Headline",
      subtitle: "Personal Details",
      originalText: resume.personalInfo.title || "",
      meta: {},
    });
  }

  // 2. Executive Summary
  if (resume.summary !== undefined) {
    targets.push({
      targetKey: "summary",
      sectionType: "summary",
      label: "Executive Summary",
      subtitle: "Career Overview",
      originalText: resume.summary || "",
      meta: {},
    });
  }

  // 3. Experience Achievement Bullets
  if (Array.isArray(resume.experience)) {
    resume.experience.forEach((role, expIdx) => {
      const companyName = role.company || `Role #${expIdx + 1}`;
      const roleTitle = role.role || "Position";

      if (Array.isArray(role.bullets)) {
        role.bullets.forEach((bulletText, bIdx) => {
          targets.push({
            targetKey: `exp-${role.id}-bullet-${bIdx}`,
            sectionType: "experience-bullet",
            label: `${companyName} — Bullet #${bIdx + 1}`,
            subtitle: `${roleTitle} (${role.startDate || "Date"} – ${role.endDate || "Present"})`,
            originalText: bulletText || "",
            meta: {
              expId: role.id,
              bulletIndex: bIdx,
            },
          });
        });
      }
    });
  }

  // 4. Project Descriptions
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach((proj, projIdx) => {
      const projName = proj.name || `Project #${projIdx + 1}`;
      targets.push({
        targetKey: `proj-${proj.id}-desc`,
        sectionType: "project-description",
        label: `${projName} — Description`,
        subtitle: "Projects",
        originalText: proj.description || "",
        meta: {
          projectId: proj.id,
        },
      });
    });
  }

  return targets;
}

/**
 * Retrieves the current text of a specific target from a resume to verify freshness.
 */
export function getCurrentTargetText(resume: Resume, target: RewriteTarget): string | null {
  if (target.sectionType === "headline") {
    return resume.personalInfo?.title ?? null;
  }

  if (target.sectionType === "summary") {
    return resume.summary ?? null;
  }

  if (target.sectionType === "experience-bullet") {
    const role = (resume.experience || []).find((e) => e.id === target.meta.expId);
    if (!role || target.meta.bulletIndex === undefined) return null;
    return role.bullets?.[target.meta.bulletIndex] ?? null;
  }

  if (target.sectionType === "project-description") {
    const proj = (resume.projects || []).find((p) => p.id === target.meta.projectId);
    if (!proj) return null;
    return proj.description ?? null;
  }

  return null;
}

/**
 * Checks whether the targeted field in the resume has been modified since the proposal was generated.
 */
export function isTargetFresh(
  resume: Resume,
  target: RewriteTarget,
  expectedOriginalText: string
): boolean {
  const currentText = getCurrentTargetText(resume, target);
  if (currentText === null) return false;
  return currentText.trim() === expectedOriginalText.trim();
}

/**
 * Immutably applies the rewritten text to the targeted field of the resume.
 * Guarantees that only the targeted field changes.
 */
export function applyRewriteToResume(
  resume: Resume,
  target: RewriteTarget,
  newText: string
): Resume {
  const cleanText = newText.trim();

  if (target.sectionType === "headline") {
    return {
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        title: cleanText,
      },
      lastModified: "Just now",
    };
  }

  if (target.sectionType === "summary") {
    return {
      ...resume,
      summary: cleanText,
      lastModified: "Just now",
    };
  }

  if (target.sectionType === "experience-bullet") {
    const newExperience = (resume.experience || []).map((role) => {
      if (role.id !== target.meta.expId) return role;

      const newBullets = [...(role.bullets || [])];
      if (target.meta.bulletIndex !== undefined && target.meta.bulletIndex >= 0) {
        newBullets[target.meta.bulletIndex] = cleanText;
      }
      return {
        ...role,
        bullets: newBullets,
      };
    });

    return {
      ...resume,
      experience: newExperience,
      lastModified: "Just now",
    };
  }

  if (target.sectionType === "project-description") {
    const newProjects = (resume.projects || []).map((proj) => {
      if (proj.id !== target.meta.projectId) return proj;
      return {
        ...proj,
        description: cleanText,
      };
    });

    return {
      ...resume,
      projects: newProjects,
      lastModified: "Just now",
    };
  }

  return resume;
}
