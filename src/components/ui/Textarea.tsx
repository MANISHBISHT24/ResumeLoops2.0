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
            className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-medium"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
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
          className={`w-full px-3.5 py-2.5 text-sm rounded bg-surface-container-low text-on-surface border border-border-subtle transition-all placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:bg-surface-container-lowest focus-visible:border-on-surface resize-y disabled:bg-surface-container-highest/50 disabled:cursor-not-allowed ${
            error
              ? "border-error focus-visible:border-error"
              : "border-border-subtle"
          } ${className}`}
          {...props}
        />

        {error ? (
          <span id={errorId} className="text-xs text-error font-medium">
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
