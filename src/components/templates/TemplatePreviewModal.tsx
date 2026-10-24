"use client";

import React from "react";
import { TemplateDefinition } from "@/lib/templates";
import { Resume } from "@/types/resume";
import { DEMO_RESUME } from "@/lib/sample-data";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LiveResumePreview } from "@/components/builder/LiveResumePreview";
import { Sparkles, Check, Plus, ShieldCheck, ArrowRight } from "lucide-react";

export interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateDefinition | null;
  selectedResume: Resume | null;
  onApplyTemplate: (templateId: TemplateDefinition["id"]) => void;
  onCreateWithTemplate: (templateId: TemplateDefinition["id"]) => void;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  selectedResume,
  onApplyTemplate,
  onCreateWithTemplate,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  // If a real resume is selected, preview that resume with this template applied.
  // Otherwise, use DEMO_RESUME with this template applied as an authentic visual preview.
  const previewResume: Resume = selectedResume
    ? {
        ...selectedResume,
        templateId: template.id,
      }
    : {
        ...DEMO_RESUME,
        templateId: template.id,
      };

  const isCurrentActive = selectedResume?.templateId === template.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template.name}
      description={template.description}
      className="max-w-4xl max-h-[92vh] flex flex-col"
    >
      <div className="space-y-4 mt-2">
        {/* Template Characteristics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-surface-container-low border border-border-subtle text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="indigo" className="text-xs font-semibold">
              {template.category}
            </Badge>
            <span className="text-on-surface-variant font-medium">
              Font: <strong className="text-on-surface">{template.fontStyle}</strong>
            </span>
            <span className="text-border-subtle">•</span>
            <span className="text-on-surface-variant font-medium">
              Layout: <strong className="text-on-surface">{template.layoutStructure}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-primary text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Single-Column ATS Compliant</span>
          </div>
        </div>

        {/* Content Source Disclaimer */}
        <div className="text-[11px] text-on-surface-variant px-1 flex items-center justify-between">
          <span>
            {selectedResume ? (
              <>
                Previewing with your real content from &ldquo;<strong>{selectedResume.title}</strong>&rdquo;
              </>
            ) : (
              <>Previewing with sample structural data (Alexandre Vance)</>
            )}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant/70">
            A4 Standard Sheet
          </span>
        </div>

        {/* Scrollable A4 Document Container */}
        <div className="max-h-[58vh] overflow-y-auto rounded-xl border border-border-subtle bg-warm-ivory p-3 sm:p-6 shadow-inner flex justify-center">
          <div className="w-full max-w-[720px] bg-white shadow-md rounded-xs">
            <LiveResumePreview resume={previewResume} />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Back to Gallery
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onCreateWithTemplate(template.id);
              }}
              className="text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create New with Template
            </Button>

            {selectedResume && (
              <Button
                variant="primary"
                size="sm"
                disabled={isCurrentActive}
                onClick={() => {
                  onClose();
                  onApplyTemplate(template.id);
                }}
                className="text-xs font-bold shadow-sm"
              >
                {isCurrentActive ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                    Currently Applied
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Apply to &ldquo;{selectedResume.title.slice(0, 24)}...&rdquo;
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
