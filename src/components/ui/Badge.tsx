import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "neutral" | "success";
  children: React.ReactNode;
}

export function Badge({
  variant = "secondary",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors";

  const variantStyles = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary-container text-primary border border-primary/10",
    neutral: "bg-surface-container text-on-surface-variant border border-border-subtle",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
