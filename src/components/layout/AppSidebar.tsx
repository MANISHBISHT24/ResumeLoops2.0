"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileEdit,
  LayoutTemplate,
  Sparkles,
  Gauge,
  X,
  FileText,
} from "lucide-react";

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/builder", label: "Resume Builder", icon: FileEdit },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/ai-rewriter", label: "AI Tailoring", icon: Sparkles },
  { href: "/ats-analyzer", label: "ATS Analyzer", icon: Gauge },
];

export function AppSidebar({
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 mb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label="ResumeLoops Dashboard"
        >
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-on-surface">
            ResumeLoops
          </span>
        </Link>

        {/* Mobile close button */}
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5" aria-label="Main Application Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onMobileClose?.()}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "bg-secondary-container text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-medium"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Workspace Footer Note */}
      <div className="pt-4 border-t border-border-subtle px-3 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
          <span className="font-medium text-on-surface">Workspace Active</span>
        </div>
        <p className="text-[11px] leading-tight text-on-surface-variant/80">
          Independent Scaffold
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-surface-container-low border-r border-border-subtle z-30 flex-col"
        aria-label="Application Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-surface-container-low border-r border-border-subtle z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Application Sidebar"
        aria-hidden={!mobileOpen}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
