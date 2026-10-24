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
            className="text-xs font-semibold text-on-surface uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`w-full px-3.5 py-2 text-sm rounded bg-surface-container-lowest text-on-surface border transition-all placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:bg-surface-container-low disabled:cursor-not-allowed ${
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

Input.displayName = "Input";
