import { NextRequest, NextResponse } from "next/server";
import { safeAuthReturnPath } from "@/lib/routes";
import { createServerSupabase } from "@/lib/supabase/server";

function redirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    try {
      const client = await createServerSupabase();
      if (client) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (!error) return redirect(request, safeAuthReturnPath(request.nextUrl.searchParams.get("next")));
      }
    } catch {
      // Do not expose authorization codes, session details or provider errors.
    }
  }
  // The current project has no /sign-in page. Return to its existing public entry.
  return redirect(request, "/?error=auth");
}
