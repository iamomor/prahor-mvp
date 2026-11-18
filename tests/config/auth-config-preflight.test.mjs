import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { authConfigReady, authConfirmationPolicy, inspectAuthConfig, probeAuthConfig } from "../../scripts/lib/auth-config-preflight.mjs";

const env = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic-project.example.invalid",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
};

test("readiness compares hosted email confirmation with the declared policy, including the approved MVP mode", async () => {
  for (const confirmationRequired of [true, false]) {
    const report = await probeAuthConfig(env, async url => Response.json(url.endsWith("/settings") ? {
      external: { email: true, anonymous_users: false }, mailer_autoconfirm: !confirmationRequired, disable_signup: false,
    } : []));
    assert.equal(authConfigReady(report, confirmationRequired), true);
    assert.equal(authConfigReady(report, !confirmationRequired), false);
    assert.equal(authConfigReady(report, undefined), false);
    assert.equal(report.acceptance, "requires-authenticated-and-admin-verification");
  }
});

test("confirmation policy parsing fails closed for absent, duplicate and malformed declarations", () => {
  assert.equal(authConfirmationPolicy("[auth.email]\nenable_confirmations = false\n"), false);
  assert.equal(authConfirmationPolicy("[auth.email]\nenable_confirmations = true # reviewed\n[other]\nenable_confirmations = false\n"), true);
  for (const config of ["", "[auth]\nenable_confirmations = false", "[auth.email]\nenable_confirmations = maybe",
    "[auth.email]\nenable_confirmations = true\nenable_confirmations = false",
    "[auth.email]\nenable_confirmations = false\n[auth.email]\nenable_confirmations = false"]) {
    assert.throws(() => authConfirmationPolicy(config));
  }
});

test("CLI runs with the installed Next environment loader and exits nonzero for absent config", () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("../../scripts/check-auth-config.mjs", import.meta.url))], {
    cwd: tmpdir(), encoding: "utf8", env: { ...process.env, NEXT_PUBLIC_SITE_URL: "",
      NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" },
  });
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stdout, /"acceptance": "blocked"/);
});

test("missing site origin blocks every network call", async () => {
  const report = await probeAuthConfig({ ...env, NEXT_PUBLIC_SITE_URL: undefined }, () => {
    assert.fail("Unconfigured preflight must not contact the backend");
  });
  assert.equal(report.configuration.configurationReady, false);
  assert.equal(report.acceptance, "blocked");
  assert.deepEqual(report.checks, []);
});

test("unsafe origins and privileged keys fail closed without exposing rejected values", () => {
  for (const value of ["http://host.invalid", "https://user:password@host.invalid", "https://host.invalid/path", "https://host.invalid?key=secret", "https://host.invalid/#secret"]) {
    assert.equal(inspectAuthConfig({ ...env, NEXT_PUBLIC_SITE_URL: value }).configurationReady, false);
    assert.equal(inspectAuthConfig({ ...env, NEXT_PUBLIC_SUPABASE_URL: value }).configurationReady, false);
  }
  for (const key of ["sb_secret_synthetic", "sb_publishable_", "sb_publishable_bad whitespace", `unused.${Buffer.from('{"role":"service_role"}').toString("base64url")}.unused`]) {
    const report = inspectAuthConfig({ ...env, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key });
    assert.equal(report.publicKeyValid, false);
    assert.equal(JSON.stringify(report).includes(key), false);
  }
});

test("preflight uses only bounded public GETs and never reports private payloads", async () => {
  const calls = [];
  const report = await probeAuthConfig(env, async (url, init) => {
    calls.push({ url, init });
    return Response.json(url.endsWith("/settings") ? {
      external: { email: true, anonymous_users: false }, mailer_autoconfirm: false,
      disable_signup: false, privateValue: "private-sentinel",
    } : [{ user_id: "private-sentinel" }]);
  });
  assert.equal(calls.length, 4);
  for (const { url, init } of calls) {
    assert.equal(new URL(url).origin, env.NEXT_PUBLIC_SUPABASE_URL);
    assert.equal(init.method, "GET");
    assert.equal(init.redirect, "error");
    assert.equal(init.cache, "no-store");
    assert.deepEqual(Object.keys(init.headers), ["apikey"]);
    assert.equal(init.body, undefined);
    if (url.includes("/rest/v1/")) assert.equal(new URL(url).searchParams.get("limit"), "0");
  }
  const output = JSON.stringify(report);
  for (const value of ["private-sentinel", env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY]) {
    assert.equal(output.includes(value), false);
  }
  assert.equal(report.configuration.backendMode, "hosted");
  assert.equal(report.checks[1].confirmationRequired, true);
  assert.equal(report.acceptance, "requires-authenticated-and-admin-verification");
});

test("missing tables, denied probes and exceptions remain unverified and sanitized", async () => {
  let count = 0;
  const report = await probeAuthConfig(env, async () => {
    count += 1;
    if (count === 1) throw new Error("Secret connection details");
    if (count === 2) return Response.json({ message: "Secret details" }, { status: 401 });
    return Response.json({ code: "PGRST205", message: "Secret details" }, { status: 404 });
  });
  assert.deepEqual(report.checks.map(check => check.result), [
    "unreachable-or-invalid-response", "unverified", "not-exposed-in-schema-cache", "not-exposed-in-schema-cache",
  ]);
  assert.equal(JSON.stringify(report).includes("Secret"), false);
});

test("anonymous table permission denial is distinguished from missing tables or invalid public authentication", async () => {
  const report = await probeAuthConfig(env, async url => url.includes("/rest/v1/") ?
    Response.json({ code: "42501", message: "PRIVATE_DETAIL_SENTINEL" }, { status: 401 }) :
    Response.json({ code: "42501", message: "PRIVATE_DETAIL_SENTINEL" }, { status: 403 }));
  assert.deepEqual(report.checks.map(check => check.result), ["unverified", "unverified", "anonymous-access-denied", "anonymous-access-denied"]);
  assert.equal(JSON.stringify(report).includes("PRIVATE_DETAIL_SENTINEL"), false);
  assert.equal(report.acceptance, "requires-authenticated-and-admin-verification");
});

test("oversized, malformed and redirected responses never establish readiness", async () => {
  for (const body of ["{broken", JSON.stringify({ value: "x".repeat(66000) })]) {
    const report = await probeAuthConfig(env, async () => new Response(body));
    assert(report.checks.every(check => check.result === "unreachable-or-invalid-response"));
  }
  const redirect = await probeAuthConfig(env, async () => new Response(null, { status: 302, headers: { location: "https://foreign.invalid" } }));
  assert(redirect.checks.every(check => check.result === "unverified"));
});

test("local public configuration is identified without relaxing live-runner guards", () => {
  assert.equal(inspectAuthConfig({ ...env, NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321" }).backendMode, "local");
  const key = `unused.${Buffer.from('{"role":"anon"}').toString("base64url")}.unused`;
  assert.equal(inspectAuthConfig({ ...env, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }).publicKeyValid, true);
});
