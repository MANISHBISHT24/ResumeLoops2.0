"use client";

import React, { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  Eye,
  Plus,
  ArrowRight,
  Search,
  Layout,
  FileText,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { TemplateId, Resume } from "@/types/resume";
import { TEMPLATES, TemplateDefinition, getTemplateById } from "@/lib/templates";
import { useResumeStore } from "@/lib/storage";
import { TemplateThumbnail } from "@/components/templates/TemplateThumbnail";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModal";
import { CreateResumeModal } from "@/components/dashboard/CreateResumeModal";
import { Button } from "@/components/ui/Button";

function TemplatesGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");

  const { resumes, isHydrated, updateResume } = useResumeStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("All Templates");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeResumeOverrideId, setActiveResumeOverrideId] = useState<string | null>(null);

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [createModalTemplate, setCreateModalTemplate] = useState<TemplateId | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    resumeId: string;
  } | null>(null);

  // Resolve currently active target resume
  const targetResumeId = activeResumeOverrideId || resumeIdParam;
  const targetResume: Resume | undefined = useMemo(() => {
    if (!isHydrated || resumes.length === 0) return undefined;
    if (targetResumeId) {
      const found = resumes.find((r) => r.id === targetResumeId);
      if (found) return found;
    }
    // Default to first available if no explicit ID or invalid
    return resumes[0];
  }, [isHydrated, resumes, targetResumeId]);

  const isInvalidRequestedId =
    Boolean(resumeIdParam) &&
    isHydrated &&
    resumes.length > 0 &&
    !resumes.some((r) => r.id === resumeIdParam);

  // Filter templates
  const categories = ["All Templates", "Executive", "Minimal", "Modern", "Professional"];

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((tmpl) => {
      const matchesCategory =
        selectedCategory === "All Templates" || tmpl.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tmpl.name.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q) ||
        tmpl.fontStyle.toLowerCase().includes(q) ||
        tmpl.layoutStructure.toLowerCase().includes(q) ||
        tmpl.bestFor.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Apply template to selected resume
  const handleApplyTemplate = async (templateId: TemplateId) => {
    if (!targetResume) return;

    if (targetResume.templateId === templateId) return;

    const updated = await updateResume(targetResume.id, { templateId });
    if (updated) {
      const templateName = getTemplateById(templateId).name;
      setToastMessage({
        text: `Switched layout to "${templateName}" for "${targetResume.title}".`,
        resumeId: targetResume.id,
      });

      // Clear toast after 5s
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    }
  };

  if (!isHydrated) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
          Loading templates catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-space-xl pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1B1C1A] text-[#FAF9F5] text-body-sm px-4 py-3 rounded-xl shadow-paper-elevated flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-neutral-700 max-w-md"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#276a45] shrink-0" />
            <span className="leading-snug">{toastMessage.text}</span>
          </div>
          <Link
            href={`/builder?id=${encodeURIComponent(toastMessage.resumeId)}`}
            className="text-white hover:underline font-semibold flex items-center gap-1 shrink-0 text-xs"
          >
            <span>Open Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg pb-4 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-semibold">
              The Curated Formats
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Typographic Archive &amp; Layouts
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 max-w-xl leading-relaxed">
            Four canonical, print-calibrated single-column layouts engineered for machine readability, recruiter glance velocity, and typographic authority.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formats or disciplines..."
            className="w-full pl-9 pr-3 py-2 font-body-sm text-body-sm text-on-surface bg-surface-container-low border border-outline-variant/40 rounded-lg focus:outline-none focus:border-on-surface transition-all"
            aria-label="Search resume templates"
          />
        </div>
      </div>

      {/* Target Resume Context Bar */}
      {resumes.length > 0 ? (
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded bg-surface-container text-on-surface border border-outline-variant/40 flex items-center justify-center shrink-0">
              <Layout className="w-4 h-4 text-secondary" />
            </div>
            <div className="min-w-0">
              <div className="font-label-xs text-label-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <span>Active Target Document</span>
                {targetResume && (
                  <span className="text-primary font-bold font-mono">
                    • Current Format: {getTemplateById(targetResume.templateId).name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-title-md text-title-md font-semibold text-on-surface truncate">
                  {targetResume ? targetResume.title : "No draft selected"}
                </span>
                {targetResume?.id.startsWith("sample-") && (
                  <span className="font-label-xs text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30">
                    Sample
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Target Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1.5 rounded border border-outline-variant/40 font-label-xs text-label-xs font-semibold text-on-surface">
              <SlidersHorizontal className="w-3 h-3 text-secondary shrink-0" />
              <select
                value={targetResume?.id || ""}
                onChange={(e) => setActiveResumeOverrideId(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer max-w-[200px] truncate"
                aria-label="Select resume to apply template to"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {targetResume && (
              <Link href={`/builder?id=${encodeURIComponent(targetResume.id)}`}>
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Edit in Builder
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-title-md text-title-md text-on-surface">No Documents in Workspace</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Select any format below to author your very first edition with publication-grade typography.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalTemplate("swiss-chronicle")}
            className="text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create First Document
          </Button>
        </div>
      )}

      {/* Invalid Resume ID Banner */}
      {isInvalidRequestedId && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 font-body-sm text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Requested resume not found: </span>
            The draft ID &ldquo;{resumeIdParam}&rdquo; does not exist in your workspace archive. We have defaulted to your first available resume &ldquo;{targetResume?.title}&rdquo;.
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg font-label-xs text-label-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/30"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg items-stretch">
        {filteredTemplates.map((tmpl) => {
          const isCurrentApplied = targetResume?.templateId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className={`bg-surface-container-lowest rounded-xl border flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-paper transition-all group ${
                isCurrentApplied
                  ? "border-primary ring-1 ring-primary"
                  : "border-outline-variant/40 hover:border-outline-variant/80"
              }`}
            >
              {/* Document Thumbnail Preview Header */}
              <div className="relative border-b border-outline-variant/30 overflow-hidden bg-surface-container-low">
                <TemplateThumbnail templateId={tmpl.id} />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="font-label-xs text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-white/95 text-on-surface shadow-2xs border border-outline-variant/30">
                    {tmpl.category}
                  </span>
                </div>

                {isCurrentApplied && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#276a45] text-white font-label-xs text-[10px] font-bold shadow-2xs">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Template Body Info */}
              <div className="p-space-md flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-title-md text-title-md text-on-surface tracking-tight group-hover:text-primary transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>

                  <div className="pt-2 space-y-1.5 border-t border-outline-variant/30 font-body-sm text-[11px] text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-on-surface">Style:</span>
                      <span className="truncate">{tmpl.fontStyle}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-on-surface">Best for:</span>
                      <span className="truncate">{tmpl.bestFor}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-outline-variant/30">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(tmpl)}
                      className="text-xs font-semibold w-full"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateModalTemplate(tmpl.id)}
                      className="text-xs font-semibold w-full"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      New Edition
                    </Button>
                  </div>

                  {targetResume && (
                    <Button
                      variant={isCurrentApplied ? "secondary" : "primary"}
                      size="sm"
                      disabled={isCurrentApplied}
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      className="w-full text-xs font-semibold shadow-xs"
                    >
                      {isCurrentApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-[#276a45]" />
                          Currently Applied
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          Apply to &ldquo;{targetResume.title.slice(0, 16)}...&rdquo;
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Modal Preview */}
      <TemplatePreviewModal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        selectedResume={targetResume || null}
        onApplyTemplate={handleApplyTemplate}
        onCreateWithTemplate={(templateId) => setCreateModalTemplate(templateId)}
      />

      {/* Create New Resume Modal with preselected template */}
      <CreateResumeModal
        isOpen={Boolean(createModalTemplate)}
        onClose={() => setCreateModalTemplate(null)}
        defaultTemplate={createModalTemplate || undefined}
        onCreated={(newId) => {
          setCreateModalTemplate(null);
          router.push(`/builder?id=${encodeURIComponent(newId)}`);
        }}
      />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center font-body-sm text-xs text-on-surface-variant font-medium">
          Loading templates gallery...
        </div>
      }
    >
      <TemplatesGalleryContent />
    </Suspense>
  );
}
