import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.strictObject({
  facilityId: z.string().regex(/^(dghs\/|(?:node|way|relation)\/)[A-Za-z0-9_-]{1,80}$/),
  attribute: z.enum(["wheelchair", "accessibleToilet", "hearingLoop"]),
  value: z.enum(["reported_available", "reported_limited", "reported_unavailable", "unknown"]),
  status: z.enum(["verified", "withdrawn"]),
  source: z.string().trim().max(300),
});

// Reviewer membership is checked by the database (poth_access_reviewers); this route never trusts a client-sent role.
export async function GET() {
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (!db || identity.status !== 200) return jsonNoStore({ reviewer: false }, 200);
  const row = await db.from("poth_access_reviewers").select("user_id").eq("user_id", identity.profile.user_id).maybeSingle();
  return jsonNoStore({ reviewer: !row.error && row.data !== null }, 200);
}

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ code: "request-denied" }, 403);
  let input: unknown;
  try { input = await boundedJson(request, 2048); } catch { return jsonNoStore({ code: "invalid-input" }, 400); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return jsonNoStore({ code: "invalid-input" }, 400);
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (!db || identity.status !== 200) return jsonNoStore({ code: "session-required" }, identity.status === 200 ? 503 : identity.status);
  const v = parsed.data;
  const result = await db.rpc("poth_set_access_claim", { p_facility_id: v.facilityId, p_attribute: v.attribute, p_value: v.value, p_status: v.status, p_source: v.source });
  if (result.error) {
    const status = result.error.code === "42501" ? 403 : result.error.code === "22023" ? 400 : 503;
    return jsonNoStore({ code: status === 403 ? "access-denied" : status === 400 ? "invalid-claim" : "unavailable" }, status);
  }
  return jsonNoStore({ code: "saved" }, 200);
}
