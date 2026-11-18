import assert from "node:assert/strict";
import test from "node:test";
import { localSessionFetch, readSessionConfig, validateLocalUrl, validatePublicKey } from "../../scripts/lib/rls-session-safety.mjs";

test("only the configured loopback Supabase ports are accepted", () => {
  assert.equal(validateLocalUrl("http://127.0.0.1:54321"), "http://127.0.0.1:54321");
  assert.equal(validateLocalUrl("http://localhost:54321"), "http://localhost:54321");
  for (const url of ["https://example.supabase.co", "http://127.0.0.1:3000",
    "http://localhost.example.com:54321", "http://user:password@localhost:54321",
    "http://localhost:54321/path", "http://localhost:54321/?key=value"]) {
    assert.throws(() => validateLocalUrl(url));
  }
});

test("service and secret keys are rejected without echoing their values", () => {
  // Parser fixture only; never sent to a service or used as a session.
  const serviceFixture = `unused.${Buffer.from('{"role":"service_role"}').toString("base64url")}.unused`;
  for (const key of ["sb_secret_synthetic", serviceFixture, "invalid", undefined]) {
    assert.throws(() => validatePublicKey(key), /privileged keys are forbidden/);
  }
  assert.equal(validatePublicKey("sb_publishable_synthetic"), "sb_publishable_synthetic");
});

test("missing session configuration cannot fall back to application or service credentials", () => {
  assert.throws(() => readSessionConfig({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "must-never-be-used",
  }), /Missing test configuration/);
});

test("every request rejects remote origins and admin routes before network access", async () => {
  let calls = 0;
  const guarded = localSessionFetch("http://127.0.0.1:54321", async () => { calls++; });
  for (const url of ["https://example.supabase.co/rest/v1/profiles",
    "http://127.0.0.1:54321/auth/v1/admin/users",
    "http://127.0.0.1:54321/storage/v1/object"]) {
    await assert.rejects(guarded(url), /boundary refused/);
  }
  await assert.rejects(guarded("http://127.0.0.1:54321/rest/v1/profiles",
    { headers: { apikey: "sb_secret_synthetic" } }), /privileged keys/);
  await assert.rejects(guarded("http://127.0.0.1:54321/rest/v1/profiles",
    { headers: { authorization: "Bearer invalid" } }), /bearer refused/);
  assert.equal(calls, 0);
});

test("allowed requests disable redirects and have a bounded timeout", async () => {
  const guarded = localSessionFetch("http://127.0.0.1:54321", async (_input, init) => {
    assert.equal(init.redirect, "error");
    assert(init.signal instanceof AbortSignal);
    return new Response("[]", { status: 200 });
  });
  const result = await guarded("http://127.0.0.1:54321/rest/v1/profiles", {
    headers: { apikey: "sb_publishable_synthetic" },
  });
  assert.equal(result.status, 200);
});
