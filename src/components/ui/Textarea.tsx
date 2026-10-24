import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, id, rows = 4, className = "", ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-on-surface uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`w-full px-3.5 py-2.5 text-sm rounded bg-surface-container-lowest text-on-surface border transition-all placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 resize-y disabled:bg-surface-container-low disabled:cursor-not-allowed ${
            error
              ? "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-200"
              : "border-border-subtle focus-visible:border-primary"
          } ${className}`}
          {...props}
        />

        {error ? (
          <span id={errorId} className="text-xs text-rose-600 font-medium">
            {error}
          </span>
        ) : helperText ? (
          <span id={helperId} className="text-xs text-on-surface-variant">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
