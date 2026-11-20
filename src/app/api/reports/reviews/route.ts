import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const schema = z.strictObject({
  reportId: z.uuid(), pregnancyId: z.uuid(), fieldId: z.uuid(),
  sourceSha256: z.string().regex(/^[0-9a-f]{64}$/),
  rawLabel: z.string().trim().min(1).max(120), rawValue: z.string().max(40),
  rawUnit: z.string().max(20), reviewedValue: z.string().max(40),
  reviewedUnit: z.string().max(20), observedOn: z.iso.date(),
  decision: z.enum(["verified", "pending", "rejected"]),
});

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ code: "request-denied" }, 403);
  let input: unknown;
  try { input = await boundedJson(request, 4096); } catch { return jsonNoStore({ code: "invalid-input" }, 400); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return jsonNoStore({ code: "invalid-input" }, 400);
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (identity.status !== 200) return jsonNoStore({ code: "session-required" }, identity.status);
  if (!db || identity.profile.role !== "mother") return jsonNoStore({ code: "access-denied" }, 403);
  const value = parsed.data;
  const result = await db.rpc("bujhi_record_field_decision", {
    p_report_id: value.reportId, p_pregnancy_id: value.pregnancyId, p_field_id: value.fieldId,
    p_source_sha256: value.sourceSha256, p_raw_label: value.rawLabel,
    p_raw_value: value.rawValue, p_raw_unit: value.rawUnit,
    p_reviewed_value: value.reviewedValue, p_reviewed_unit: value.reviewedUnit,
    p_observed_on: value.observedOn, p_decision: value.decision,
  });
  if (result.error) {
    const status = result.error.code === "42501" ? 403 : result.error.code === "PT409" ? 409 : result.error.code === "22023" ? 400 : 503;
    return jsonNoStore({ code: status === 403 ? "access-denied" : status === 409 ? "review-conflict" : status === 400 ? "invalid-review" : "review-unavailable" }, status);
  }
  return jsonNoStore({ reviewId: result.data, fieldId: value.fieldId, decision: value.decision, savedToAccount: false }, 201);
}
