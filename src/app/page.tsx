import React from "react";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  Layers,
  Palette,
  ShieldCheck,
  FolderGit2,
  Terminal,
} from "lucide-react";

export default function HomePage() {
  const tokens = [
    { name: "Warm Ivory", hex: "#FAF9F6", usage: "Main Canvas Background" },
    { name: "Pure White", hex: "#FFFFFF", usage: "Card & Container Surfaces" },
    { name: "Primary Indigo", hex: "#5145E5", usage: "Primary Actions & Focus" },
    { name: "Near-Black Text", hex: "#171717", usage: "Primary Typography" },
    { name: "Muted Stone", hex: "#77756F", usage: "Secondary Annotations" },
    { name: "Soft Lavender", hex: "#EEEBFF", usage: "Active Highlights & Badges" },
    { name: "Subtle Warm Border", hex: "#E9E6E0", usage: "Architectural Outlines" },
  ];

  const scaffoldChecks = [
    { label: "Independent Project Directory", status: "Verified (C:...\\scratch\\ResumeLoops)" },
    { label: "Isolated Git Repository", status: "Initialized (.git in ResumeLoops only)" },
    { label: "Stitch Export Preservation", status: "Pristine in Downloads & mirrored in design-reference/" },
    { label: "Production Tailwind CSS v4", status: "Tokens configured via @theme in globals.css" },
    { label: "Strict TypeScript & ESLint", status: "Next.js App Router with TypeScript strict mode" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-on-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-medium text-on-surface-variant">
              ResumeLoops Phase 2
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-on-surface mb-4">
            Scaffold &amp; Design System Foundation
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            ResumeLoops is isolated as an independent project engineered from the Google Stitch editorial design specification.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Button variant="primary">
              <ShieldCheck className="w-4 h-4" />
              Scaffold Verified
            </Button>
            <Button variant="secondary">
              <FolderGit2 className="w-4 h-4" />
              Independent Git Root
            </Button>
          </div>
        </div>

        {/* Verification Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Isolation & Setup Card */}
          <div className="p-6 rounded-lg bg-surface-container-lowest border border-border-subtle shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">
                Isolation Verification
              </h2>
            </div>
            <ul className="space-y-3">
              {scaffoldChecks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                  <div>
                    <span className="font-medium text-sm text-on-surface block">
                      {item.label}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono">
                      {item.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Design System Token Card */}
          <div className="p-6 rounded-lg bg-surface-container-lowest border border-border-subtle shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-on-surface">
                Stitch DESIGN.md Tokens
              </h2>
            </div>
            <div className="space-y-2.5">
              {tokens.map((token, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-border-subtle"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded border border-black/10 shrink-0"
                      style={{ backgroundColor: token.hex }}
                    />
                    <div>
                      <span className="text-sm font-medium text-on-surface">
                        {token.name}
                      </span>
                      <span className="text-xs text-on-surface-variant block">
                        {token.usage}
                      </span>
                    </div>
                  </div>
                  <Badge variant="neutral">{token.hex}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="p-6 rounded-lg bg-surface-container border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-on-surface">
                Phase 2 Scaffold Complete
              </h3>
              <p className="text-sm text-on-surface-variant">
                Ready for verification: dependencies, type checking, and production build testing.
              </p>
            </div>
          </div>
          <Badge variant="success">Zero External Mod</Badge>
        </div>
      </main>
    </div>
  );
}
