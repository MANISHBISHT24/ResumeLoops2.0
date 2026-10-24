import React from "react";

export type BadgeVariant =
  | "neutral"
  | "indigo"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors select-none";

  const resolvedVariant = variant === "secondary" ? "indigo" : variant;

  const variantStyles = {
    neutral:
      "bg-surface-container text-on-surface-variant border border-border-subtle",
    indigo:
      "bg-secondary-container text-primary border border-primary/15 font-semibold",
    success:
      "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning:
      "bg-amber-50 text-amber-800 border border-amber-200/80",
    danger:
      "bg-rose-50 text-rose-800 border border-rose-200/80",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[resolvedVariant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
