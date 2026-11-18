import { z } from "zod";
import { jsonNoStore } from "@/lib/api-response";
import { createServerSupabase } from "@/lib/supabase/server";
import { accountAccessSchema, accountActionSchema, supporterConnectionSchema } from "@/lib/contracts/account";
import { boundedJson, sameOriginPost, siteOrigin } from "@/lib/auth/validation";
import { authDestination, readIdentity } from "@/lib/auth/access";

function respond(body: unknown, status = 200) {
  const response = jsonNoStore(body, status);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
function failure(error: { code?: string } | null) {
  if (error?.code === "PGRST202") return respond({ code: "roles-unavailable" }, 503);
  if (error?.code === "42501") return respond({ code: "access-denied" }, 403);
  if (error?.code === "P0002") return respond({ code: "not-found" }, 404);
  if (error?.code === "22023") return respond({ code: "invalid-input" }, 400);
  return respond({ code: "unconfirmed" }, 503);
}
export async function GET() {
  try {
    const client = await createServerSupabase();
    const identity = await readIdentity(client);
    if (!client || identity.status !== 200) return respond({ code: "session-required" }, identity.status === 401 ? 401 : 503);
    const access = await client.rpc("prohor_account_access");
    if (access.error) return failure(access.error);
    const account = accountAccessSchema.parse(access.data);
    if (account.userId !== identity.profile.user_id) return respond({ code: "unconfirmed" }, 503);
    const connections = await client.rpc("prohor_supporter_connections");
    if (connections.error) return failure(connections.error);
    return respond({ account, connections: z.array(supporterConnectionSchema).parse(connections.data) });
  } catch { return respond({ code: "unconfirmed" }, 503); }
}
export async function POST(request: Request) {
  const origin = siteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (!origin) return respond({ code: "unavailable" }, 503);
  if (!sameOriginPost(request, origin)) return respond({ code: "access-denied" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return respond({ code: "invalid-input" }, 400);
  let body: unknown;
  try { body = await boundedJson(request); } catch { return respond({ code: "invalid-input" }, 400); }
  const parsed = accountActionSchema.safeParse(body);
  if (!parsed.success) return respond({ code: "invalid-input" }, 400);
  try {
    const client = await createServerSupabase();
    const identity = await readIdentity(client);
    if (!client || identity.status !== 200) return respond({ code: "session-required" }, identity.status === 401 ? 401 : 503);
    const expected = request.headers.get("X-Prohor-Account");
    if (!expected || expected !== identity.profile.user_id) return respond({ code: "account-changed" }, 409);
    const action = parsed.data;
    let result;
    switch (action.action) {
      case "onboard":
        result = await client.rpc("prohor_save_role_profile", { p_name: action.profile.displayName,
          p_purposes: action.profile.purposes, p_organization: action.profile.organization,
          p_registration: action.profile.registrationNumber, p_details: action.profile.details });
        break;
      case "switch": result = await client.rpc("prohor_switch_workspace", { p_role: action.role }); break;
      case "invite":
        if (identity.profile.role !== "mother") return respond({ code: "access-denied" }, 403);
        result = await client.rpc("prohor_invite_supporter", { p_supporter: action.supporterId, p_scopes: action.scopes, p_expires: action.expiresAt });
        if (result.error) return failure(result.error);
        return respond({ invitation: z.strictObject({ id: z.uuid(), code: z.string().regex(/^[a-f0-9]{64}$/) }).parse(result.data) });
      case "accept":
        if (identity.profile.role !== "supporter") return respond({ code: "access-denied" }, 403);
        result = await client.rpc("prohor_accept_supporter", { p_code: action.code }); break;
      case "revoke": result = await client.rpc("prohor_revoke_supporter", { p_id: action.connectionId }); break;
    }
    if (result.error) return failure(result.error);
    if (action.action === "onboard" || action.action === "switch") {
      const account = accountAccessSchema.parse(result.data);
      if (account.userId !== identity.profile.user_id) return respond({ code: "unconfirmed" }, 503);
      return respond({ account, redirectTo: authDestination("/", account.activeRole) });
    }
    return respond({ code: "saved" });
  } catch { return respond({ code: "unconfirmed" }, 503); }
}
