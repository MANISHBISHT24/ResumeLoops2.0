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
    "inline-flex items-center gap-1.5 px-2 py-0.5 font-label-xs text-label-xs uppercase tracking-wider rounded select-none";

  const resolvedVariant = variant === "secondary" ? "indigo" : variant;

  const variantStyles = {
    neutral:
      "bg-surface-container text-on-surface-variant border border-border-subtle",
    indigo:
      "bg-brand-light text-brand border border-brand/20 font-semibold",
    success:
      "bg-[#e8f5e9] text-[#276a45] border border-[#276a45]/20 font-medium",
    warning:
      "bg-[#fff8e1] text-[#9b7338] border border-[#9b7338]/20 font-medium",
    danger:
      "bg-error-container/60 text-error border border-error/20 font-medium",
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
