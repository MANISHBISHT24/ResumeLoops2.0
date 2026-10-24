/**
 * ResumeLoops Core Type Definitions
 * Structured representations for resumes, sections, templates, and tailoring.
 */

export type TemplateId =
  | "swiss-chronicle"
  | "stripe-mono"
  | "linear-grid"
  | "classic-oxford";

export type SectionType =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  title: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  graduationYear: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date?: string;
}

export interface Resume {
  id: string;
  title: string;
  targetRole?: string;
  targetCompany?: string;
  templateId: TemplateId;
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  sectionOrder: SectionType[];
  lastModified: string;
  atsScore?: number;
}
