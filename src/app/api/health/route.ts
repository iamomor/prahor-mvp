import { jsonNoStore } from "@/lib/api-response";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const db = await createServerSupabase();
    if (!db) return jsonNoStore({ message: "Health records are not configured." }, 503);

    const { data: { user }, error } = await db.auth.getUser();
    if (error || !user) return jsonNoStore({ message: "Authentication required." }, 401);

    return jsonNoStore({ message: "Health-record persistence is not connected yet." }, 501);
  } catch {
    return jsonNoStore({ message: "Health records are temporarily unavailable." }, 503);
  }
}
