"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ExtractedTextPreviewProps {
  text: string;
  fileName?: string;
  pageCount?: number;
}

export function ExtractedTextPreview({ text, fileName, pageCount }: ExtractedTextPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n");
  const lineCount = lines.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or ignore
    }
  };

  const previewLines = isExpanded ? lines : lines.slice(0, 10);

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary-container text-primary flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">Extracted Document Text</h4>
            <p className="text-xs text-on-surface-variant">
              {fileName ? fileName : "Parsed resume"} • {wordCount} words • {charCount} characters
              {pageCount ? ` • ${pageCount} page(s)` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-xs font-medium"
            aria-label="Copy extracted text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Text
              </>
            )}
          </Button>

          {lines.length > 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold"
              aria-label={isExpanded ? "Collapse extracted text" : "Expand extracted text"}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" /> Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" /> View All ({lineCount} lines)
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-lowest border border-border-subtle/70 p-4 font-mono text-xs text-on-surface-variant leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text">
        {previewLines.join("\n")}
        {!isExpanded && lines.length > 10 && (
          <div className="pt-2 text-primary text-[11px] font-sans font-medium">
            ... [{lines.length - 10} more lines hidden. Click &quot;View All&quot; above to see full extracted text]
          </div>
        )}
      </div>

      <p className="text-[11px] text-on-surface-variant/70 italic">
        Notice: The ATS Readiness Score and Job Keyword Match are computed directly from this extracted text.
      </p>
    </div>
  );
}
