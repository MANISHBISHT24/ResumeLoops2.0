import React from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  ArrowRight,
  Sparkles,
  Gauge,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DEMO_RECENT_RESUMES } from "@/lib/sample-data";

export const metadata = {
  title: "Dashboard — ResumeLoops",
  description: "Workspace dashboard overview of active resumes and targeting pipelines.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
              Active Workspace
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Workspace Dashboard
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage your targeted resumes, monitor ATS readiness, and generate tailored applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/builder">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              New Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Action Card: Quick Start Generator */}
      <div className="relative overflow-hidden bg-primary text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-xl space-y-3">
          <Badge variant="indigo" className="bg-white/15 text-white border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Targeting
          </Badge>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
            Target your dream role with precision engineering
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">
            Generate an ATS-optimized, publication-quality resume tailored to any job description using the ResumeLoops editorial engine.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link href="/builder">
              <Button
                variant="secondary"
                className="bg-white text-primary hover:bg-surface-container-low border-transparent font-semibold"
              >
                Launch Builder
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Resumes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-base font-semibold text-on-surface">
              Recent Resumes (Demo)
            </h3>
          </div>
          <Badge variant="neutral">3 Drafts</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_RECENT_RESUMES.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between">
              <CardHeader className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="indigo">{item.templateName}</Badge>
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant font-mono">
                    <Clock className="w-3 h-3" />
                    {item.lastEdited}
                  </span>
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription className="text-xs">
                  Target: {item.targetRole} • {item.targetCompany}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs p-2 rounded bg-surface-container-low border border-border-subtle">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-primary" />
                    ATS Compatibility
                  </span>
                  <span className="font-bold text-primary">{item.atsScore}%</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link href="/builder" className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Edit Draft
                    </Button>
                  </Link>
                  <Link href="/ats-analyzer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View ATS
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
