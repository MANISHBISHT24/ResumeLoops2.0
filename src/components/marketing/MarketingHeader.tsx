"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-border-subtle transition-all">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 group text-inherit no-underline focus:outline-none"
          >
            <span className="font-title-md text-title-md tracking-tight text-on-surface">
              ResumeLoops
            </span>
            <span className="font-label-xs text-label-xs tracking-widest uppercase px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
              Editions
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-6 text-sm"
          >
            <a
              href="#templates"
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface tracking-normal transition-colors py-1"
            >
              Templates
            </a>
            <a
              href="#philosophy"
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface tracking-normal transition-colors py-1"
            >
              Principles
            </a>
            <a
              href="#diagnostics"
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface tracking-normal transition-colors py-1"
            >
              Diagnostics
            </a>
            <a
              href="#pricing"
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface tracking-normal transition-colors py-1"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface tracking-normal transition-colors py-1"
            >
              FAQ
            </a>
          </nav>
        </div>

        {/* Right Action: Studio Links & Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Enter Studio
              </Link>
              <Link
                href="/dashboard"
                className="h-9 px-4 rounded bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center transition-colors hover:bg-neutral-800 shadow-xs"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
              <Link
                href="/dashboard"
                aria-label="User Workspace Profile"
                className="w-8 h-8 rounded-full bg-surface-container text-on-surface border border-border-subtle flex items-center justify-center shadow-xs"
              >
                <User className="w-4 h-4 text-on-surface" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="h-9 px-4 rounded bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center transition-colors hover:bg-neutral-800 shadow-xs"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded text-on-surface hover:bg-surface-container transition-colors lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-b border-border-subtle px-6 py-4 shadow-lg animate-in fade-in duration-150">
          <nav className="flex flex-col gap-2">
            <a
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm text-on-surface font-medium hover:text-brand transition-colors"
            >
              Curated Templates
            </a>
            <a
              href="#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm text-on-surface font-medium hover:text-brand transition-colors"
            >
              Our Principles
            </a>
            <a
              href="#diagnostics"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm text-on-surface font-medium hover:text-brand transition-colors"
            >
              Diagnostics Suite
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm text-on-surface font-medium hover:text-brand transition-colors"
            >
              Pricing &amp; Membership
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm text-on-surface font-medium hover:text-brand transition-colors"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
              <Link
                href={user ? "/dashboard" : "/signup"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-primary text-on-primary text-sm font-medium text-center rounded transition-colors hover:bg-neutral-800 flex items-center justify-center gap-1.5"
              >
                <span>{user ? "Enter Studio" : "Get Started"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
