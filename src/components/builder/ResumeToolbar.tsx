"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Edit2,
  SlidersHorizontal,
  Eye,
  FileEdit,
  Download,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { TemplateId } from "@/types/resume";
import { TEMPLATES } from "@/lib/templates";

export interface ResumeToolbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  templateId: TemplateId;
  onTemplateChange: (templateId: TemplateId) => void;
  saveStatus: "saved" | "saving" | "unsaved";
  lastSavedText: string;
  mobileView: "edit" | "preview";
  onMobileViewChange: (view: "edit" | "preview") => void;
  onPrint: () => void;
}

export function ResumeToolbar({
  title,
  onTitleChange,
  templateId,
  onTemplateChange,
  saveStatus,
  lastSavedText,
  mobileView,
  onMobileViewChange,
  onPrint,
}: ResumeToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setTitleDraft(title);
    setIsEditingTitle(true);
  };

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    } else {
      setTitleDraft(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="no-print sticky top-16 z-30 w-full bg-surface-bright/95 backdrop-blur-md border-b border-outline-variant/40 py-2.5 px-4 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Breadcrumb, Document Title & Save Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
            <Link
              href="/dashboard"
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Workspace
            </Link>
            <span className="font-label-xs text-label-xs text-on-surface-variant/40">/</span>
            
            {isEditingTitle ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  commitTitle();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  className="px-2 py-0.5 text-body-sm font-semibold text-on-surface bg-surface-container-lowest border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary w-60 sm:w-80"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-primary text-white hover:bg-primary-container"
                  aria-label="Save title"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 group">
                <span
                  onClick={startEditing}
                  className="font-title-md text-title-md text-on-surface truncate cursor-pointer hover:bg-surface-container-low px-1.5 py-0.5 rounded transition-all max-w-[200px] sm:max-w-xs md:max-w-sm"
                  title="Click to rename document"
                >
                  {title}
                </span>
                <button
                  type="button"
                  onClick={startEditing}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-on-surface-variant hover:text-on-surface transition-opacity"
                  aria-label="Edit title"
                  title="Rename resume"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Save Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                saveStatus === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : saveStatus === "unsaved"
                  ? "bg-secondary"
                  : "bg-[#2e6f40]"
              }`}
            />
            <span className="font-label-xs text-label-xs tracking-wider">
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "unsaved"
                ? "Unsaved changes"
                : lastSavedText || "Autosaved"}
            </span>
          </div>
        </div>

        {/* Center Document Tools (Desktop only) */}
        <div className="hidden xl:flex items-center gap-1 bg-surface-container-low p-0.5 rounded border border-outline-variant/30">
          <button
            type="button"
            className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest rounded transition-colors"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest rounded transition-colors"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-surface-container-highest mx-1" />
          <span className="font-label-xs text-label-xs text-on-surface px-1.5">100%</span>
          <div className="h-3 w-px bg-surface-container-highest mx-1" />
          <span className="font-label-xs text-label-xs text-on-surface-variant px-1.5 font-mono">
            Page 1 / 1
          </span>
        </div>

        {/* Right Side: Template Switcher, Mobile Toggle & Print/Export */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Mobile View Toggle Switcher (Mobile only) */}
          <div className="flex lg:hidden bg-surface-container-low p-0.5 rounded border border-outline-variant/40">
            <button
              type="button"
              onClick={() => onMobileViewChange("edit")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-label-xs font-label-xs transition-all ${
                mobileView === "edit"
                  ? "bg-primary text-white shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <FileEdit className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onMobileViewChange("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-label-xs font-label-xs transition-all ${
                mobileView === "preview"
                  ? "bg-primary text-white shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          {/* Template Switcher Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded border border-outline-variant/40">
            <SlidersHorizontal className="w-3 h-3 text-secondary shrink-0" />
            <select
              value={templateId}
              onChange={(e) => onTemplateChange(e.target.value as TemplateId)}
              className="bg-transparent text-label-xs font-label-xs font-semibold text-on-surface pr-1 focus:outline-none cursor-pointer"
              aria-label="Select resume layout template"
            >
              {TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Print / Export PDF Button */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-label-md font-label-md rounded shadow-sm hover:bg-primary-container transition-all cursor-pointer"
            title="Print or Export as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
