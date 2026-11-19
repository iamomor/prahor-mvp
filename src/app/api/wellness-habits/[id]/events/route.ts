import { jsonNoStore } from "@/lib/api-response";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { habitEventRequestSchema } from "@/lib/contracts/shusthota-p1";
import { idSchema } from "@/lib/contracts/common";
import { futureTimestamp, shusthotaMotherDb } from "@/lib/shusthota/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return jsonNoStore({ message: "Habit not found." }, 404);
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to view habit activity." }, auth.status);
  const owned = await auth.db.from("wellness_habits").select("id").eq("id", id).maybeSingle();
  if (owned.error) return jsonNoStore({ message: "Habit activity is unavailable." }, 503);
  if (!owned.data) return jsonNoStore({ message: "Habit not found." }, 404);
  const result = await auth.db.from("wellness_habit_events").select("id,habit_id,event_type,related_event_id,occurred_at,created_at")
    .eq("habit_id", id).order("occurred_at", { ascending: false }).limit(100);
  if (result.error) return jsonNoStore({ message: "Habit activity is unavailable." }, 503);
  return jsonNoStore({ entries: result.data }, 200);
}

export async function POST(request: Request, context: Context) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return jsonNoStore({ message: "Habit not found." }, 404);
  let raw: unknown;
  try { raw = await boundedJson(request, 8192); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = habitEventRequestSchema.safeParse(raw);
  if (!parsed.success || futureTimestamp(parsed.data.occurredAt)) return jsonNoStore({ message: "Check the habit activity and time." }, 400);
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to record habit activity." }, auth.status);
  const active = await auth.db.from("wellness_habits_active").select("id").eq("id", id).maybeSingle();
  if (active.error) return jsonNoStore({ message: "Habit activity is unavailable." }, 503);
  if (!active.data) return jsonNoStore({ message: "Habit not found or no longer active." }, 404);
  if (parsed.data.eventType === "completion_undone") {
    const related = await auth.db.from("wellness_habit_events").select("id,habit_id,event_type").eq("id", parsed.data.relatedEventId).maybeSingle();
    if (related.error) return jsonNoStore({ message: "Habit activity is unavailable." }, 503);
    if (!related.data || related.data.habit_id !== id || related.data.event_type !== "completed") return jsonNoStore({ message: "Choose a completion that belongs to this habit." }, 400);
  }
  const result = await auth.db.from("wellness_habit_events").insert({
    habit_id: id, event_type: parsed.data.eventType,
    related_event_id: parsed.data.eventType === "completion_undone" ? parsed.data.relatedEventId : null,
    occurred_at: parsed.data.occurredAt, retry_key: parsed.data.retryKey,
  }).select("id").single();
  if (result.error) return jsonNoStore({ message: result.error.code === "42501" ? "Habit activity is available to confirmed mother accounts." : "Habit activity could not be recorded." }, result.error.code === "42501" ? 403 : result.error.code === "23503" ? 400 : 503);
  return jsonNoStore({ saved: true, id: result.data.id }, 201);
}
