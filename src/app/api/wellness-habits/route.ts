import { jsonNoStore } from "@/lib/api-response";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { createHabitRequestSchema } from "@/lib/contracts/shusthota-p1";
import { shusthotaMotherDb } from "@/lib/shusthota/server";

export async function GET() {
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to view habits." }, auth.status);
  const result = await auth.db.from("wellness_habits_active").select("id,label,icon,created_at").order("created_at", { ascending: false }).limit(100);
  if (result.error) return jsonNoStore({ message: "Habits are temporarily unavailable." }, 503);
  return jsonNoStore({ habits: result.data }, 200);
}

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 8192); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = createHabitRequestSchema.safeParse(raw);
  if (!parsed.success) return jsonNoStore({ message: "Check the habit name and symbol." }, 400);
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to create a habit." }, auth.status);
  const result = await auth.db.from("wellness_habits").insert({ label: parsed.data.label, icon: parsed.data.icon, retry_key: parsed.data.retryKey }).select("id").single();
  if (result.error?.code === "23505") {
    const prior = await auth.db.from("wellness_habits").select("id,label,icon").eq("retry_key", parsed.data.retryKey).maybeSingle();
    if (!prior.error && prior.data?.label === parsed.data.label && prior.data.icon === parsed.data.icon) return jsonNoStore({ saved: true, id: prior.data.id }, 201);
    return jsonNoStore({ message: "This habit could not be confirmed. Refresh the list before retrying." }, 409);
  }
  if (result.error) return jsonNoStore({ message: "The habit could not be created." }, result.error.code === "42501" ? 403 : 503);
  return jsonNoStore({ saved: true, id: result.data.id }, 201);
}
