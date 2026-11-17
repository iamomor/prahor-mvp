import { handleAuthPost, type AuthAction } from "@/lib/auth/handlers";
import { createServerSupabase } from "@/lib/supabase/server";
import { jsonNoStore } from "@/lib/api-response";

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!["sign-in", "sign-up", "email-link", "sign-out"].includes(action)) return jsonNoStore({ code: "not-found" }, 404);
  return handleAuthPost(request, action as AuthAction, {
    createClient: createServerSupabase, siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
