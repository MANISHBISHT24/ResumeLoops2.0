import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/lib/supabase/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const safeTarget = getSafeRedirectUrl(next, "/dashboard");

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${safeTarget}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${safeTarget}`);
        } else {
          return NextResponse.redirect(`${origin}${safeTarget}`);
        }
      }
    }
  }

  // If code exchange fails or no client, redirect to login with error parameter
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
