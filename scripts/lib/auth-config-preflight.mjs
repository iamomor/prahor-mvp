import { validatePublicKey } from "./rls-session-safety.mjs";

/** Read the declared policy; missing/ambiguous config never means auto-confirm. */
export function authConfirmationPolicy(toml) {
  const sections = [...toml.matchAll(/^\[auth\.email\][ \t]*\r?\n([\s\S]*?)(?=^\[|$(?![\s\S]))/gm)];
  const settings = sections.length === 1
    ? [...sections[0][1].matchAll(/^enable_confirmations[ \t]*=[ \t]*(true|false)[ \t]*(?:#.*)?\r?$/gm)] : [];
  if (settings.length !== 1) throw new Error("Email confirmation policy is not declared unambiguously.");
  return settings[0][1] === "true";
}

/** Public reachability/config agreement only, never authenticated acceptance. */
export function authConfigReady(report, confirmationRequired) {
  return typeof confirmationRequired === "boolean" && report.configuration.configurationReady &&
    report.checks.length === 4 && report.checks.every(check => check.result === "reachable" ||
      (["profiles", "access-preferences"].includes(check.name) && check.result === "anonymous-access-denied")) &&
    report.checks.some(check => check.name === "auth-settings" && check.emailEnabled &&
      check.confirmationRequired === confirmationRequired && check.signupEnabled && check.anonymousDisabled);
}

function rootOrigin(value) {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return null;
    return { origin: url.origin, local };
  } catch { return null; }
}

/** Sanitized configuration only. Never return credentials, project URLs or response bodies. */
export function inspectAuthConfig(env) {
  const site = rootOrigin(env.NEXT_PUBLIC_SITE_URL);
  const backend = rootOrigin(env.NEXT_PUBLIC_SUPABASE_URL);
  let publicKey = false;
  try {
    const key = validatePublicKey(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    publicKey = !key.startsWith("sb_publishable_") || /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
  } catch { /* Report the category, never the rejected value. */ }
  return {
    siteOriginValid: Boolean(site), backendOriginValid: Boolean(backend), publicKeyValid: publicKey,
    backendMode: backend ? (backend.local ? "local" : "hosted") : "invalid",
    callbackPath: "/auth/callback",
    configurationReady: Boolean(site && backend && publicKey),
  };
}

async function boundedJson(response) {
  if (!response.body) return null;
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); throw new Error("Response too large"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { reader.releaseLock(); }
}

/** Read-only GETs with the public key; no signups, sessions, row data or admin fallback. */
export async function probeAuthConfig(env, fetchImpl = fetch) {
  const configuration = inspectAuthConfig(env);
  if (!configuration.configurationReady) return { configuration, checks: [], acceptance: "blocked" };
  const origin = rootOrigin(env.NEXT_PUBLIC_SUPABASE_URL).origin;
  const checks = [];
  for (const [name, path] of [
    ["auth-health", "/auth/v1/health"],
    ["auth-settings", "/auth/v1/settings"],
    ["profiles", "/rest/v1/profiles?select=user_id&limit=0"],
    ["access-preferences", "/rest/v1/access_preferences?select=user_id&limit=0"],
  ]) {
    try {
      const response = await fetchImpl(`${origin}${path}`, {
        method: "GET", headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
        redirect: "error", signal: AbortSignal.timeout(10000), cache: "no-store",
      });
      const body = await boundedJson(response);
      const check = { name, status: response.status, result: response.ok ? "reachable" : "unverified" };
      if (!response.ok && body?.code === "PGRST205") check.result = "not-exposed-in-schema-cache";
      if (["profiles", "access-preferences"].includes(name) && [401, 403].includes(response.status) && body?.code === "42501") {
        check.result = "anonymous-access-denied";
      }
      if (name === "auth-settings" && response.ok) {
        check.emailEnabled = body?.external?.email === true;
        check.confirmationRequired = body?.mailer_autoconfirm === false;
        check.signupEnabled = body?.disable_signup === false;
        check.anonymousDisabled = body?.external?.anonymous_users === false;
      }
      checks.push(check);
    } catch { checks.push({ name, result: "unreachable-or-invalid-response" }); }
  }
  // Even a successful anonymous zero-row query cannot establish authenticated RLS,
  // migration history, Dashboard redirect allowlists or cookie/session acceptance.
  return { configuration, checks, acceptance: "requires-authenticated-and-admin-verification" };
}
