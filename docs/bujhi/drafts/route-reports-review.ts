// DRAFT (not compiled). Save as src/app/api/reports/reviews/route.ts  -> POST /api/reports/reviews
// Register it in src/lib/contracts/current-api.ts, otherwise tests/contracts/api-registry.spec.ts fails.
import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const decision = z.strictObject({
  fieldId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  decision: z.enum(["accepted", "corrected", "rejected"]),
  kind: z.literal("hemoglobin").optional(),
  value: z.string().regex(/^\d{1,3}(\.\d{1,2})?$/).optional(),
  unit: z.literal("g/dL").optional(),
  observedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rawLabel: z.string().max(120), rawValue: z.string().max(40), rawUnit: z.string().max(20),
});
const body = z.strictObject({
  reportId: z.string().uuid(), pregnancyId: z.string().uuid(),
  engine: z.string().max(100), engineVersion: z.string().max(100),
  sourceSha256: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
  decisions: z.array(decision).min(1).max(20),
  reviewedByMother: z.literal(true),
});

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 16384); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = body.safeParse(raw);
  if (!parsed.success) return jsonNoStore({ message: "Invalid request." }, 400);
  const b = parsed.data;
  const db = await createServerSupabase();
  if (!db) return jsonNoStore({ message: "Reports are not configured." }, 503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return jsonNoStore({ message: "Authentication required." }, 401);
  const { data, error } = await db.rpc("bujhi_save_review", {
    p_report_id: b.reportId, p_pregnancy_id: b.pregnancyId, p_engine: b.engine, p_engine_version: b.engineVersion,
    p_source_sha256: b.sourceSha256, p_decisions: b.decisions,
  });
  if (error) {
    const status = error.code === "40001" ? 409 : error.code === "42501" ? 403 : error.code === "22023" ? 400 : 503;
    return jsonNoStore({ message: "Review was not saved." }, status);
  }
  return jsonNoStore({ review: { id: data.id, revision: data.revision, status: data.status } }, 200);
}
