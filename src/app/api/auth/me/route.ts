import { handleIdentityGet } from "@/lib/auth/handlers";
import { createServerSupabase } from "@/lib/supabase/server";
import { jsonNoStore } from "@/lib/api-response";

export async function GET() {
  try { return await handleIdentityGet(await createServerSupabase()); }
  catch { return jsonNoStore({ code: "unavailable" }, 503); }
}
