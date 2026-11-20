import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { readIdentity } from "@/lib/auth/access";
import { boundedJson, sameOriginRequest, siteOrigin } from "@/lib/auth/validation";
import { createServerSupabase } from "@/lib/supabase/server";

const channels = ["sms", "push"] as const;
const schema = z.strictObject({ channel: z.enum(channels), optedIn: z.boolean() });
// No SMS or push provider exists in this project, so `providerConfigured` is always false and no delivery state is ever reported.
const providers = { providerConfigured: false } as const;

export async function GET() {
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (!db || identity.status !== 200) return jsonNoStore({ code: "session-required" }, identity.status === 200 ? 503 : identity.status);
  const result = await db.from("notification_opt_ins").select("channel,opted_in,updated_at").eq("user_id", identity.profile.user_id);
  if (result.error) return jsonNoStore({ code: "unavailable" }, 503);
  return jsonNoStore({ ...providers, channels: channels.map(channel => {
    const row = result.data.find(item => item.channel === channel);
    return { channel, optedIn: row?.opted_in === true, updatedAt: row?.updated_at ?? null };
  }) }, 200);
}

export async function PUT(request: Request) {
  if (!sameOriginRequest(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ code: "request-denied" }, 403);
  let input: unknown;
  try { input = await boundedJson(request, 512); } catch { return jsonNoStore({ code: "invalid-input" }, 400); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return jsonNoStore({ code: "invalid-input" }, 400);
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (!db || identity.status !== 200) return jsonNoStore({ code: "session-required" }, identity.status === 200 ? 503 : identity.status);
  const result = await db.from("notification_opt_ins").upsert({ user_id: identity.profile.user_id, channel: parsed.data.channel, opted_in: parsed.data.optedIn, updated_at: new Date().toISOString() });
  if (result.error) return jsonNoStore({ code: "unavailable" }, 503);
  return jsonNoStore({ channel: parsed.data.channel, optedIn: parsed.data.optedIn, ...providers }, 200);
}
