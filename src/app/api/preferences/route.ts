import { handlePreferences } from "@/features/adapt/server/handlers";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const dependencies = { createClient: createServerSupabase, siteUrl: process.env.NEXT_PUBLIC_SITE_URL };
export function GET(request: Request) { return handlePreferences(request, dependencies); }
export function PATCH(request: Request) { return handlePreferences(request, dependencies); }
