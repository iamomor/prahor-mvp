import type { CookieOptions } from "@supabase/ssr";

/** Auth uses server routes, so tokens need not be accessible to browser JS. */
export function authCookieOptions(): CookieOptions {
  return { path: "/", sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" };
}
