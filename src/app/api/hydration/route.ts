import { jsonNoStore } from "@/lib/api-response";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { hydrationGetQuerySchema, hydrationRequestSchema } from "@/lib/contracts/shusthota-p1";
import { futureTimestamp, shusthotaMotherDb } from "@/lib/shusthota/server";

function dhakaDayBounds() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "2000";
  const start = Date.parse(`${get("year")}-${get("month")}-${get("day")}T00:00:00+06:00`);
  return { start: new Date(start).toISOString(), end: new Date(start + 86_400_000).toISOString() };
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  if (searchParams.getAll("scope").length > 1) return jsonNoStore({ message: "Use the supported hydration history filter." }, 400);
  const queryParameters = Object.fromEntries(searchParams.entries());
  const parsedQuery = hydrationGetQuerySchema.safeParse(queryParameters);
  if (!parsedQuery.success) return jsonNoStore({ message: "Use the supported hydration history filter." }, 400);
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to view hydration entries." }, auth.status);
  const scope = parsedQuery.data.scope;
  let dbQuery = auth.db.from("hydration_entries").select("id,amount_ml,occurred_at,created_at");
  if (scope !== "history") {
    const bounds = dhakaDayBounds();
    dbQuery = dbQuery.gte("occurred_at", bounds.start).lt("occurred_at", bounds.end);
  }
  const result = await dbQuery.order("occurred_at", { ascending: false }).limit(100);
  if (result.error) return jsonNoStore({ message: "Hydration entries are temporarily unavailable." }, 503);
  return jsonNoStore({ entries: result.data }, 200);
}

export async function POST(request: Request) {
  if (!sameOriginPost(request, siteOrigin(process.env.NEXT_PUBLIC_SITE_URL))) return jsonNoStore({ message: "Request rejected." }, 403);
  let raw: unknown;
  try { raw = await boundedJson(request, 8192); } catch { return jsonNoStore({ message: "Invalid request." }, 400); }
  const parsed = hydrationRequestSchema.safeParse(raw);
  if (!parsed.success || futureTimestamp(parsed.data.occurredAt)) return jsonNoStore({ message: "Check the amount and timestamp." }, 400);
  const auth = await shusthotaMotherDb();
  if (!auth.db) return jsonNoStore({ message: "Sign in as a mother to add hydration." }, auth.status);
  const input = parsed.data;
  const result = await auth.db.from("hydration_entries").insert({ amount_ml: input.amountMl, occurred_at: input.occurredAt, retry_key: input.retryKey }).select("id").single();
  if (result.error?.code === "23505") {
    const prior = await auth.db.from("hydration_entries").select("id,amount_ml,occurred_at").eq("retry_key", input.retryKey).maybeSingle();
    if (!prior.error && prior.data?.amount_ml === input.amountMl && Date.parse(prior.data.occurred_at) === Date.parse(input.occurredAt))
      return jsonNoStore({ saved: true, id: prior.data.id }, 201);
    return jsonNoStore({ message: "This entry could not be confirmed. Check your history." }, 409);
  }
  if (result.error) return jsonNoStore({ message: result.error.code === "42501" ? "Hydration is available to confirmed mother accounts." : "Saving is temporarily unavailable." }, result.error.code === "42501" ? 403 : 503);
  return jsonNoStore({ saved: true, id: result.data.id }, 201);
}
