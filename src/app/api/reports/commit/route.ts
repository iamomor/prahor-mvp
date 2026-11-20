import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const bujhiCommitSchema = z.strictObject({
  reportId: z.string().uuid(),
  pregnancyId: z.string().uuid(),
  sourceSha256: z.string().regex(/^[0-9a-f]{64}$/),
  rawLabel: z.string().min(1).max(120),
  rawValue: z.string().max(40),
  rawUnit: z.string().max(20),
  reviewedValue: z.string().regex(/^[0-9]{1,3}(\.[0-9]{1,2})?$/),
  reviewedUnit: z.literal("g/dL"),
  observedOn: z.iso.date(),
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
  const result = await db.rpc("bujhi_commit_reviewed_hemoglobin", {
    p_report_id: data.reportId,
    p_pregnancy_id: data.pregnancyId,
    p_source_sha256: data.sourceSha256,
    p_raw_label: data.rawLabel,
    p_raw_value: data.rawValue,
    p_raw_unit: data.rawUnit,
    p_reviewed_value: data.reviewedValue,
    p_reviewed_unit: data.reviewedUnit,
    p_observed_on: data.observedOn,
  });
  if (result.error) {
    const status = result.error.code === "PT409" || result.error.code === "40001" ? 409 : result.error.code === "42501" ? 403 :
      ["22023", "22007", "22008"].includes(result.error.code) ? 400 : 503;
    return jsonNoStore({ message: "Report was not saved." }, status);
  }
  return jsonNoStore({ saved: true, observationId: result.data }, 200);
}
