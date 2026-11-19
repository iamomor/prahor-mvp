import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createWellnessEntryRequestSchema } from "@/lib/contracts/wellness";

// Shusthota check-ins. Owner-only via RLS (mvp_private_is_mother); diary lives at /api/diary.
async function motherDb() {
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (identity.status !== 200) return { status: identity.status, db: null };
  if (identity.profile.role !== "mother" || !db) return { status: 403, db: null };
  return { status: 200, db };
}

export async function GET() {
  const auth = await motherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to view check-ins." }, auth.status);
  const result = await auth.db.from("wellness_entries")
    .select("id,occurred_at,mood,energy,activity_note,rest_note,created_at")
    .order("occurred_at", { ascending: false }).limit(100);
  if (result.error) return jsonNoStore({ message: "Check-ins are unavailable. Try again." }, 503);
  return jsonNoStore({ entries: result.data }, 200);
}

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 8192); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = createWellnessEntryRequestSchema.safeParse(raw);
  if (!parsed.success || Date.parse(parsed.data.occurredAt) > Date.now() + 60_000)
    return jsonNoStore({ message: "Choose at least one field and a time that is not in the future." }, 400);
  const auth = await motherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to save a check-in." }, auth.status);
  const { occurredAt, mood, energy, activityNote, restNote } = parsed.data;
  const result = await auth.db.from("wellness_entries")
    .insert({ occurred_at: occurredAt, mood, energy, activity_note: activityNote, rest_note: restNote })
    .select("id").single();
  if (result.error) {
    const status = result.error.code === "42501" ? 403 : result.error.code === "23514" ? 400 : 503;
    return jsonNoStore({ message: status === 403 ? "Check-ins are available to confirmed mother accounts." : status === 400 ? "Check the values and try again." : "Saving is unavailable. Your entry was not saved." }, status);
  }
  return jsonNoStore({ saved: true, id: result.data.id }, 201);
}
