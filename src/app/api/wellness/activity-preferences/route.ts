import { jsonNoStore } from "@/lib/api-response";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { activityPreferencesRequestSchema } from "@/lib/contracts/shusthota-p1";
import { futureTimestamp, shusthotaMotherDb } from "@/lib/shusthota/server";

export async function GET() {
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to view activity preferences." }, auth.status);
  const result = await auth.db.from("wellness_activity_preferences").select("id,preferences,occurred_at,created_at")
    .order("occurred_at", { ascending: false }).limit(100);
  if (result.error) return jsonNoStore({ message: "Activity preferences are temporarily unavailable." }, 503);
  return jsonNoStore({ entries: result.data }, 200);
}

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 8192); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = activityPreferencesRequestSchema.safeParse(raw);
  if (!parsed.success || futureTimestamp(parsed.data.occurredAt)) return jsonNoStore({ message: "Choose supported preferences and a valid time." }, 400);
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to save activity preferences." }, auth.status);
  const result = await auth.db.from("wellness_activity_preferences").insert({ preferences: parsed.data.preferences, occurred_at: parsed.data.occurredAt, retry_key: parsed.data.retryKey }).select("id").single();
  if (result.error?.code === "23505") return jsonNoStore({ message: "This preference update was already received." }, 409);
  if (result.error) return jsonNoStore({ message: result.error.code === "42501" ? "Preferences are available to confirmed mother accounts." : "Activity preferences could not be saved." }, result.error.code === "42501" ? 403 : 503);
  return jsonNoStore({ saved: true, id: result.data.id }, 201);
}
