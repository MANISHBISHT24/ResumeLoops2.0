"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Layers,
  MoreVertical,
} from "lucide-react";
import { Resume } from "@/types/resume";
import { getTemplateById } from "@/lib/templates";

export interface ResumeCardProps {
  resume: Resume;
  onDuplicate: (id: string) => void;
  onDeleteRequest: (resume: Resume) => void;
}

export function ResumeCard({
  resume,
  onDuplicate,
  onDeleteRequest,
}: ResumeCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const template = getTemplateById(resume.templateId);
  const isSample = resume.id.startsWith("sample-");
  const score = resume.atsScore || 92;
  const isHighAts = score >= 85;

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, [role='menu']")) {
      return;
    }
    router.push(`/builder?id=${resume.id}`);
  };

  return (
    <div
      onClick={handleRowClick}
      className="group bg-surface-container-low hover:bg-surface-container p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs border border-border-subtle cursor-pointer relative"
      role="article"
      aria-label={`Resume: ${resume.title}`}
    >
      {/* Left: Document Icon & Meta */}
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-10 h-12 bg-surface-container-lowest rounded flex items-center justify-center text-on-surface shadow-2xs shrink-0 border border-border-subtle">
          <FileText className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-title-md text-sm sm:text-base font-semibold text-on-surface truncate">
              {resume.title}
            </span>
            {resume.targetRole && (
              <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface font-label-xs text-[11px] rounded">
                {resume.targetCompany ? `Tailored for ${resume.targetCompany}` : resume.targetRole}
              </span>
            )}
            {isSample && (
              <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant font-label-xs text-[11px] rounded font-medium">
                Sample
              </span>
            )}
            <span
              className={`px-2 py-0.5 font-label-xs text-[11px] rounded font-medium ${
                isHighAts
                  ? "bg-[#e8f5e9] text-[#276a45]"
                  : "bg-[#fff8e1] text-[#9b7338]"
              }`}
            >
              {isHighAts ? "Ready" : "Needs Review"}
            </span>
          </div>
          <span className="font-body-sm text-xs text-on-surface-variant mt-1">
            Updated {resume.lastModified} • 1 Page • {template?.name || "Standard Layout"}
          </span>
        </div>
      </div>

      {/* Right: ATS score badge & action button cluster */}
      <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-container-lowest rounded shadow-2xs border border-border-subtle">
          <span
            className={`w-2 h-2 rounded-full ${
              isHighAts ? "bg-[#276a45]" : "bg-[#9b7338]"
            }`}
          />
          <span className="font-label-md text-xs font-semibold text-on-surface font-mono">
            {score}% ATS
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/builder?id=${resume.id}`);
            }}
            title="Edit resume"
            aria-label={`Edit ${resume.title}`}
            className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-on-surface flex items-center justify-center transition-colors border border-border-subtle/50"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(resume.id);
            }}
            title="Duplicate resume"
            aria-label={`Duplicate ${resume.title}`}
            className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors border border-border-subtle/50"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(resume);
            }}
            title="Delete resume"
            aria-label={`Delete ${resume.title}`}
            className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-error-container hover:text-error text-on-surface flex items-center justify-center transition-colors border border-border-subtle/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* More options dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              title="More options"
              aria-label="More options"
              className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors border border-border-subtle/50"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-9 z-30 w-44 bg-surface-container-lowest rounded shadow-editorial-modal border border-border-subtle py-1 animate-in fade-in zoom-in-95"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/builder?id=${resume.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface hover:bg-surface-container transition-colors"
                  role="menuitem"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span>Open in Builder</span>
                </Link>
                <Link
                  href={`/templates?id=${resume.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface hover:bg-surface-container transition-colors"
                  role="menuitem"
                >
                  <Layers className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span>Switch Template</span>
                </Link>
                <div className="my-1 border-t border-border-subtle" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteRequest(resume);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-error hover:bg-error-container/40 transition-colors text-left"
                  role="menuitem"
                >
                  <Trash2 className="w-3.5 h-3.5 text-error" />
                  <span>Delete Draft</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
