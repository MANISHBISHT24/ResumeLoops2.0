"use client";

import React from "react";
import { PersonalInfo } from "@/types/resume";
import { Input } from "@/components/ui/Input";

export interface PersonalFormProps {
  data: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
}

export function PersonalForm({ data, onChange }: PersonalFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-on-surface">Personal Details</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Your legal name, professional title, and primary contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="First Name"
          required
          value={data.firstName || ""}
          onChange={(e) => handleChange("firstName", e.target.value)}
          placeholder="e.g. Alexandre"
        />
        <Input
          label="Last Name"
          required
          value={data.lastName || ""}
          onChange={(e) => handleChange("lastName", e.target.value)}
          placeholder="e.g. Vance"
        />
      </div>

      <Input
        label="Professional Title"
        value={data.title || ""}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="e.g. Staff Infrastructure Engineer & Distributed Systems Lead"
        helperText="Target role title displayed prominently beneath your name."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Email Address"
          type="email"
          required
          value={data.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="e.g. alexandre.vance@example.com"
        />
        <Input
          label="Phone Number"
          type="tel"
          value={data.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="e.g. +1 (555) 389-2140"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Location"
          value={data.location || ""}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="e.g. San Francisco, CA (or Remote)"
        />
        <Input
          label="Website / Portfolio URL"
          type="url"
          value={data.website || ""}
          onChange={(e) => handleChange("website", e.target.value)}
          placeholder="e.g. https://vance.dev"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="LinkedIn Profile"
          value={data.linkedin || ""}
          onChange={(e) => handleChange("linkedin", e.target.value)}
          placeholder="e.g. linkedin.com/in/alexandre-vance"
        />
        <Input
          label="GitHub / Code Portfolio"
          value={data.github || ""}
          onChange={(e) => handleChange("github", e.target.value)}
          placeholder="e.g. github.com/avance"
        />
      </div>
    </div>
  );
}
