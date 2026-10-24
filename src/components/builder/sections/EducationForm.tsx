"use client";

import React from "react";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { EducationItem } from "@/types/resume";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface EducationFormProps {
  education: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationYear: "2020",
      honors: "Magna Cum Laude",
    };
    onChange([newItem, ...education]);
  };

  const handleRemoveEducation = (index: number) => {
    onChange(education.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, updates: Partial<EducationItem>) => {
    const updated = education.map((item, idx) => {
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
          <h3 className="text-base font-bold text-on-surface">Education</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Degrees, academic institutions, graduation dates, and academic honors.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddEducation}
          className="flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Add Education</span>
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-border-subtle">
          <GraduationCap className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-60" />
          <p className="text-xs text-on-surface-variant font-medium mb-3">
            No education entries added yet.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddEducation}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Degree</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((item, idx) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-xl border border-border-subtle p-4 space-y-4 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Degree #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="p-1 rounded text-on-surface-variant hover:text-red-600 transition-colors"
                  title="Remove education"
                  aria-label="Remove education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Degree / Major"
                  required
                  value={item.degree}
                  onChange={(e) => handleItemChange(idx, { degree: e.target.value })}
                  placeholder="e.g. B.S. in Computer Science"
                />
                <Input
                  label="Institution / University"
                  required
                  value={item.institution}
                  onChange={(e) => handleItemChange(idx, { institution: e.target.value })}
                  placeholder="e.g. UC Berkeley"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Location"
                  value={item.location || ""}
                  onChange={(e) => handleItemChange(idx, { location: e.target.value })}
                  placeholder="e.g. Berkeley, CA"
                />
                <Input
                  label="Graduation Year"
                  value={item.graduationYear}
                  onChange={(e) => handleItemChange(idx, { graduationYear: e.target.value })}
                  placeholder="e.g. 2021"
                />
                <Input
                  label="Honors / Field of Study (Optional)"
                  value={item.honors || ""}
                  onChange={(e) => handleItemChange(idx, { honors: e.target.value })}
                  placeholder="e.g. Magna Cum Laude"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
