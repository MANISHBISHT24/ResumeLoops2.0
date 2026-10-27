"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Terminal } from "lucide-react";

interface ExtractedTextPreviewProps {
  text: string;
  fileName?: string;
  pageCount?: number;
}

export function ExtractedTextPreview({ text, fileName, pageCount }: ExtractedTextPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewFormat, setViewFormat] = useState<"text" | "tokens">("text");

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

  const previewLines = isExpanded ? lines : lines.slice(0, 12);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-outline-variant/40 shadow-xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-on-surface shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-on-surface">Parser Extract Stream</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant font-mono">
              {fileName || "Extracted stream"} • {lineCount} lines • {wordCount} words • {charCount} chars
              {pageCount ? ` • ${pageCount} pp` : ""}
            </p>
          </div>
        </div>

        {/* View toggles & actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Format Toggle */}
          <div className="flex items-center bg-surface-container p-0.5 rounded border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setViewFormat("text")}
              className={`px-2 py-0.5 rounded font-label-xs text-label-xs transition-all ${
                viewFormat === "text"
                  ? "bg-surface-container-lowest text-on-surface font-semibold shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Plain Text
            </button>
            <button
              type="button"
              onClick={() => setViewFormat("tokens")}
              className={`px-2 py-0.5 rounded font-label-xs text-label-xs transition-all ${
                viewFormat === "tokens"
                  ? "bg-surface-container-lowest text-on-surface font-semibold shadow-2xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Lexical Stream
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-xs text-label-xs flex items-center gap-1 transition-colors border border-outline-variant/30"
            aria-label="Copy extracted stream"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#276a45]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-secondary" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Monospace Canvas */}
      <div className="relative rounded-lg bg-[#1B1C1A] text-[#FAF9F5] p-4 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto select-text shadow-inner">
        {viewFormat === "text" ? (
          <div className="whitespace-pre-wrap">
            {previewLines.map((line, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-neutral-500 select-none w-6 text-right shrink-0">
                  {idx + 1}
                </span>
                <span className="text-neutral-200">{line || " "}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 font-mono">
            {text.split(/\s+/).slice(0, 80).map((tok, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 text-[10px]"
              >
                {tok}
              </span>
            ))}
            {text.split(/\s+/).length > 80 && (
              <span className="text-neutral-500 text-[10px] self-center">...</span>
            )}
          </div>
        )}

        {!isExpanded && lines.length > 12 && (
          <div className="pt-3 flex justify-between items-center text-neutral-400 border-t border-white/10 mt-2">
            <span>{lines.length - 12} more lines in buffer</span>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-[#FAF9F5] underline hover:text-white flex items-center gap-1 font-semibold"
            >
              <ChevronDown className="w-3 h-3" />
              <span>Expand Full Stream</span>
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-neutral-400 hover:text-white flex items-center gap-1 text-[10px] ml-auto"
            >
              <ChevronUp className="w-3 h-3" />
              <span>Collapse Stream</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
