import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function MarketingCtaBanner() {
  return (
    <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center bg-surface border-t border-border-subtle">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="font-headline-lg text-3xl sm:text-4xl font-medium text-on-surface tracking-tight">
          Ready to author your document?
        </h2>
        <p className="mt-3 font-body-md text-sm sm:text-base text-on-surface-variant max-w-lg leading-relaxed">
          Join over 12,000 leaders who present their journey with unhurried editorial dignity.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="h-11 px-8 rounded bg-primary text-on-primary font-label-md text-sm font-medium transition-all duration-200 hover:bg-neutral-800 shadow-xs flex items-center gap-2"
          >
            <span>Enter the Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
