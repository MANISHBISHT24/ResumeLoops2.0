import React from "react";
import { CheckCircle2 } from "lucide-react";

export function MarketingFeatures() {
  return (
    <section
      id="diagnostics"
      className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-surface-container rounded p-6 sm:p-12 shadow-xs border border-border-subtle">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Text Info */}
            <div className="lg:col-span-6">
              <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-medium">
                Diagnostics Suite
              </span>
              <h2 className="mt-2 font-headline-lg text-2xl sm:text-4xl font-medium text-on-surface tracking-tight leading-snug">
                Machine validation without graphic compromise.
              </h2>
              <p className="mt-3 font-body-md text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Every document is cross-checked against strict enterprise ATS parsers (Workday, Greenhouse, Taleo) to guarantee flawless text-extraction while maintaining fine typography.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-body-sm text-sm text-on-surface font-medium">
                    Standard Unicode character compliance
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-body-sm text-sm text-on-surface font-medium">
                    Structured optical heading hierarchies
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-body-sm text-sm text-on-surface font-medium">
                    Zero parsing artifact risk
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostics Metrics Visual Panel */}
            <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded shadow-sm border border-border-subtle">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <span className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant font-medium">
                  Engine Readout
                </span>
                <span className="font-label-xs text-label-xs text-on-surface-variant font-mono">
                  STATUS: OPTIMAL
                </span>
              </div>

              {/* Metric 1: Overall Fidelity */}
              <div className="py-3">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-title-md text-sm font-semibold text-on-surface">
                    Parse Fidelity Index
                  </span>
                  <span className="font-headline-sm text-lg font-mono text-on-surface font-semibold">
                    98.4%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "98.4%" }}
                  />
                </div>
              </div>

              {/* Metric 2: Hierarchy Score */}
              <div className="py-3">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-body-sm text-xs sm:text-sm text-on-surface">
                    Typographic Hierarchy Validation
                  </span>
                  <span className="font-body-sm text-xs sm:text-sm font-mono text-on-surface">
                    100%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Metric 3: Semantic Density */}
              <div className="py-3">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-body-sm text-xs sm:text-sm text-on-surface">
                    Executive Semantic Density
                  </span>
                  <span className="font-body-sm text-xs sm:text-sm font-mono text-on-surface">
                    94.2%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "94.2%" }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-label-xs text-xs border-t border-border-subtle/50">
                <span>Parser: Greenhouse API v4</span>
                <span>Updated Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
