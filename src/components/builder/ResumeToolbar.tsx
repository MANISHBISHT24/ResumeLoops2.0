"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Edit2,
  Printer,
  SlidersHorizontal,
  Eye,
  FileEdit,
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
    <div className="no-print sticky top-0 z-30 w-full bg-warm-ivory/95 backdrop-blur-md border-b border-border-subtle py-3 px-4 sm:px-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Back Link & Editable Title & Save Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="h-5 w-[1px] bg-border-subtle shrink-0" />

          {/* Title Editor */}
          <div className="flex items-center gap-2 min-w-0">
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
                  className="px-2 py-1 text-base sm:text-lg font-bold text-on-surface bg-surface-container-lowest border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-primary text-white hover:bg-primary-dark"
                  aria-label="Save title"
                >
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 min-w-0 group">
                <h1
                  onClick={startEditing}
                  className="text-base sm:text-lg font-bold text-on-surface truncate cursor-pointer hover:text-primary transition-colors"
                  title="Click to rename"
                >
                  {title}
                </h1>
                <button
                  type="button"
                  onClick={startEditing}
                  className="opacity-60 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-primary transition-opacity"
                  aria-label="Edit title"
                  title="Rename resume"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Save Status Badge */}
            <div className="shrink-0 hidden sm:flex items-center gap-1.5 ml-2">
              {saveStatus === "saving" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Saving...
                </span>
              ) : saveStatus === "unsaved" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
                  Unsaved changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{lastSavedText || "Saved"}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Template Switcher, Mobile Toggle & Print */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Mobile View Toggle Switcher (Visible on mobile only) */}
          <div className="flex lg:hidden bg-surface-container-low p-1 rounded-xl border border-border-subtle">
            <button
              type="button"
              onClick={() => onMobileViewChange("edit")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mobileView === "edit"
                  ? "bg-primary text-white shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Edit Form</span>
            </button>
            <button
              type="button"
              onClick={() => onMobileViewChange("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                mobileView === "preview"
                  ? "bg-primary text-white shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>A4 Preview</span>
            </button>
          </div>

          {/* Template Switcher Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-border-subtle">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary ml-2 shrink-0" />
            <select
              value={templateId}
              onChange={(e) => onTemplateChange(e.target.value as TemplateId)}
              className="bg-transparent text-xs font-semibold text-on-surface py-1 pr-2 pl-1 focus:outline-none cursor-pointer"
              aria-label="Select resume layout template"
            >
              {TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.category})
                </option>
              ))}
            </select>
          </div>

          {/* Print / Save as PDF Button */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-xs shrink-0 cursor-pointer"
            title="Print or Save as PDF via browser print dialog"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
