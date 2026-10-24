"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  FileText,
  MoreVertical,
} from "lucide-react";
import { Resume } from "@/types/resume";
import { Badge } from "@/components/ui/Badge";
import { DEMO_TEMPLATES } from "@/lib/sample-data";

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

  const template = DEMO_TEMPLATES.find((t) => t.id === resume.templateId);
  const isSample = resume.id.startsWith("sample-");

  const handleCardClick = (e: React.MouseEvent) => {
    // If click originated from button or menu, don't trigger card navigation
    if ((e.target as HTMLElement).closest("button, a, [role='menu']")) {
      return;
    }
    router.push(`/builder?id=${resume.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-surface-container-low hover:bg-surface-container rounded-2xl p-5 transition-all flex flex-col justify-between min-h-[220px] cursor-pointer shadow-2xs hover:shadow-md border border-border-subtle hover:border-primary/30"
      role="article"
      aria-label={`Resume: ${resume.title}`}
    >
      {/* Top Bar: Thumbnail Icon & Actions Menu */}
      <div>
        <div className="flex items-start justify-between">
          {/* Document Thumbnail representation */}
          <div className="w-10 h-13 bg-surface-container-lowest rounded-md shadow-2xs p-1.5 flex flex-col gap-1 border border-border-subtle">
            <div className="w-full h-1 bg-primary/60 rounded-full" />
            <div className="w-3/4 h-1 bg-surface-variant rounded-full" />
            <div className="w-1/2 h-1 bg-surface-variant rounded-full" />
          </div>

          {/* Quick Actions / Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(resume.id);
                }}
                title="Duplicate this resume"
                aria-label={`Duplicate ${resume.title}`}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(resume);
                }}
                title="Delete this resume"
                aria-label={`Delete ${resume.title}`}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-surface-container-lowest transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                title="More options"
                aria-label="More options"
                aria-expanded={menuOpen}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-44 bg-surface-container-lowest rounded-xl shadow-lg border border-border-subtle py-1.5 animate-in fade-in zoom-in-95"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/builder?id=${resume.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                  role="menuitem"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  <span>Open in Builder</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(resume.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors text-left"
                  role="menuitem"
                >
                  <Copy className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span>Duplicate Draft</span>
                </button>
                <div className="my-1 border-t border-border-subtle" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteRequest(resume);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  role="menuitem"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Delete Draft</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Target Details */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors line-clamp-1">
              {resume.title}
            </h4>
            {isSample && (
              <Badge variant="neutral" className="text-[10px] shrink-0">
                Sample
              </Badge>
            )}
          </div>

          <p className="text-xs text-on-surface-variant line-clamp-1 mt-1">
            {resume.targetRole || "General Application"}
            {resume.targetCompany ? ` • ${resume.targetCompany}` : ""}
          </p>
        </div>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-on-surface-variant font-medium">
          <Clock className="w-3 h-3 text-on-surface-variant/70" />
          <span>{resume.lastModified}</span>
        </span>

        <div className="flex items-center gap-1.5">
          {resume.atsScore ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-primary font-bold text-[11px]">
              <Sparkles className="w-3 h-3 text-primary" />
              <span>ATS {resume.atsScore}%</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px]">
              <FileText className="w-3 h-3" />
              <span>{template?.name || "Standard Layout"}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
