// DRAFT (not compiled). Save as src/app/api/reports/commit/route.ts -> POST /api/reports/commit
import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const body = z.strictObject({ reviewId: z.string().uuid(), expectedReviewRevision: z.number().int().positive(), confirmSave: z.literal(true) });

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 2048); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = body.safeParse(raw);
  if (!parsed.success) return jsonNoStore({ message: "Invalid request." }, 400);
  const db = await createServerSupabase();
  if (!db) return jsonNoStore({ message: "Reports are not configured." }, 503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return jsonNoStore({ message: "Authentication required." }, 401);
  const { data, error } = await db.rpc("bujhi_commit_review", { p_review_id: parsed.data.reviewId, p_expected_revision: parsed.data.expectedReviewRevision });
  if (error) return jsonNoStore({ message: "Not saved." }, error.code === "40001" ? 409 : error.code === "42501" ? 404 : 503);
  return jsonNoStore({ saved: (data ?? []).length, observations: data }, 200);
}
