"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, User } from "lucide-react";

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-warm-ivory/90 backdrop-blur-xl border-b border-surface-container/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all">
      <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span className="font-extrabold text-xl text-on-surface tracking-tight">
            ResumeLoops
          </span>
        </Link>

        {/* Desktop Navigation Pill */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 bg-surface-container-low p-1.5 rounded-full border border-surface-container shadow-2xs"
        >
          <a
            href="#"
            className="transition-all px-4 py-1.5 bg-primary text-on-primary font-medium text-sm rounded-full shadow-sm"
          >
            Home
          </a>
          <a
            href="#templates"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-1.5 font-medium rounded-full hover:bg-surface-container"
          >
            Templates
          </a>
          <a
            href="#features"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-1.5 font-medium rounded-full hover:bg-surface-container"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-1.5 font-medium rounded-full hover:bg-surface-container"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors px-4 py-1.5 font-medium rounded-full hover:bg-surface-container"
          >
            FAQ
          </a>
        </nav>

        {/* Right Action: Launch Workspace / User Indicator */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(81,69,229,0.25)] hover:shadow-[0_6px_20px_rgba(81,69,229,0.35)] hover:-translate-y-0.5"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            aria-label="User Workspace Profile"
            className="w-10 h-10 rounded-full bg-secondary-container text-primary border border-primary/20 flex items-center justify-center font-bold shadow-inner hover:bg-secondary-container/80 transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/dashboard"
            aria-label="User Profile"
            className="w-9 h-9 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold"
          >
            <User className="w-4 h-4 text-primary" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-on-surface hover:bg-surface-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-warm-ivory border-b border-surface-container px-6 py-6 shadow-xl animate-in fade-in duration-200">
          <nav className="flex flex-col gap-3">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-medium text-sm"
            >
              Home
            </a>
            <a
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-on-surface font-medium text-sm hover:bg-surface-container transition-colors"
            >
              Curated Templates
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-on-surface font-medium text-sm hover:bg-surface-container transition-colors"
            >
              Platform Features
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-on-surface font-medium text-sm hover:bg-surface-container transition-colors"
            >
              Pricing &amp; Plans
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-on-surface font-medium text-sm hover:bg-surface-container transition-colors"
            >
              Frequently Asked Questions
            </a>
            <div className="pt-3 border-t border-surface-container flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-primary text-on-primary font-semibold text-center rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
