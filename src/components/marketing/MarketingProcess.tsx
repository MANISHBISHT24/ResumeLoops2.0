import React from "react";
import { FileEdit, BarChart3, Rocket } from "lucide-react";

export function MarketingProcess() {
  const steps = [
    {
      number: "01",
      icon: FileEdit,
      title: "Import or Build",
      description:
        "Paste your existing resume or start fresh with our guided questionnaire. Our editor formats everything instantly.",
    },
    {
      number: "02",
      icon: BarChart3,
      title: "ATS Optimization",
      description:
        "Paste the job description and watch our AI scan for missing keywords, suggesting precise enhancements.",
    },
    {
      number: "03",
      icon: Rocket,
      title: "Export & Apply",
      description:
        "Download pixel-perfect PDFs or generate tailored link shares that track recruiter engagement.",
    },
  ];

  return (
    <section className="py-24 sm:py-28 bg-surface-container-low px-6 w-full border-y border-surface-container">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Badge & Title */}
        <span className="text-xs uppercase tracking-widest font-bold text-primary mb-2">
          Simple Process
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface text-center mb-14 sm:mb-16 tracking-tight">
          From Experience to Opportunity
        </h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-surface-container flex flex-col gap-6 relative overflow-hidden group hover:border-primary/40 hover:shadow-[0_15px_35px_rgba(81,69,229,0.06)] transition-all duration-300"
              >
                {/* Large Numeral Watermark */}
                <div
                  className="text-6xl font-black bg-gradient-to-br from-primary/20 to-primary/5 bg-clip-text text-transparent absolute top-4 right-6 select-none font-display pointer-events-none"
                  aria-hidden="true"
                >
                  {step.number}
                </div>

                {/* Step Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Step Content */}
                <div className="flex flex-col gap-2 relative z-10">
                  <h3 className="font-bold text-on-surface text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
