/**
 * Safe Redirect Destination Validation
 * Protects against Open Redirect vulnerabilities (CWE-601).
 */

const ALLOWED_INTERNAL_ROUTES = [
  "/",
  "/dashboard",
  "/builder",
  "/templates",
  "/ats-analyzer",
  "/ai-rewriter",
  "/reset-password",
];

/**
 * Validates a redirect target path.
 * Returns the normalized path if safe, or a fallback route if unsafe/external.
 */
export function getSafeRedirectUrl(
  candidate: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!candidate || typeof candidate !== "string") {
    return fallback;
  }

  const trimmed = candidate.trim();

  // Must begin with a single slash, not protocol-relative (//) or backslash (/\)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Reject dangerous schemes embedded in any form
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("javascript:") ||
    lower.includes("data:") ||
    lower.includes("vbscript:") ||
    lower.includes("file:") ||
    lower.includes("http:") ||
    lower.includes("https:")
  ) {
    return fallback;
  }

  // Exact root path
  if (trimmed === "/") {
    return "/";
  }

  // Ensure it matches one of our recognized route namespaces
  const isRecognized = ALLOWED_INTERNAL_ROUTES.some((route) => {
    if (route === "/") return false;
    return (
      trimmed === route ||
      trimmed.startsWith(`${route}/`) ||
      trimmed.startsWith(`${route}?`)
    );
  });

  return isRecognized ? trimmed : fallback;
}
