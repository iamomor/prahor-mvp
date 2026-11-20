import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.getAll("facilityId");
  if (!ids.length || ids.length > 20 || ids.some(id => !z.string().regex(/^(dghs\/|(?:node|way|relation)\/)[A-Za-z0-9_-]{1,80}$/).safeParse(id).success))
    return jsonNoStore({ code: "invalid-facility" }, 400);
  const db = await createServerSupabase();
  if (!db) return jsonNoStore({ code: "unavailable" }, 503);
  const result = await db.from("poth_access_evidence").select("facility_id,attribute,value,verification_status,verification_source,verified_by,verified_on,updated_at").in("facility_id", ids).eq("verification_status", "verified");
  if (result.error) return jsonNoStore({ code: "unavailable" }, 503);
  return jsonNoStore({ claims: result.data, absentClaims: "unknown" }, 200);
}
