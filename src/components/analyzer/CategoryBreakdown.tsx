"use client";

import React from "react";
import { CategoryScore } from "@/lib/ats-analysis";

interface CategoryBreakdownProps {
  categories: CategoryScore[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant/40 shadow-xs space-y-4">
      <div className="border-b border-outline-variant/30 pb-2">
        <h3 className="font-title-md text-title-md text-on-surface font-semibold">Category Score Breakdown</h3>
        <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
          Deterministic 100-point rubric assessing core resume sections and depth.
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-1">
            <div className="flex items-center justify-between text-body-sm font-body-sm font-semibold">
              <span className="text-on-surface">{cat.category}</span>
              <span className="font-mono text-on-surface text-label-xs">
                {cat.score} / {cat.maxScore} pts ({cat.percentage}%)
              </span>
            </div>

            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-on-surface rounded-full transition-all duration-500"
                style={{ width: `${cat.percentage}%` }}
              />
            </div>

            <p className="font-body-sm text-[11px] text-on-surface-variant leading-snug">
              {cat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
