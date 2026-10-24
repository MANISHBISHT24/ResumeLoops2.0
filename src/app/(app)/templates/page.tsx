import React from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { DEMO_TEMPLATES } from "@/lib/sample-data";

export const metadata = {
  title: "Templates Gallery — ResumeLoops",
  description: "Curated publication-quality resume designs engineered for high ATS compatibility.",
};

export default function TemplatesPage() {
  const categories = ["All Templates", "Executive", "Minimal", "Modern", "Professional"];

  return (
    <div className="space-y-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">
              Curated Collection
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Templates Gallery
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
            Publication-quality resume formats engineered for maximum ATS readability and visual authority.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search templates..."
            className="w-full"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              idx === 0
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-border-subtle"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEMO_TEMPLATES.map((tmpl) => (
          <Card key={tmpl.id} className="p-0 overflow-hidden flex flex-col justify-between">
            {/* Aspect Ratio Preview Sheet */}
            <div className="aspect-[1/1.3] bg-surface-container-low p-6 flex flex-col items-center justify-center border-b border-border-subtle relative group">
              <div className="w-full h-full bg-white rounded shadow-sm border border-border-subtle p-4 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <div className="h-2.5 w-1/2 bg-on-surface rounded-xs" />
                  <div className="h-1.5 w-3/4 bg-border-subtle rounded-xs" />
                  <div className="h-1.5 w-full bg-border-subtle/60 rounded-xs" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-1/3 bg-primary/40 rounded-xs" />
                  <div className="h-1 w-full bg-border-subtle/80 rounded-xs" />
                  <div className="h-1 w-4/5 bg-border-subtle/80 rounded-xs" />
                </div>
              </div>

              <div className="absolute top-3 right-3">
                <Badge variant="indigo" className="text-[10px] bg-white/90 backdrop-blur-xs">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {tmpl.rating}
                </Badge>
              </div>
            </div>

            {/* Template Info & Actions */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="neutral">{tmpl.category}</Badge>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {tmpl.atsCompatibility}% ATS
                  </span>
                </div>
                <h3 className="font-bold text-base text-on-surface">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center gap-2">
                <Link href="/builder" className="w-full">
                  <Button variant="primary" size="sm" className="w-full">
                    Use Template
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
