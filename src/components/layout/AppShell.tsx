"use client";

import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col">
      <AppHeader onMobileMenuOpen={() => setMobileOpen(true)} />
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="md:pl-64 flex flex-col flex-1 pt-16 min-w-0">
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
