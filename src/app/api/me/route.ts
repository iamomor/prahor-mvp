import { handleMeGet } from "@/lib/auth/handlers";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleMeGet(createServerSupabase);
}
