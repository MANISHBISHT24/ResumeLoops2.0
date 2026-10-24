import React from "react";
import Link from "next/link";
import { Sparkles, FileText } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-warm-ivory/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
        >
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight text-on-surface">
              ResumeLoops
            </span>
            <Badge variant="indigo">Phase 3B</Badge>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              Open Workspace
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
