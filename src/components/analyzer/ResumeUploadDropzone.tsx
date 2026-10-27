"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface ResumeUploadDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeUploadDropzone({
  selectedFile,
  onFileSelect,
  onFileClear,
  isProcessing = false,
  disabled = false,
}: ResumeUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = useCallback(
    (file: File) => {
      setClientError(null);

      // Check size limit (10 MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setClientError(
          `File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please upload a smaller document.`
        );
        return;
      }

      // Check extension / type
      const lowerName = file.name.toLowerCase();
      const isPdf = lowerName.endsWith(".pdf") || file.type === "application/pdf";
      const isDocx =
        lowerName.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isPdf && !isDocx) {
        setClientError(
          "Unsupported format. Please upload a standard text-based PDF or Word document (.docx)."
        );
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndHandleFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  const handleClickBrowse = () => {
    if (!disabled && !isProcessing && inputRef.current) {
      inputRef.current.click();
    }
  };

  // 1. File Selected State
  if (selectedFile) {
    const isPdf = selectedFile.name.toLowerCase().endsWith(".pdf");

    return (
      <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/40 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-surface-container text-on-surface border border-outline-variant/40">
              <FileText className="w-5 h-5 text-secondary" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-title-md text-body-sm font-semibold text-on-surface truncate block" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider shrink-0 bg-surface-container-highest text-on-surface border border-outline-variant/30">
                  {isPdf ? "PDF" : "DOCX"}
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 font-mono">
                {formatFileSize(selectedFile.size)} • Ready for parse extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClickBrowse}
              disabled={isProcessing}
              className="text-xs"
              aria-label="Replace selected resume file"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onFileClear}
              disabled={isProcessing}
              className="text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50"
              aria-label="Remove selected resume file"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Remove
            </Button>
          </div>
        </div>

        {/* Hidden file input for replace action */}
        <input
          ref={inputRef}
          type="file"
          id="resume-file-replace-input"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>
    );
  }

  // 2. Idle / Drag & Drop Upload State
  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickBrowse}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClickBrowse();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload resume: Drag and drop a PDF or DOCX file here, or press Enter to browse files"
        className={`w-full relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
          isDragOver
            ? "border-primary bg-surface-container-high scale-[1.005]"
            : "border-outline-variant/60 hover:border-on-surface bg-surface-container-lowest hover:bg-surface-container-low"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface shadow-2xs">
            <UploadCloud className="w-6 h-6 text-secondary" />
          </div>

          <div className="space-y-1">
            <p className="font-title-md text-title-md text-on-surface">
              Drop resume document here, or <span className="underline decoration-1 underline-offset-4 text-primary">browse files</span>
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
              Accepts machine-readable PDF or DOCX files up to 10 MB. Scanned image PDFs are not supported.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1 text-on-surface-variant font-label-xs text-label-xs">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#276a45]" /> Single-column verified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#276a45]" /> Private Storage
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#276a45]" /> Max 10 MB
            </span>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          id="resume-file-input"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          disabled={disabled || isProcessing}
          className="sr-only"
        />
      </div>

      {/* Client validation error notice */}
      {clientError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-body-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-snug">{clientError}</p>
        </div>
      )}
    </div>
  );
}
