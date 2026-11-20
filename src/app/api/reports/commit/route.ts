import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const bujhiCommitSchema = z.strictObject({
  reviewId: z.uuid(),
  fieldId: z.uuid(),
  confirmSave: z.literal(true),
});

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) {
    return jsonNoStore({ message: "Request rejected." }, 403);
  }
  let raw: unknown;
  try { raw = await boundedJson(request, 2048); }
  catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = bujhiCommitSchema.safeParse(raw);
  if (!parsed.success) return jsonNoStore({ message: "Invalid report review." }, 400);
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (identity.status !== 200) return jsonNoStore({ message: "Sign in to save a report." }, identity.status);
  if (identity.profile.role !== "mother" || !db) return jsonNoStore({ message: "Account access denied." }, 403);
  const data = parsed.data;
  const result = await db.rpc("bujhi_commit_verified_field", {
    p_review_id: data.reviewId, p_field_id: data.fieldId,
  });
  if (result.error) {
    const status = result.error.code === "PT409" || result.error.code === "40001" ? 409 : result.error.code === "42501" ? 403 :
      ["22023", "22007", "22008"].includes(result.error.code) ? 400 : 503;
    return jsonNoStore({ message: "Report was not saved." }, status);
  }
  return jsonNoStore({ saved: true, observationId: result.data }, 200);
}
