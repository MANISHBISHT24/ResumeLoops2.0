"use client";

import React from "react";
import { Plus, Trash2, Award } from "lucide-react";
import { CertificationItem } from "@/types/resume";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface CertificationsFormProps {
  certifications: CertificationItem[];
  onChange: (updated: CertificationItem[]) => void;
}

export function CertificationsForm({
  certifications,
  onChange,
}: CertificationsFormProps) {
  const handleAddCert = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: "AWS Certified Solutions Architect — Professional",
      issuer: "Amazon Web Services",
      date: "2023",
    };
    onChange([...certifications, newItem]);
  };

  const handleRemoveCert = (index: number) => {
    onChange(certifications.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, updates: Partial<CertificationItem>) => {
    const updated = certifications.map((item, idx) => {
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
          <h3 className="text-base font-bold text-on-surface">Certifications &amp; Licenses</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Verified credentials from recognized industry authorities and platforms.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddCert}
          className="flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Add Credential</span>
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-surface-container-low border border-dashed border-border-subtle">
          <Award className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-60" />
          <p className="text-xs text-on-surface-variant font-medium mb-3">
            No certifications added yet.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={handleAddCert}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Credential</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((item, idx) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-xl border border-border-subtle p-4 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Credential #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCert(idx)}
                  className="p-1 rounded text-on-surface-variant hover:text-red-600 transition-colors"
                  title="Remove certification"
                  aria-label="Remove certification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Certification / Credential Name"
                    required
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, { name: e.target.value })}
                    placeholder="e.g. Certified Kubernetes Administrator (CKA)"
                  />
                </div>
                <div>
                  <Input
                    label="Date / Year"
                    value={item.date || ""}
                    onChange={(e) => handleItemChange(idx, { date: e.target.value })}
                    placeholder="e.g. 2023"
                  />
                </div>
              </div>

              <Input
                label="Issuing Organization"
                required
                value={item.issuer}
                onChange={(e) => handleItemChange(idx, { issuer: e.target.value })}
                placeholder="e.g. Cloud Native Computing Foundation (CNCF)"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
