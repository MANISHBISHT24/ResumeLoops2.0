"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is an ATS and why does ResumeLoops optimize for it?",
    answer:
      "Applicant Tracking Systems (ATS) are software programs used by companies to collect, sort, and scan resumes. If your resume lacks proper formatting or keywords, it gets filtered out before a human ever sees it. ResumeLoops ensures 100% compatibility with standard parsers.",
  },
  {
    id: "faq-2",
    question: "Can I export my resume to PDF and Word formats?",
    answer:
      "Yes! You can instantly export your resume as a clean, vector-rendered PDF or printable document with publication-grade typography and alignment intact.",
  },
  {
    id: "faq-3",
    question: "How does the AI bullet point rewriter work?",
    answer:
      "Our AI analyzes your experience level and target job description to suggest action-oriented, metric-backed bullet points that highlight your professional achievements and quantifiable business impact.",
  },
  {
    id: "faq-4",
    question: "Can I create multiple versions of my resume for different applications?",
    answer:
      "Absolutely. ResumeLoops allows you to maintain distinct tailored resumes in your dashboard, each adapted toward specific job titles, industries, or required skill profiles.",
  },
  {
    id: "faq-5",
    question: "Are my personal information and career history secure?",
    answer:
      "Yes. Your privacy is paramount. ResumeLoops keeps your career documents strictly isolated to your own workspace and does not share or monetize your private resume data.",
  },
];

export function MarketingFaq() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 w-full bg-surface" id="faq">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-medium mb-2">
          Architecture &amp; Intelligence FAQ
        </span>
        <h2 className="font-headline-lg text-2xl sm:text-3xl font-medium text-on-surface text-center mb-10 tracking-tight">
          Frequently Asked Questions
        </h2>

        {/* Accordion Container */}
        <div className="space-y-3 w-full" role="region" aria-label="Frequently Asked Questions">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-surface-container rounded border border-border-subtle transition-all overflow-hidden"
              >
                <button
                  type="button"
                  id={`faq-btn-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-on-surface text-base focus:outline-none focus-visible:ring-1 focus-visible:ring-on-surface cursor-pointer"
                >
                  <span className="leading-snug">{item.question}</span>
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${item.id}`}
                    className="px-5 sm:px-6 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-border-subtle/40 pt-4"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
