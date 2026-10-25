import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/lib/supabase/safe-redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const safeTarget = getSafeRedirectUrl(
    next,
    type === "recovery" ? "/reset-password" : "/login?verified=1"
  );

  if (token_hash && type) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        return NextResponse.redirect(new URL(safeTarget, request.url));
      }
    }
  }

  // Verification failure
  return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
}
