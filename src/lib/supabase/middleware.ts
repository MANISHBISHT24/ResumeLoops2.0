import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "./config.ts";
import { getSafeRedirectUrl } from "./safe-redirect.ts";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/builder",
  "/templates",
  "/ats-analyzer",
  "/ai-rewriter",
];

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Check whether target route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // If Supabase is not configured yet, allow public access so user can view setup instructions
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const env = getSupabaseEnv();
  if (!env) {
    return supabaseResponse;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If unauthenticated user attempts to access protected route, redirect to /login with safe next param
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const fullTarget = pathname + (request.nextUrl.search || "");
    const safeNext = getSafeRedirectUrl(fullTarget, "/dashboard");
    loginUrl.searchParams.set("next", safeNext);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user visits login or signup, redirect to permitted destination
  if (isAuthPage && user) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const target = getSafeRedirectUrl(nextParam, "/dashboard");
    const redirectUrl = new URL(target, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
