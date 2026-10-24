"use client";

import React from "react";
import { CategoryScore } from "@/lib/ats-analysis";

interface CategoryBreakdownProps {
  categories: CategoryScore[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-sm space-y-6">
      <div className="border-b border-border-subtle pb-3">
        <h3 className="text-lg font-bold text-on-surface">Category Score Breakdown</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Deterministic 100-point rubric assessing core resume sections and depth.
        </p>
      </div>

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-on-surface">{cat.category}</span>
              <span className="text-primary font-bold">
                {cat.score} / {cat.maxScore} pts ({cat.percentage}%)
              </span>
            </div>

            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cat.percentage >= 80
                    ? "bg-primary"
                    : cat.percentage >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>

            <p className="text-[11px] sm:text-xs text-on-surface-variant leading-snug">
              {cat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
