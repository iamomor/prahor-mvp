import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authDestination, readIdentity, workspaceRole } from "../../src/lib/auth/access";
import { handleAuthPost, handleIdentityGet, type AuthAction } from "../../src/lib/auth/handlers";
import { authCookieOptions } from "../../src/lib/auth/cookies";
import { signUpSchema, siteOrigin } from "../../src/lib/auth/validation";
import { isPublicSupabaseKey } from "../../src/lib/supabase/config";
import { updateSession } from "../../src/lib/supabase/proxy";
import { NextRequest } from "next/server";

const id = "d2000000-0000-4000-8000-000000000001";
function fixture({ role = "mother", expired = false, missing = false, foreign = false,
  duplicate = false, invalid = false, signoutFailure = false, confirmation = true, unverified = false } = {}) {
  const calls: Array<{ method: string; args: unknown }> = [];
  const record = (method: string, args: unknown) => { calls.push({ method, args }); };
  const client = {
    auth: {
      getUser: async () => ({ data: { user: expired ? null : { id, email: "ayesha-rls@example.invalid", email_confirmed_at: unverified ? null : "2026-11-16T00:00:00Z", user_metadata: { role: "provider" } } }, error: expired ? { status: 401 } : null }),
      signUp: async (args: unknown) => { record("signUp", args); return { data: { session: confirmation ? null : {} }, error: duplicate ? { code: "user_already_exists" } : null }; },
      signInWithPassword: async (args: unknown) => { record("signIn", args); return { error: invalid ? { code: "invalid_credentials", message: "sensitive provider error" } : null }; },
      signInWithOtp: async (args: unknown) => { record("otp", args); return { error: null }; },
      signOut: async (args: unknown) => { record("signOut", args); return { error: signoutFailure ? {} : null }; },
    },
    from: (table: string) => {
      record("from", table);
      return { select: (columns: string) => {
        record("select", columns);
        return { eq: (column: string, value: string) => {
          record("eq", { column, value });
          return { maybeSingle: async () => ({ error: null, data: missing ? null :
            { user_id: foreign ? "other-user" : id, display_name: "Synthetic Ayesha", role } }) };
        } };
      } };
    },
  } as unknown as SupabaseClient;
  return { client, calls };
}
function request(action: AuthAction, data: unknown = {}, origin = "http://localhost:3000") {
  return new Request(`http://localhost:3000/auth/${action}`, {
    method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(data),
  });
}
const credentials = { email: "ayesha-rls@example.invalid", password: "Synthetic-passphrase-123!", next: "/app" };
function post(action: AuthAction, data = credentials, setup = fixture(), origin?: string) {
  return handleAuthPost(request(action, data, origin), action, { createClient: async () => setup.client, siteUrl: "http://localhost:3000" });
}

test("registration validates credentials and rejects role/user ID injection", async () => {
  for (const data of [{ ...credentials, role: "provider" }, { ...credentials, user_id: id },
    { ...credentials, password: "short" }, { ...credentials, email: "invalid" }]) {
    const setup = fixture();
    const response = await post("sign-up", data, setup);
    expect(response.status).toBe(400);
    expect(setup.calls).toHaveLength(0);
  }
  expect(signUpSchema.parse({ ...credentials, email: " AYESHA-RLS@example.invalid " }).email).toBe(credentials.email);
});

test("oversized and malformed request bodies are rejected before Auth calls", async () => {
  const setup = fixture();
  const dependencies = { createClient: async () => setup.client, siteUrl: "http://localhost:3000" };
  for (const body of ["{broken", JSON.stringify({ ...credentials, password: "x".repeat(9000) })]) {
    const response = await handleAuthPost(new Request("http://localhost:3000/auth/sign-in", {
      method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body,
    }), "sign-in", dependencies);
    expect(response.status).toBe(400);
  }
  expect(setup.calls).toHaveLength(0);
});

test("registration uses Auth trigger provisioning and waits for email confirmation", async () => {
  const setup = fixture();
  const response = await post("sign-up", credentials, setup);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ code: "check-email" });
  expect(setup.calls).toEqual([{ method: "signUp", args: {
    email: credentials.email, password: credentials.password,
    options: { emailRedirectTo: "http://localhost:3000/auth/callback?next=%2Fapp" },
  } }]);
});

test("duplicate registration does not disclose account existence", async () => {
  const created = await post("sign-up");
  const duplicate = await post("sign-up", credentials, fixture({ duplicate: true }));
  expect(duplicate.status).toBe(created.status);
  expect(await duplicate.json()).toEqual(await created.json());
});

test("sign-in validates server identity and preserves permitted destination", async () => {
  const response = await post("sign-in", { ...credentials, next: "/app?visit=prepare" });
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ redirectTo: "/app?visit=prepare" });
  expect(response.headers.get("cache-control")).toBe("no-store");
});

test("registration without email confirmation still requires the provisioned profile", async () => {
  expect((await post("sign-up", credentials, fixture({ confirmation: false }))).status).toBe(200);
  expect((await post("sign-up", credentials, fixture({ confirmation: false, missing: true }))).status).toBe(503);
});

test("invalid credentials return a generic error and no redirect", async () => {
  const response = await post("sign-in", credentials, fixture({ invalid: true }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ code: "authentication-failed" });
});

test("expired sessions are rejected before any profile query", async () => {
  const setup = fixture({ expired: true });
  expect((await handleIdentityGet(setup.client)).status).toBe(401);
  expect(setup.calls).toHaveLength(0);
});

