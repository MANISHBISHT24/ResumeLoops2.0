"use client";

import React, { useState } from "react";
import { Plus, X, Trash2, Code2 } from "lucide-react";
import { SkillCategory } from "@/types/resume";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface SkillsFormProps {
  categories: SkillCategory[];
  onChange: (updated: SkillCategory[]) => void;
}

export function SkillsForm({ categories, onChange }: SkillsFormProps) {
  const [newSkillInput, setNewSkillInput] = useState<{ [catId: string]: string }>({});

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: `skills-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoryName: "Core Competencies",
      skills: ["Problem Solving", "Collaboration"],
    };
    onChange([...categories, newCat]);
  };

  const handleRemoveCategory = (catId: string) => {
    onChange(categories.filter((c) => c.id !== catId));
  };

  const handleCategoryNameChange = (catId: string, newName: string) => {
    onChange(
      categories.map((c) => (c.id === catId ? { ...c, categoryName: newName } : c))
    );
  };

  const handleAddSkill = (catId: string) => {
    const text = newSkillInput[catId]?.trim();
    if (!text) return;

    onChange(
      categories.map((c) => {
        if (c.id === catId && !c.skills.includes(text)) {
          return { ...c, skills: [...c.skills, text] };
        }
        return c;
      })
    );

    setNewSkillInput({ ...newSkillInput, [catId]: "" });
  };

  const handleRemoveSkill = (catId: string, skillToRemove: string) => {
    onChange(
      categories.map((c) => {
        if (c.id === catId) {
          return { ...c, skills: c.skills.filter((s) => s !== skillToRemove) };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-on-surface">Technical Skills &amp; Competencies</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Organize skills by domain (Languages, Frameworks, Cloud, Tools) for high-precision ATS matching.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddCategory}
          className="flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Add Skill Group</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-border-subtle">
          <Code2 className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-60" />
          <p className="text-xs text-on-surface-variant font-medium mb-3">
            No skill categories added yet.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddCategory}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill Group</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-surface-container-lowest rounded-xl border border-border-subtle p-4 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-3">
                <Input
                  label="Category Name"
                  value={category.categoryName}
                  onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                  placeholder="e.g. Systems & Cloud, Languages, Design Tools"
                  className="font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category.id)}
                  className="p-1.5 rounded text-on-surface-variant hover:text-red-600 transition-colors shrink-0 mt-5"
                  title="Remove category"
                  aria-label="Remove category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Skills Chips */}
              <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 rounded-lg bg-surface-container-low/70 border border-border-subtle">
                {category.skills.length === 0 ? (
                  <span className="text-xs text-on-surface-variant/70 italic">
                    No skills added in this group yet.
                  </span>
                ) : (
                  category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-primary font-medium text-xs border border-primary/20"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(category.id, skill)}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                        title={`Remove ${skill}`}
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillInput[category.id] || ""}
                  onChange={(e) =>
                    setNewSkillInput({ ...newSkillInput, [category.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(category.id);
                    }
                  }}
                  placeholder="Type a skill (e.g. TypeScript, Kubernetes) and press Enter"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-surface-container-lowest border border-border-subtle focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddSkill(category.id)}
                  className="shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
