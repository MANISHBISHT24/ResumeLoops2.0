"use client";

import React from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { ExperienceItem } from "@/types/resume";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface ExperienceFormProps {
  experience: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

export function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
  const [expandedIndex, setExpandedIndex] = React.useState<number>(0);

  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: "Senior Engineer / Lead",
      company: "Company Name",
      location: "San Francisco, CA",
      startDate: "2023",
      endDate: "Present",
      isCurrentRole: true,
      bullets: [
        "Spearheaded major architectural initiative improving team deployment velocity by 30%.",
        "Mentored and guided cross-functional team members on system resilience and testing best practices.",
      ],
    };
    const updated = [newItem, ...experience];
    onChange(updated);
    setExpandedIndex(0);
  };

  const handleRemoveExperience = (index: number) => {
    const updated = experience.filter((_, idx) => idx !== index);
    onChange(updated);
    if (expandedIndex >= updated.length) {
      setExpandedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleItemChange = (index: number, updates: Partial<ExperienceItem>) => {
    const updated = experience.map((item, idx) => {
      if (idx === index) {
        return { ...item, ...updates };
      }
      return item;
    });
    onChange(updated);
  };

  const handleAddBullet = (expIndex: number) => {
    const item = experience[expIndex];
    const updatedBullets = [...item.bullets, "New quantified achievement bullet highlighting business impact."];
    handleItemChange(expIndex, { bullets: updatedBullets });
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, newText: string) => {
    const item = experience[expIndex];
    const updatedBullets = item.bullets.map((b, idx) => (idx === bulletIndex ? newText : b));
    handleItemChange(expIndex, { bullets: updatedBullets });
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const item = experience[expIndex];
    const updatedBullets = item.bullets.filter((_, idx) => idx !== bulletIndex);
    handleItemChange(expIndex, { bullets: updatedBullets });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-on-surface">Work Experience</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Your career positions, responsibilities, and quantified achievements.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddExperience}
          className="flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Add Position</span>
        </Button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-border-subtle">
          <Briefcase className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-60" />
          <p className="text-xs text-on-surface-variant font-medium mb-3">
            No work experience added yet.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddExperience}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Role</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((item, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden shadow-2xs"
              >
                {/* Accordion Item Header */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 truncate">
                      <h4 className="text-sm font-bold text-on-surface truncate">
                        {item.role || "Untitled Role"}
                      </h4>
                      <p className="text-xs text-on-surface-variant truncate">
                        {item.company || "Company"} • {item.startDate} — {item.isCurrentRole ? "Present" : item.endDate || "Present"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExperience(idx);
                      }}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove position"
                      aria-label="Remove position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </div>
                </div>

                {/* Expanded Form Fields */}
                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-border-subtle/80 space-y-4 bg-surface-container-lowest">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Job Title / Role"
                        required
                        value={item.role}
                        onChange={(e) => handleItemChange(idx, { role: e.target.value })}
                        placeholder="e.g. Staff Infrastructure Engineer"
                      />
                      <Input
                        label="Company Name"
                        required
                        value={item.company}
                        onChange={(e) => handleItemChange(idx, { company: e.target.value })}
                        placeholder="e.g. Stripe"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <Input
                        label="Location"
                        value={item.location || ""}
                        onChange={(e) => handleItemChange(idx, { location: e.target.value })}
                        placeholder="e.g. San Francisco, CA"
                      />
                      <Input
                        label="Start Date"
                        value={item.startDate}
                        onChange={(e) => handleItemChange(idx, { startDate: e.target.value })}
                        placeholder="e.g. 2021"
                      />
                      <div>
                        <Input
                          label="End Date"
                          disabled={item.isCurrentRole}
                          value={item.isCurrentRole ? "Present" : item.endDate || ""}
                          onChange={(e) => handleItemChange(idx, { endDate: e.target.value })}
                          placeholder="e.g. 2024"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`current-role-${item.id}`}
                        checked={Boolean(item.isCurrentRole)}
                        onChange={(e) =>
                          handleItemChange(idx, {
                            isCurrentRole: e.target.checked,
                            endDate: e.target.checked ? "Present" : "",
                          })
                        }
                        className="rounded border-border-subtle text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <label
                        htmlFor={`current-role-${item.id}`}
                        className="text-xs text-on-surface font-medium cursor-pointer"
                      >
                        I currently work in this role
                      </label>
                    </div>

                    {/* Achievement Bullets */}
                    <div className="space-y-2 pt-3 border-t border-border-subtle/60">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                          Key Achievements &amp; Responsibilities ({item.bullets.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(idx)}
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {item.bullets.map((bullet, bulletIdx) => (
                          <div key={bulletIdx} className="flex items-start gap-2">
                            <span className="text-xs text-on-surface-variant pt-2 select-none font-mono">
                              •
                            </span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => handleBulletChange(idx, bulletIdx, e.target.value)}
                              className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-surface-container-lowest border border-border-subtle focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 leading-relaxed"
                              placeholder="Quantified accomplishment with metrics and business outcomes..."
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(idx, bulletIdx)}
                              className="p-1.5 text-on-surface-variant hover:text-red-600 transition-colors mt-1 shrink-0"
                              title="Delete bullet"
                              aria-label="Delete bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