test("unconfirmed email identities cannot enter a private workspace", async () => {
  const setup = fixture({ unverified: true });
  expect((await handleIdentityGet(setup.client)).status).toBe(401);
  expect(setup.calls).toHaveLength(0);
});

test("missing config, missing profile and mismatched owner fail closed", async () => {
  expect((await handleIdentityGet(null)).status).toBe(503);
  expect((await readIdentity(fixture({ missing: true }).client)).status).toBe(503);
  expect((await readIdentity(fixture({ foreign: true }).client)).status).toBe(503);
});

test("own-profile lookup always uses Auth UUID and ignores editable provider metadata", async () => {
  const setup = fixture();
  const response = await handleIdentityGet(setup.client);
  expect((await response.json()).profile.role).toBe("mother");
  expect(setup.calls).toContainEqual({ method: "eq", args: { column: "user_id", value: id } });
  expect(setup.calls).toContainEqual({ method: "select", args: "user_id, display_name, role" });
});

test("provider endpoint denies mothers and permits DB-assigned providers directly", async () => {
  expect((await handleIdentityGet(fixture().client, true)).status).toBe(403);
  expect((await handleIdentityGet(fixture({ role: "provider" }).client, true)).status).toBe(200);
  expect((await handleIdentityGet(fixture({ role: "unknown" }).client, true)).status).toBe(503);
});

test("CSRF rejects cross-site and absent origins before touching Auth, including sign-out", async () => {
  for (const action of ["sign-in", "sign-up", "email-link", "sign-out"] as const) {
    for (const origin of ["https://external.invalid", ""]) {
      const setup = fixture();
      expect((await post(action, credentials, setup, origin)).status).toBe(403);
      expect(setup.calls).toHaveLength(0);
    }
  }
});

test("sign-out confirms termination before a safe fixed redirect", async () => {
  const setup = fixture();
  const response = await post("sign-out", credentials, setup);
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe("http://localhost:3000/sign-in?status=signed-out");
  expect(setup.calls).toEqual([{ method: "signOut", args: { scope: "local" } }]);
  expect((await post("sign-out", credentials, fixture({ signoutFailure: true }))).status).toBe(503);
});

test("passwordless sign-in never creates an account implicitly", async () => {
  const setup = fixture();
  const response = await handleAuthPost(request("email-link", { email: credentials.email }), "email-link", {
    createClient: async () => setup.client, siteUrl: "http://localhost:3000",
  });
  expect(response.status).toBe(200);
  expect(setup.calls[0]).toMatchObject({ method: "otp", args: { options: { shouldCreateUser: false } } });
});

test("workspace boundaries and return paths cannot elevate a user's role", () => {
  expect(workspaceRole("/app/records")).toBe("mother");
  expect(workspaceRole("/provider/queue")).toBe("provider");
  expect(workspaceRole("/application")).toBeNull();
  expect(authDestination("//external.invalid", "mother")).toBe("/app");
  expect(authDestination("/provider/queue", "mother")).toBe("/app");
  expect(authDestination("/app", "provider")).toBe("/provider");
  expect(authDestination("/auth/sign-out", "mother")).toBe("/app");
  expect(authDestination("/features?language=bn", "mother")).toBe("/features?language=bn");
});

test("cookie policy is HttpOnly, SameSite Lax and scoped to the host root", () => {
  expect(authCookieOptions()).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  expect(authCookieOptions().secure).toBe(process.env.NODE_ENV === "production");
  expect(authCookieOptions().domain).toBeUndefined();
});

test("public requests carrying session cookies are private and non-cacheable", async () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    // No network: exercise the proxy's response policy even during configuration loss.
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const guest = await updateSession(new NextRequest("http://localhost:3000/about"));
    expect(guest.headers.has("cache-control")).toBe(false);
    const signedIn = await updateSession(new NextRequest("http://localhost:3000/about", {
      headers: { cookie: "sb-localhost-auth-token=synthetic-session" },
    }));
    expect(signedIn.headers.get("cache-control")).toBe("private, no-store");
    expect(signedIn.headers.get("referrer-policy")).toBe("no-referrer");
  } finally {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
  }
});

test("RLS-bound clients reject privileged keys", () => {
  expect(isPublicSupabaseKey("sb_publishable_synthetic")).toBe(true);
  expect(isPublicSupabaseKey("sb_secret_synthetic")).toBe(false);
  const payload = Buffer.from('{"role":"service_role"}').toString("base64url");
  expect(isPublicSupabaseKey(`unused.${payload}.unused`)).toBe(false);
});

test("site URLs cannot use nonlocal HTTP, credentials or paths", () => {
  expect(siteOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  for (const url of [undefined, "http://remote.invalid", "https://user:pass@example.com", "https://example.com/path"]) expect(siteOrigin(url)).toBeNull();
});

test("private routes reject missing canonical site configuration before contacting Auth", async () => {
  const before = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, site: process.env.NEXT_PUBLIC_SITE_URL };
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_synthetic";
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const response = await updateSession(new NextRequest("http://localhost:3000/app"));
    expect(response.status).toBe(503);
    expect(response.headers.has("location")).toBe(false);
  } finally {
    for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", before.url], ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", before.key], ["NEXT_PUBLIC_SITE_URL", before.site]]) {
      if (value === undefined) delete process.env[name!]; else process.env[name!] = value;
    }
  }
});
