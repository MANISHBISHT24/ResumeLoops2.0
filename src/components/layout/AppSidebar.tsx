"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Grid,
  FileEdit,
  Layers,
  ShieldAlert,
  GitCompare,
  X,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Workspace", icon: Grid },
  { href: "/builder", label: "Live Editor", icon: FileEdit },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/ats-analyzer", label: "ATS Diagnostics", icon: ShieldAlert },
  { href: "/ai-rewriter", label: "Job Match", icon: GitCompare },
];

export function AppSidebar({
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between py-6">
      <div className="flex flex-col gap-6 px-4">
        {/* Brand & Overline */}
        <div className="flex items-center justify-between px-2">
          <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-medium">
            Studio Engine
          </span>
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface lg:hidden"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1" aria-label="Studio Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileClose?.()}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded transition-all font-label-md text-sm ${
                  isActive
                    ? "bg-surface-container text-on-surface font-semibold shadow-2xs border border-border-subtle/50"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-on-surface" : "text-on-surface-variant"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Metadata & User Controls */}
      <div className="px-4 flex flex-col gap-3 border-t border-border-subtle pt-4 text-xs">
        <div className="flex items-center justify-between px-2 py-0.5">
          <span className="font-label-xs text-label-xs uppercase text-on-surface-variant font-medium">Format</span>
          <span className="font-label-xs text-label-xs text-on-surface font-mono">US Letter / 120gsm</span>
        </div>
        <div className="flex items-center justify-between px-2 py-0.5">
          <span className="font-label-xs text-label-xs uppercase text-on-surface-variant font-medium">Typography</span>
          <span className="font-label-xs text-label-xs text-on-surface font-mono">Inter Pro</span>
        </div>

        <div className="pt-2 border-t border-border-subtle/50 px-2">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-label-xs text-xs font-semibold text-on-surface truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate font-mono">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-on-surface-variant">
                {isConfigured ? "Guest" : "Setup Mode"}
              </span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className="no-print hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-surface border-r border-border-subtle z-40 flex-col"
        aria-label="Studio Engine Navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="no-print fixed inset-0 bg-black/40 z-50 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`no-print fixed inset-y-0 left-0 w-64 bg-surface border-r border-border-subtle z-50 transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Navigation Sidebar"
        aria-hidden={!mobileOpen}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
