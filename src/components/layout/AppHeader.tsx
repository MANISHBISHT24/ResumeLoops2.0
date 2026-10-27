"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface AppHeaderProps {
  onMobileMenuOpen: () => void;
}

export function AppHeader({ onMobileMenuOpen }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    { href: "/dashboard", label: "Workspace" },
    { href: "/builder", label: "Editor" },
    { href: "/templates", label: "Templates" },
    { href: "/ats-analyzer", label: "ATS Diagnostics" },
    { href: "/ai-rewriter", label: "Job Match" },
  ];

  return (
    <header className="no-print fixed top-0 left-0 right-0 z-40 h-16 bg-surface/90 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
          className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 group text-inherit no-underline focus:outline-none"
        >
          <span className="font-title-md text-base sm:text-lg font-semibold tracking-tight text-on-surface">
            ResumeLoops
          </span>
        </Link>

        <span className="h-4 w-px bg-border-subtle hidden md:block" />

        {/* Horizontal Navigation on Desktop */}
        <nav
          aria-label="Studio Top Navigation"
          className="hidden xl:flex items-center gap-6"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label-md text-sm transition-colors ${
                  isActive
                    ? "text-on-surface font-semibold"
                    : "text-on-surface-variant hover:text-on-surface font-normal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden sm:flex items-center">
          <Search className="w-4 h-4 absolute left-2.5 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search archives..."
            className="h-8 pl-8 pr-3 text-xs bg-surface-container-low border border-border-subtle rounded focus:outline-none focus:border-on-surface text-on-surface placeholder:text-on-surface-variant/60 w-36 sm:w-48 lg:w-56 transition-all"
          />
        </div>

        {/* ATS Readiness Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-border-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-[#276a45]" />
          <span className="font-label-xs text-[11px] text-on-surface-variant uppercase tracking-wider font-mono">
            ATS 98%
          </span>
        </div>

        {/* User Account / Profile */}
        {user ? (
          <div
            title={user.email}
            className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface border border-border-subtle flex items-center justify-center font-bold text-xs shadow-2xs select-none"
          >
            {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
          </div>
        ) : (
          <Link
            href="/login"
            className="h-8 px-3 rounded bg-surface-container text-on-surface border border-border-subtle hover:bg-surface-container-high font-label-md text-xs flex items-center justify-center transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
