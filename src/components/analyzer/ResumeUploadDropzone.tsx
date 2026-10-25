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
      <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-border-subtle/80">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isPdf ? "bg-red-50 text-red-600 border border-red-200" : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              <FileText className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-on-surface truncate block" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    isPdf ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isPdf ? "PDF" : "DOCX"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {formatFileSize(selectedFile.size)} • Ready for analysis
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
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
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
        className={`w-full relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
          isDragOver
            ? "border-primary bg-secondary-container/30 scale-[1.01]"
            : "border-border-subtle hover:border-primary/50 bg-surface-container-low/40 hover:bg-surface-container-low/70"
        } ${disabled || isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="max-w-md mx-auto space-y-4 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container text-primary flex items-center justify-center mx-auto shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-base sm:text-lg font-bold text-on-surface">
              Drag and drop your resume file here
            </p>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              or <span className="text-primary font-semibold underline underline-offset-2">browse computer files</span> to upload
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-subtle/80 text-[11px] font-medium text-on-surface-variant">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepted: PDF &amp; DOCX • Maximum 10 MB per file
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          id="resume-file-upload-input"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {clientError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{clientError}</span>
        </div>
      )}

      {/* Honest OCR notice and privacy disclosure */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1 text-[11px] text-on-surface-variant/80">
        <p>
          <strong>Notice:</strong> Text-based resumes only. Scanned image PDFs without selectable text require OCR (not supported in this version).
        </p>
        <p className="italic shrink-0">
          Files are parsed securely on the server.
        </p>
      </div>
    </div>
  );
}
