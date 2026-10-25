/**
 * Supabase Environment & Configuration Helper
 * Validates presence and format of Supabase environment variables.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Checks whether Supabase environment variables are properly configured.
 * Validates against placeholders and empty strings.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return false;
  if (url.includes("your-project-id.supabase.co") || key.includes("your_supabase_publishable")) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Retrieves validated Supabase environment variables or null if unconfigured.
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  if (!isSupabaseConfigured()) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )!;

  return { url, anonKey };
}
