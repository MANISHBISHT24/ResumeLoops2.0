"use client";

import React from "react";
import { Resume } from "@/types/resume";

export interface LiveResumePreviewProps {
  resume: Resume;
}

export function LiveResumePreview({ resume }: LiveResumePreviewProps) {
  const { personalInfo, summary, experience, education, skillCategories, projects, certifications, templateId } =
    resume;

  const fullName = `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim() || "Your Full Name";

  // Template-specific style classes
  const isSerif = templateId === "swiss-chronicle" || templateId === "classic-oxford";
  const isMonoMeta = templateId === "stripe-mono";
  const isModernGrid = templateId === "linear-grid";

  return (
    <div className="w-full flex justify-center py-2 sm:py-4">
      {/* Printable A4 Container */}
      <article
        id="resume-document-preview"
        className={`print-container w-full max-w-[760px] min-h-[960px] bg-white text-neutral-900 shadow-lg border border-border-subtle rounded-sm p-8 sm:p-12 flex flex-col gap-6 text-[11px] sm:text-[12px] leading-relaxed transition-all select-text ${
          isSerif ? "font-serif" : "font-sans"
        }`}
      >
        {/* Document Header */}
        <header
          className={`flex flex-col gap-2 pb-4 ${
            templateId === "classic-oxford"
              ? "text-center border-b-2 border-neutral-900"
              : "border-b border-border-subtle"
          }`}
        >
          <div
            className={`flex flex-col gap-1 ${
              templateId === "classic-oxford" ? "items-center" : "items-start"
            }`}
          >
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 ${
                isSerif ? "font-serif" : "font-sans"
              }`}
            >
              {fullName}
            </h1>
            {personalInfo.title && (
              <p
                className={`text-sm sm:text-base font-semibold ${
                  isModernGrid
                    ? "text-primary"
                    : "text-neutral-700"
                }`}
              >
                {personalInfo.title}
              </p>
            )}
          </div>

          {/* Contact Details & Links */}
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 ${
              isMonoMeta ? "font-mono text-[11px]" : "font-sans"
            } ${templateId === "classic-oxford" ? "justify-center" : "justify-start"}`}
          >
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.location && personalInfo.email && <span className="text-neutral-300">•</span>}
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="hover:text-primary transition-colors">
                {personalInfo.email}
              </a>
            )}
            {personalInfo.email && personalInfo.phone && <span className="text-neutral-300">•</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.website && <span className="text-neutral-300">•</span>}
            {personalInfo.website && (
              <a
                href={personalInfo.website.startsWith("http") ? personalInfo.website : `https://${personalInfo.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors underline underline-offset-2"
              >
                {personalInfo.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {personalInfo.linkedin && <span className="text-neutral-300">•</span>}
            {personalInfo.linkedin && (
              <span className="text-neutral-600">
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            )}
            {personalInfo.github && <span className="text-neutral-300">•</span>}
            {personalInfo.github && (
              <span className="text-neutral-600">
                {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
              </span>
            )}
          </div>
        </header>

        {/* Professional Summary */}
        {summary && summary.trim().length > 0 && (
          <section className="flex flex-col gap-1.5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isModernGrid
                  ? "text-primary flex items-center gap-1.5"
                  : isSerif
                  ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                  : "text-primary"
              }`}
            >
              {isModernGrid && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              <span>Professional Summary</span>
            </h2>
            <p className="text-neutral-700 leading-relaxed font-sans">{summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isModernGrid
                  ? "text-primary flex items-center gap-1.5"
                  : isSerif
                  ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                  : "text-primary"
              }`}
            >
              {isModernGrid && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              <span>Experience</span>
            </h2>

            <div className="flex flex-col gap-4">
              {experience.map((item) => (
                <div key={item.id} className="flex flex-col gap-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-bold text-neutral-900 text-sm">
                      {item.role || "Untitled Position"}
                    </span>
                    <span
                      className={`text-[11px] text-neutral-500 shrink-0 ${
                        isMonoMeta ? "font-mono" : "font-sans"
                      }`}
                    >
                      {item.startDate} — {item.isCurrentRole ? "Present" : item.endDate || "Present"}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 font-medium">
                    {item.company}
                    {item.location ? ` • ${item.location}` : ""}
                  </div>

                  {item.bullets && item.bullets.length > 0 && (
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-neutral-700 font-sans">
                      {item.bullets
                        .filter((b) => b.trim().length > 0)
                        .map((bullet, bIdx) => (
                          <li key={bIdx} className="leading-relaxed pl-0.5">
                            {bullet}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Skills */}
        {skillCategories && skillCategories.some((c) => c.skills.length > 0) && (
          <section className="flex flex-col gap-2">
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isModernGrid
                  ? "text-primary flex items-center gap-1.5"
                  : isSerif
                  ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                  : "text-primary"
              }`}
            >
              {isModernGrid && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              <span>Skills &amp; Expertise</span>
            </h2>

            <div className="space-y-2 font-sans">
              {skillCategories
                .filter((c) => c.skills.length > 0)
                .map((cat) => (
                  <div key={cat.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="font-bold text-neutral-900 text-xs shrink-0 sm:min-w-[120px]">
                      {cat.categoryName}:
                    </span>
                    {isModernGrid ? (
                      <div className="flex flex-wrap gap-1">
                        {cat.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-700">{cat.skills.join(", ")}</span>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isModernGrid
                  ? "text-primary flex items-center gap-1.5"
                  : isSerif
                  ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                  : "text-primary"
              }`}
            >
              {isModernGrid && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              <span>Education</span>
            </h2>

            <div className="flex flex-col gap-2.5 font-sans">
              {education.map((edu) => (
                <div key={edu.id} className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-neutral-900">{edu.degree}</span>
                    <span
                      className={`text-[11px] text-neutral-500 ${
                        isMonoMeta ? "font-mono" : ""
                      }`}
                    >
                      {edu.graduationYear}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600">
                    {edu.institution}
                    {edu.location ? ` • ${edu.location}` : ""}
                    {edu.honors ? ` • ${edu.honors}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Projects */}
        {projects && projects.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isModernGrid
                  ? "text-primary flex items-center gap-1.5"
                  : isSerif
                  ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                  : "text-primary"
              }`}
            >
              {isModernGrid && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              <span>Key Projects</span>
            </h2>

            <div className="flex flex-col gap-3 font-sans">
              {projects.map((proj) => (
                <div key={proj.id} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{proj.name}</span>
                      {proj.url && (
                        <a
                          href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-primary hover:underline"
                        >
                          {proj.url.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
                        [{proj.technologies.join(", ")}]
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-700 text-xs leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isModernGrid
                  ? "text-primary flex items-center gap-1.5"
                  : isSerif
                  ? "text-neutral-900 border-b border-neutral-300 pb-0.5"
                  : "text-primary"
              }`}
            >
              {isModernGrid && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              <span>Certifications</span>
            </h2>

            <div className="flex flex-col gap-1.5 font-sans">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">{cert.name}</span>
                    <span className="text-neutral-600"> • {cert.issuer}</span>
                  </div>
                  {cert.date && (
                    <span
                      className={`text-[11px] text-neutral-500 ${
                        isMonoMeta ? "font-mono" : ""
                      }`}
                    >
                      {cert.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
