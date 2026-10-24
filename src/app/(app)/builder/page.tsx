"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  ListOrdered,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Resume } from "@/types/resume";
import { DEMO_RESUME, DEMO_TEMPLATES } from "@/lib/sample-data";
import { getResumeById, getStoredResumes } from "@/lib/storage";

function BuilderContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const activeResume: Resume = React.useMemo(() => {
    if (!resumeId) return DEMO_RESUME;
    const found = getResumeById(resumeId);
    if (found) return found;
    const all = getStoredResumes();
    return all.length > 0 ? all[0] : DEMO_RESUME;
  }, [resumeId]);

  const template = DEMO_TEMPLATES.find((t) => t.id === activeResume.templateId);

  const sections = [
    { name: "Personal Details", status: "Complete", active: true },
    { name: "Professional Summary", status: "Complete", active: false },
    { name: "Work Experience", status: "Complete", active: false },
    { name: "Education", status: "Complete", active: false },
    { name: "Technical Skills", status: "Complete", active: false },
    { name: "Projects", status: "Complete", active: false },
    { name: "Certifications", status: "Complete", active: false },
  ];

  return (
    <div className="space-y-6">
      {/* Honest In-Progress Editor Banner */}
      <div className="p-3.5 rounded-xl bg-secondary-container/60 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="indigo" className="text-[10px] shrink-0">
            Phase 3D Draft Mode
          </Badge>
          <span className="text-on-surface font-medium">
            Viewing resume draft: <strong className="font-bold">{activeResume.title}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
          <span>Saved to local browser storage</span>
          <Link
            href="/dashboard"
            className="font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Top Builder Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-on-surface">
                {activeResume.title}
              </h2>
              <Badge variant="indigo">
                {template ? template.name : "Swiss Chronicle"}
              </Badge>
            </div>
            <p className="text-xs text-on-surface-variant">
              Target: {activeResume.targetRole || "General Application"}
              {activeResume.targetCompany ? ` • ${activeResume.targetCompany}` : ""} •{" "}
              {activeResume.lastModified}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/templates">
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Template
            </Button>
          </Link>
          <Button variant="secondary" size="sm">
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Button>
          <Button variant="primary" size="sm">
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* 3-Panel Architecture Grid Representation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Section Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5" />
              Sections
            </span>
            <Badge variant="neutral">7/7 Complete</Badge>
          </div>

          <div className="space-y-1.5">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg text-sm transition-all border ${
                  section.active
                    ? "bg-secondary-container text-primary font-semibold border-primary/20 shadow-xs"
                    : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-border-subtle font-medium"
                }`}
              >
                <span>{section.name}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: Active Section Form Editor (5 cols) */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Details</CardTitle>
                <Badge variant="indigo">Active Section</Badge>
              </div>
              <CardDescription>
                Update your contact details and professional identity.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  defaultValue={activeResume.personalInfo.firstName}
                />
                <Input
                  label="Last Name"
                  defaultValue={activeResume.personalInfo.lastName}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                defaultValue={activeResume.personalInfo.email}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  defaultValue={activeResume.personalInfo.phone || "+1 (555) 019-2834"}
                />
                <Input
                  label="Location"
                  defaultValue={activeResume.personalInfo.location || "San Francisco, CA"}
                />
              </div>

              <Input
                label="Professional Title"
                defaultValue={activeResume.personalInfo.title}
                helperText="Aligned with target role for ATS title matching."
              />

              <Textarea
                label="Professional Summary"
                rows={4}
                defaultValue={activeResume.summary}
              />

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
                <Button variant="ghost" size="sm">
                  Reset
                </Button>
                <Button variant="primary" size="sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: A4 Live Preview Sheet Representation (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 text-xs text-on-surface-variant font-medium">
              <span>A4 Live Preview</span>
              <span>Page 1 of 1</span>
            </div>

            {/* Simulated Scaled A4 Sheet */}
            <div className="w-full max-w-sm bg-white border border-border-subtle rounded-sm shadow-md p-6 text-left space-y-4">
              <div className="border-b border-border-subtle pb-3">
                <h4 className="text-base font-bold text-on-surface">
                  {activeResume.personalInfo.firstName}{" "}
                  {activeResume.personalInfo.lastName}
                </h4>
                <p className="text-xs font-medium text-primary">
                  {activeResume.personalInfo.title}
                </p>
                <p className="text-[10px] text-on-surface-variant mt-1 font-mono">
                  {activeResume.personalInfo.email} • {activeResume.personalInfo.location}
                </p>
              </div>

              <div className="space-y-1.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-on-surface border-b border-border-subtle/80 pb-0.5">
                  Summary
                </h5>
                <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-3">
                  {activeResume.summary}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-on-surface border-b border-border-subtle/80 pb-0.5">
                  Experience
                </h5>
                {activeResume.experience.slice(0, 2).map((exp) => (
                  <div key={exp.id} className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-semibold text-on-surface">
                      <span>{exp.role}</span>
                      <span className="text-on-surface-variant font-mono">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <p className="text-[9px] text-on-surface-variant">
                      {exp.company}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-on-surface-variant">
          Loading resume editor...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
