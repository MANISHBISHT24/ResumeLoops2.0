import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./config.ts";

/**
 * Creates a server-side Supabase client for Server Components, Route Handlers,
 * and Server Actions using @supabase/ssr.
 * Returns null if Supabase environment variables are missing or unconfigured.
 */
export async function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if called from Server Component where cookies are read-only
        }
      },
    },
  });
}
