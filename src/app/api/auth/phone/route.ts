import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const phone = z.string().regex(/^\+8801[3-9][0-9]{8}$/);
const requestSchema = z.strictObject({ action: z.literal("request"), phone, assistedBy: z.uuid().optional() });
const verifySchema = z.strictObject({ action: z.literal("verify"), phone, token: z.string().regex(/^[0-9]{6,8}$/) });

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ code: "request-denied" }, 403);
  let input: unknown;
  try { input = await boundedJson(request, 1024); } catch { return jsonNoStore({ code: "invalid-input" }, 400); }
  const parsed = z.union([requestSchema, verifySchema]).safeParse(input);
  if (!parsed.success) return jsonNoStore({ code: "invalid-input" }, 400);
  const db = await createServerSupabase();
  if (!db) return jsonNoStore({ code: "auth-unconfigured" }, 503);
  if (parsed.data.action === "request") {
    // A helper may explain these steps, but this endpoint never authenticates the helper as the mother.
    if (parsed.data.assistedBy) return jsonNoStore({ code: "assisted-registration-unavailable" }, 501);
    const { error } = await db.auth.signInWithOtp({ phone: parsed.data.phone, options: { shouldCreateUser: true } });
    if (error) return jsonNoStore({ code: error.status === 429 ? "rate-limited" : "otp-unavailable" }, error.status === 429 ? 429 : 503);
    return jsonNoStore({ code: "otp-request-accepted", delivered: false }, 202);
  }
  const { data, error } = await db.auth.verifyOtp({ phone: parsed.data.phone, token: parsed.data.token, type: "sms" });
  if (error || !data.user || !data.session) return jsonNoStore({ code: "verification-failed" }, 400);
  return jsonNoStore({ code: "phone-verified", accountId: data.user.id, onboardingRequired: true }, 200);
}
