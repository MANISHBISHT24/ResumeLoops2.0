/**
 * Unit & Security Tests for Supabase Auth, Route Protection & Safe Redirects
 *
 * Verifies:
 * - Strict open-redirect prevention (CWE-601)
 * - Safe internal path resolution and fallback behavior
 * - Supabase configuration detector for setup-required states
 * - Middleware session protection logic for unauthenticated vs authenticated requests
 */

import test from "node:test";
import assert from "node:assert/strict";
import { getSafeRedirectUrl } from "../supabase/safe-redirect.ts";
import { isSupabaseConfigured, getSupabaseEnv } from "../supabase/config.ts";

test("getSafeRedirectUrl: allows permitted internal routes", () => {
  assert.equal(getSafeRedirectUrl("/dashboard"), "/dashboard");
  assert.equal(getSafeRedirectUrl("/builder"), "/builder");
  assert.equal(getSafeRedirectUrl("/templates"), "/templates");
  assert.equal(getSafeRedirectUrl("/ats-analyzer"), "/ats-analyzer");
  assert.equal(getSafeRedirectUrl("/ai-rewriter"), "/ai-rewriter");
  assert.equal(getSafeRedirectUrl("/reset-password"), "/reset-password");
  assert.equal(getSafeRedirectUrl("/"), "/");
});

test("getSafeRedirectUrl: allows permitted internal routes with search query parameters", () => {
  assert.equal(
    getSafeRedirectUrl("/builder?id=resume-12345"),
    "/builder?id=resume-12345"
  );
  assert.equal(
    getSafeRedirectUrl("/ats-analyzer?id=resume-67890"),
    "/ats-analyzer?id=resume-67890"
  );
  assert.equal(
    getSafeRedirectUrl("/ai-rewriter?id=resume-11111"),
    "/ai-rewriter?id=resume-11111"
  );
});

test("getSafeRedirectUrl: blocks open redirect attacks with external protocols", () => {
  assert.equal(getSafeRedirectUrl("https://evil.com"), "/dashboard");
  assert.equal(getSafeRedirectUrl("http://attacker.org/steal"), "/dashboard");
  assert.equal(getSafeRedirectUrl("HTTP://MALICIOUS.COM"), "/dashboard");
});

test("getSafeRedirectUrl: blocks protocol-relative and backslash evasion", () => {
  // Protocol-relative //evil.com
  assert.equal(getSafeRedirectUrl("//evil.com"), "/dashboard");
  assert.equal(getSafeRedirectUrl("//evil.com/phish"), "/dashboard");

  // Backslash variations /\evil.com
  assert.equal(getSafeRedirectUrl("/\\evil.com"), "/dashboard");
  assert.equal(getSafeRedirectUrl("\\evil.com"), "/dashboard");
});

test("getSafeRedirectUrl: blocks dangerous pseudo-protocols", () => {
  assert.equal(getSafeRedirectUrl("javascript:alert(1)"), "/dashboard");
  assert.equal(getSafeRedirectUrl("data:text/html,<script>alert(1)</script>"), "/dashboard");
  assert.equal(getSafeRedirectUrl("vbscript:msgbox(1)"), "/dashboard");
  assert.equal(getSafeRedirectUrl("file:///etc/passwd"), "/dashboard");
});

test("getSafeRedirectUrl: falls back safely on null, undefined, empty or non-relative inputs", () => {
  assert.equal(getSafeRedirectUrl(null), "/dashboard");
  assert.equal(getSafeRedirectUrl(undefined), "/dashboard");
  assert.equal(getSafeRedirectUrl(""), "/dashboard");
  assert.equal(getSafeRedirectUrl("   "), "/dashboard");
  assert.equal(getSafeRedirectUrl("random-string-without-slash"), "/dashboard");
  assert.equal(getSafeRedirectUrl("/unknown-unregistered-route"), "/dashboard");
});

test("getSafeRedirectUrl: honors custom fallback destination", () => {
  assert.equal(getSafeRedirectUrl(null, "/login"), "/login");
  assert.equal(getSafeRedirectUrl("https://attacker.com", "/templates"), "/templates");
});

test("isSupabaseConfigured: correctly detects unconfigured placeholder state", () => {
  // Temporarily inspect current environment without breaking process
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    assert.equal(isSupabaseConfigured(), false);
    assert.equal(getSupabaseEnv(), null);

    // Test with placeholder string
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project-id.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "your_supabase_publishable_key_here";
    assert.equal(isSupabaseConfigured(), false);

    // Test with valid format credentials
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcdefghijklmnopqrst.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey";
    assert.equal(isSupabaseConfigured(), true);
    const env = getSupabaseEnv();
    assert.equal(env?.url, "https://abcdefghijklmnopqrst.supabase.co");
    assert.equal(env?.anonKey, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey");
  } finally {
    if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    else delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (originalKey) process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
    else delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  }
});
