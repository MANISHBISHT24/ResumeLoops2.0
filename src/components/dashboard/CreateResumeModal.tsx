"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ArrowRight, Layout } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TemplateId } from "@/types/resume";
import { TEMPLATES, DEFAULT_TEMPLATE_ID } from "@/lib/templates";
import { useResumeStore } from "@/lib/storage";

export interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (resumeId: string) => void;
  defaultRole?: string;
  defaultTemplate?: TemplateId;
}

export function CreateResumeModal({
  isOpen,
  onClose,
  onCreated,
  defaultRole,
  defaultTemplate,
}: CreateResumeModalProps) {
  const router = useRouter();
  const { createResume } = useResumeStore();

  const [title, setTitle] = useState(defaultRole ? `${defaultRole} Resume` : "");
  const [targetRole, setTargetRole] = useState(defaultRole || "");
  const [targetCompany, setTargetCompany] = useState("");
  const [selectedTemplateOverride, setSelectedTemplateOverride] = useState<TemplateId | null>(null);
  const selectedTemplate: TemplateId =
    selectedTemplateOverride || defaultTemplate || DEFAULT_TEMPLATE_ID;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please provide a title for your resume draft.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newResume = await createResume({
        title: trimmedTitle,
        targetRole: targetRole.trim() || undefined,
        targetCompany: targetCompany.trim() || undefined,
        templateId: selectedTemplate,
      });

      // Reset form fields
      setTitle("");
      setTargetRole("");
      setTargetCompany("");
      setSelectedTemplateOverride(null);
      setIsSubmitting(false);

      if (onCreated) {
        onCreated(newResume.id);
      }

      onClose();
      // Navigate to builder with explicit resume ID
      router.push(`/builder?id=${newResume.id}`);
    } catch (err) {
      console.error("Failed to create resume:", err);
      setError("An unexpected error occurred while initializing your resume.");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Resume"
      description="Initialize a new targeted resume draft with publication-grade typography and single-column ATS formatting."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* Title Input */}
        <div>
          <Input
            label="Resume Title"
            required
            autoFocus
            placeholder="e.g. Senior Software Architect v2"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            error={error || undefined}
            helperText="A distinct name to organize this version in your workspace."
          />
        </div>

        {/* Target Role & Company Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Job Title (Optional)"
            placeholder="e.g. Staff Infrastructure Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            helperText="Helps tailor experience and heading hierarchy."
          />
          <Input
            label="Target Company (Optional)"
            placeholder="e.g. Stripe, Linear, Apple"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            helperText="Used to organize applications and keywords."
          />
        </div>

        {/* Template Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-primary" />
              <span>Select Typographic Template</span>
            </label>
            <span className="text-xs text-on-surface-variant font-mono">
              4 Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateOverride(tmpl.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-secondary-container/60 ring-2 ring-primary/20 shadow-xs"
                      : "border-border-subtle bg-surface-container-low hover:bg-surface-container hover:border-border-subtle/80"
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      setSelectedTemplateOverride(tmpl.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">
                        {tmpl.name}
                      </h4>
                      <Badge variant="neutral" className="mt-1 text-[10px] px-1.5 py-0.5">
                        {tmpl.category}
                      </Badge>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Honest storage note */}
        <div className="p-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-semibold">Local Workspace Storage:</strong>{" "}
          This resume will be saved directly to your browser’s local storage. No external account or server persistence is active in this phase.
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-surface-container-lowest flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create &amp; Open Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
