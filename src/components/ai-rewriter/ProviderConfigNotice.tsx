"use client";

import React from "react";
import { KeyRound, ExternalLink, ShieldAlert } from "lucide-react";

export function ProviderConfigNotice() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-space-md text-on-surface space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded bg-surface-container border border-outline-variant/40 flex items-center justify-center text-secondary shrink-0 mt-0.5">
          <KeyRound className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-title-md text-body-sm font-semibold text-on-surface">
            OpenAI Responses API Provider Not Configured
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            ResumeLoops does not substitute fake simulated AI results. To enable genuine AI tailoring and rewriting
            powered by OpenAI, configure your API credentials in server environment variables.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-lg p-3.5 border border-outline-variant/30 space-y-2 text-xs font-mono">
        <p className="font-label-xs text-label-xs font-semibold uppercase tracking-wider text-on-surface-variant font-sans">
          Setup Steps:
        </p>
        <ol className="list-decimal list-inside space-y-1 font-sans text-on-surface text-body-sm">
          <li>
            Create a local environment file: <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code>
          </li>
          <li>
            Add your OpenAI API key:{" "}
            <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-xs">OPENAI_API_KEY=your_key_here</code>
          </li>
          <li>
            Optionally set model:{" "}
            <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-xs">OPENAI_MODEL=gpt-4o-mini</code>
          </li>
          <li>Restart your Next.js development server to load the new credentials.</li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-label-xs text-label-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-secondary" />
          <span>Never commit API keys to version control. .env.local is ignored in .gitignore.</span>
        </div>

        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Get API Key on OpenAI Platform <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
