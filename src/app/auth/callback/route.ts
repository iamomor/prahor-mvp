import { NextRequest, NextResponse } from "next/server";
import { safeAuthReturnPath } from "@/lib/routes";
import { authDestination, readIdentity } from "@/lib/auth/access";
import { createServerSupabase } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/auth/validation";
import { jsonNoStore } from "@/lib/api-response";

function redirect(origin: string, path: string) {
  const response = NextResponse.redirect(new URL(path, origin));
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set("prohor-auth-next", "", { path: "/", httpOnly: true,
    sameSite: "lax", secure: origin.startsWith("https:"), maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const origin = siteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (!origin) return jsonNoStore({ code: "unavailable" }, 503);
  const code = request.nextUrl.searchParams.get("code");
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const next = safeAuthReturnPath(request.nextUrl.searchParams.get("next") ??
    request.cookies.get("prohor-auth-next")?.value ?? null);
  if (code || (token_hash && (type === "signup" || type === "email" || type === "magiclink" || type === "email_change"))) {
    try {
      const client = await createServerSupabase();
      if (client) {
        const { error } = code ? await client.auth.exchangeCodeForSession(code) :
          await client.auth.verifyOtp({ token_hash: token_hash!, type: type as "signup" | "email" | "magiclink" | "email_change" });
        if (!error) {
          const identity = await readIdentity(client);
          if (identity.status === 200) return redirect(origin, authDestination(next, identity.profile.role, identity.profile.onboarded));
          return redirect(origin, "/sign-in?error=profile-unavailable");
        }
      }
    } catch {
      // Do not expose authorization codes, session details or provider errors.
    }
  }
  return redirect(origin, `/sign-in?error=link-expired&next=${encodeURIComponent(next)}`);
}
