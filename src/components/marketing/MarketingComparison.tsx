import React from "react";
import { X, Check } from "lucide-react";

export function MarketingComparison() {
  const beforePoints = [
    "Generic bullet points lacking measurable results or metrics.",
    "Incompatible multi-column layout causing parsing errors in ATS.",
    "Missing critical industry keywords required by recruiters.",
  ];

  const afterPoints = [
    "Quantified achievements highlighting efficiency and revenue growth.",
    "Clean, single-column structured format fully compliant with major ATS software.",
    "Precisely targeted keywords matching job description requirements.",
  ];

  return (
    <section className="py-24 sm:py-28 bg-surface-container-low px-6 w-full border-y border-surface-container">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Badge & Title */}
        <span className="text-xs uppercase tracking-widest font-bold text-primary mb-2">
          Transformation
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface text-center mb-14 sm:mb-16 tracking-tight">
          The ResumeLoops Effect
        </h2>

        {/* 2-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Before Card */}
          <div className="bg-surface-container-lowest p-7 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-red-200/80 flex flex-col gap-6 relative">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <span className="text-xs sm:text-sm px-3.5 py-1.5 bg-red-50 text-red-700 rounded-full font-bold border border-red-200">
                Before ResumeLoops
              </span>
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">
                ATS Score: <strong className="text-red-600 font-bold text-base">42/100</strong>
              </span>
            </div>

            <ul className="space-y-4 text-sm sm:text-base text-on-surface-variant font-medium">
              {beforePoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After Card */}
          <div className="bg-surface-container-lowest p-7 sm:p-8 rounded-2xl shadow-[0_15px_40px_rgba(81,69,229,0.08)] border-2 border-primary/40 flex flex-col gap-6 relative">
            {/* Top Right "Optimized" Badge */}
            <div className="absolute -top-3.5 right-6 sm:right-8 bg-primary text-on-primary text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Optimized
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <span className="text-xs sm:text-sm px-3.5 py-1.5 bg-secondary-container text-primary rounded-full font-bold">
                After ResumeLoops
              </span>
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">
                ATS Score: <strong className="text-primary font-black text-base">96/100</strong>
              </span>
            </div>

            <ul className="space-y-4 text-sm sm:text-base text-on-surface font-medium">
              {afterPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
