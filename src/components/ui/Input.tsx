import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, id, className = "", ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant font-medium"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`w-full px-3.5 py-2 text-sm rounded bg-surface-container-low text-on-surface border border-border-subtle transition-all placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:bg-surface-container-lowest focus-visible:border-on-surface disabled:bg-surface-container-highest/50 disabled:cursor-not-allowed ${
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

Input.displayName = "Input";
