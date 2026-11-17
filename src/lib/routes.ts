export const PUBLIC_MARKETING_ROUTES = [
  "/",
  "/about",
  "/how-it-works",
  "/features",
  "/accessibility",
  "/for-mothers",
  "/for-providers",
  "/trust",
  "/faq",
  "/ask",
] as const;

export function isPublicMarketingRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (PUBLIC_MARKETING_ROUTES.includes(pathname as (typeof PUBLIC_MARKETING_ROUTES)[number])) {
    return true;
  }
  return (
    pathname.startsWith("/features/") ||
    pathname.startsWith("/about/") ||
    pathname.startsWith("/how-it-works/")
  );
}

/** Normalize callback navigation without allowing protocol-relative or backslash URLs. */
export function safeAuthReturnPath(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  if (Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return "/";
  const base = "https://prohor.invalid";
  try {
    const target = new URL(value, base);
    if (target.origin !== base || target.pathname.startsWith("//")) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}
