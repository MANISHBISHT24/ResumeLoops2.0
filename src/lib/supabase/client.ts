import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config.ts";

/**
 * Creates a browser-side Supabase client using @supabase/ssr.
 * Returns null if Supabase credentials are missing or unconfigured.
 */
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  return createBrowserClient(env.url, env.anonKey);
}
