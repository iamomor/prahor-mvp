import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createDiaryEntryRequestSchema } from "@/lib/contracts/wellness";

// Private diary: owner-only by RLS, never in consent scopes, AI context or provider projections.
async function motherDb() {
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (identity.status !== 200) return { status: identity.status, db: null };
  if (identity.profile.role !== "mother" || !db) return { status: 403, db: null };
  return { status: 200, db };
}

export async function GET() {
  const auth = await motherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to open your diary." }, auth.status);
  const result = await auth.db.from("wellness_diary_entries")
    .select("id,text,occurred_at,privacy,created_at")
    .order("occurred_at", { ascending: false }).limit(100);
  if (result.error) return jsonNoStore({ message: "Your diary is unavailable. Try again." }, 503);
  return jsonNoStore({ entries: result.data }, 200);
}

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 48_000); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = createDiaryEntryRequestSchema.safeParse(raw);
  if (!parsed.success || Date.parse(parsed.data.occurredAt) > Date.now() + 60_000)
    return jsonNoStore({ message: "Write 1 to 10,000 characters and use a time that is not in the future." }, 400);
  const auth = await motherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to save your diary." }, auth.status);
  const result = await auth.db.from("wellness_diary_entries")
    .insert({ text: parsed.data.text, occurred_at: parsed.data.occurredAt })
    .select("id").single();
  if (result.error) {
    const status = result.error.code === "42501" ? 403 : result.error.code === "23514" ? 400 : 503;
    return jsonNoStore({ message: status === 403 ? "The diary is available to confirmed mother accounts." : status === 400 ? "Check the entry and try again." : "Saving is unavailable. Your entry was not saved." }, status);
  }
  return jsonNoStore({ saved: true, id: result.data.id }, 201);
}
