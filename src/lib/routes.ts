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
