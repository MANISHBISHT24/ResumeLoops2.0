"use client";

import React from "react";
import { AlertTriangle, KeyRound, ExternalLink, Terminal } from "lucide-react";

export function SupabaseSetupBanner() {
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-left max-w-xl mx-auto shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Supabase Configuration Required (Phase 3J)
            </h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
              Real cloud authentication and PostgreSQL persistence require active Supabase credentials in your local environment.
            </p>
          </div>

          <div className="bg-surface-container-lowest/80 rounded-xl p-3.5 border border-amber-500/20 space-y-2 font-mono text-xs text-on-surface">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant font-sans">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>Configure your .env.local:</span>
            </div>
            <div className="space-y-1 text-[11px] bg-black/5 dark:bg-white/5 p-2 rounded-lg break-all">
              <div>NEXT_PUBLIC_SUPABASE_URL=https://&lt;project&gt;.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=&lt;publishable_or_anon_key&gt;</div>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-on-surface-variant">•</span>
            <span className="text-on-surface-variant">See .env.example for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
