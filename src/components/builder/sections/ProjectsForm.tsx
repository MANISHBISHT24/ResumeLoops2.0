"use client";

import React from "react";
import { Plus, Trash2, Rocket } from "lucide-react";
import { ProjectItem } from "@/types/resume";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export interface ProjectsFormProps {
  projects: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const handleAddProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: "High-Performance Project",
      description: "Built a scalable open-source utility solving distributed synchronization issues.",
      technologies: ["TypeScript", "Next.js", "Tailwind CSS"],
      url: "https://github.com/example/project",
    };
    onChange([newItem, ...projects]);
  };

  const handleRemoveProject = (index: number) => {
    onChange(projects.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, updates: Partial<ProjectItem>) => {
    const updated = projects.map((item, idx) => {
      if (idx === index) {
        return { ...item, ...updates };
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-on-surface">Key Projects &amp; Open Source</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Demonstrate hands-on technical execution, production architectures, or published tools.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddProject}
          className="flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Add Project</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-border-subtle">
          <Rocket className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-60" />
          <p className="text-xs text-on-surface-variant font-medium mb-3">
            No projects added yet.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddProject}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Project</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((item, idx) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-xl border border-border-subtle p-4 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Project #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(idx)}
                  className="p-1 rounded text-on-surface-variant hover:text-red-600 transition-colors"
                  title="Remove project"
                  aria-label="Remove project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Project Name"
                  required
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, { name: e.target.value })}
                  placeholder="e.g. ChronoSync (Open Source)"
                />
                <Input
                  label="Project Link / Repository"
                  type="url"
                  value={item.url || ""}
                  onChange={(e) => handleItemChange(idx, { url: e.target.value })}
                  placeholder="e.g. https://github.com/example/repo"
                />
              </div>

              <Input
                label="Technologies (comma-separated)"
                value={item.technologies.join(", ")}
                onChange={(e) =>
                  handleItemChange(idx, {
                    technologies: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. Rust, eBPF, Kafka, Kubernetes"
                helperText="Listed technologies are parsed for skill-match verification."
              />

              <Textarea
                label="Description"
                rows={3}
                value={item.description}
                onChange={(e) => handleItemChange(idx, { description: e.target.value })}
                placeholder="Describe the system problem, technical solution, and operational outcome..."
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
