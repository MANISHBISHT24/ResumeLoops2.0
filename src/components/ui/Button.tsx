import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "brand";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-on-surface focus-visible:ring-offset-1 active:translate-y-[0.5px] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-primary text-on-primary hover:bg-[#2c2c2c] active:bg-black shadow-xs",
      secondary:
        "bg-surface-container-low text-on-surface border border-border-subtle hover:bg-surface-container hover:border-on-surface/40 shadow-xs",
      outline:
        "bg-transparent text-on-surface border border-border-subtle hover:bg-surface-container-low hover:border-on-surface",
      ghost:
        "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
      destructive:
        "bg-error text-on-error hover:bg-[#9e2d23] shadow-xs active:translate-y-[1px]",
      brand:
        "bg-brand text-white hover:bg-brand-hover shadow-xs active:translate-y-[1px]",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-10 gap-2",
      lg: "text-base px-6 py-2.5 h-11 gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
