import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions } from "@/lib/auth/cookies";
import { readIdentity, signInPath, workspaceRole } from "@/lib/auth/access";
import { siteOrigin } from "@/lib/auth/validation";
import { publicSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const requiredRole = workspaceRole(request.nextUrl.pathname);
  const accountRoute = request.nextUrl.pathname === "/account" || request.nextUrl.pathname.startsWith("/account/");
  const privateRoute = Boolean(requiredRole || accountRoute);
  const config = publicSupabaseConfig();
  const origin = siteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  function finish(result: NextResponse) {
    for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
    // Refresh can set account cookies on public pages too. Keep those responses
    // out of shared caches, including requests made during an Auth/config outage.
    const carriesSession = request.cookies.getAll().some(({ name }) => name.startsWith("sb-")) || response.cookies.getAll().length > 0;
    if (carriesSession || privateRoute || ["/sign-in", "/sign-up"].includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/auth/") || request.nextUrl.pathname.startsWith("/api/auth/")) {
      result.headers.set("Cache-Control", "private, no-store");
      result.headers.set("Referrer-Policy", "no-referrer");
    }
    return result;
  }
  if (!config || (privateRoute && !origin)) return finish(privateRoute ? NextResponse.json({ code: "auth-unavailable" }, { status: 503 }) : response);
  const { url, key } = config;
  const client = createServerClient(url, key, {
    cookieOptions: authCookieOptions(),
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const previous = response.cookies.getAll();
        response = NextResponse.next({ request });
        previous.forEach((cookie) => response.cookies.set(cookie));
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  if (privateRoute) {
    const identity = await readIdentity(client);
    if (identity.status === 401) return finish(NextResponse.redirect(new URL(signInPath(request.nextUrl.pathname + request.nextUrl.search), origin!)));
    if (identity.status === 503) return finish(NextResponse.json({ code: "auth-unavailable" }, { status: 503 }));
    if (requiredRole && identity.profile.role !== requiredRole) return finish(NextResponse.redirect(new URL("/account", origin!)));
  } else if (request.cookies.getAll().some(({ name }) => name.startsWith("sb-"))) {
    try { await client.auth.getUser(); } catch { /* Public pages stay public during Auth outages. */ }
  }
  return finish(response);
}
