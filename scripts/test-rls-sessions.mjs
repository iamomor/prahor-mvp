import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { jwtRole, localSessionFetch, readSessionConfig } from "./lib/rls-session-safety.mjs";

const scenarios = [
  "Ayesha reads and updates her own profile and preferences",
  "Nusrat cannot read or modify Ayesha's data",
  "Unauthenticated users cannot access private profiles or preferences",
  "A mother cannot change her role to provider",
  "A provider cannot automatically access another mother's records",
];
const clients = [];
const originals = new Map();
let failures = 0;
let blocked = 0;

function check(ok, message) { assert.ok(ok, message); }
function success(result, label) {
  check(!result.error, `${label} failed (inspect local service configuration; response omitted).`);
  return result.data;
}
async function own(client, id, table) {
  const rows = success(await client.from(table).select("*").eq("user_id", id), `Read own ${table}`);
  check(rows.length === 1 && rows[0].user_id === id, `Expected exactly one own ${table} row.`);
  return rows[0];
}
function denied(result, label) {
  // Missing tables, invalid JWTs, and network failures are not proof of RLS.
  check(result.error?.code === "42501" && [401, 403].includes(result.status), `${label}: expected permission denial.`);
}
async function isolated(client, otherId, table, payload) {
  const rows = success(await client.from(table).select("*").eq("user_id", otherId), `Cross-user read ${table}`);
  check(rows.length === 0, `Cross-user ${table} read leaked rows.`);
  const updated = success(await client.from(table).update(payload).eq("user_id", otherId).select("*"), `Cross-user update ${table}`);
  check(updated.length === 0, `Cross-user ${table} update changed rows.`);
}

try {
  const config = readSessionConfig(process.env); // Never reads application .env files.
  function client() {
    const instance = createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: localSessionFetch(config.url) },
    });
    clients.push(instance);
    return instance;
  }
  async function signIn(credentials) {
    const instance = client();
    const result = await instance.auth.signInWithPassword(credentials);
    const data = success(result, "Synthetic account password sign-in");
    check(data.session && jwtRole(data.session.access_token) === "authenticated", "A real authenticated session is required.");
    const verified = success(await instance.auth.getUser(), "Verify session with Auth");
    check(verified.user?.id === data.user.id && verified.user.email === credentials.email, "Verified synthetic identity mismatch.");
    return { client: instance, id: verified.user.id };
  }

  const ayesha = await signIn(config.ayesha);
  const nusrat = await signIn(config.nusrat);
  check(ayesha.id !== nusrat.id, "Two distinct Auth accounts are required.");
  const anonymous = client(); // No sign-in, no user Authorization token.
  const profile = await own(ayesha.client, ayesha.id, "profiles");
  const preferences = await own(ayesha.client, ayesha.id, "access_preferences");
  const nusratProfile = await own(nusrat.client, nusrat.id, "profiles");
  await own(nusrat.client, nusrat.id, "access_preferences");
  check(profile.role === "mother", "Ayesha fixture must be a mother.");

  // Restore the synthetic fixture values through Ayesha's session, even on failure.
  originals.set("profiles", { display_name: profile.display_name });
  originals.set("access_preferences", { settings: preferences.settings });
  try {
    const tests = [
      async () => {
        const rows = success(await ayesha.client.from("profiles").select("user_id"), "List own profiles");
        check(rows.length === 1 && rows[0].user_id === ayesha.id, "Ayesha profile listing leaked rows.");
        const prefRows = success(await ayesha.client.from("access_preferences").select("user_id"), "List own preferences");
        check(prefRows.length === 1 && prefRows[0].user_id === ayesha.id, "Ayesha preference listing leaked rows.");
        const changedProfile = success(await ayesha.client.from("profiles").update({ display_name: "Ayesha — synthetic RLS test" })
          .eq("user_id", ayesha.id).select("display_name"), "Update own profile");
        check(changedProfile.length === 1 && changedProfile[0].display_name === "Ayesha — synthetic RLS test", "Own profile update did not return one row.");
        const settings = { ...preferences.settings, language: preferences.settings.language === "bn" ? "en" : "bn" };
        const changedPreferences = success(await ayesha.client.from("access_preferences").update({ settings })
          .eq("user_id", ayesha.id).select("settings"), "Update own preferences");
        check(changedPreferences.length === 1 && changedPreferences[0].settings.language === settings.language, "Own preferences update did not return one row.");
        check((await own(ayesha.client, ayesha.id, "profiles")).display_name === changedProfile[0].display_name, "Profile update was not persisted.");
        check((await own(ayesha.client, ayesha.id, "access_preferences")).settings.language === settings.language, "Preferences update was not persisted.");
      },
      async () => {
        const beforeProfile = await own(ayesha.client, ayesha.id, "profiles");
        const beforePrefs = await own(ayesha.client, ayesha.id, "access_preferences");
        await isolated(nusrat.client, ayesha.id, "profiles", { display_name: "Forbidden synthetic change" });
        await isolated(nusrat.client, ayesha.id, "access_preferences", { settings: preferences.settings });
        check(JSON.stringify(await own(ayesha.client, ayesha.id, "profiles")) === JSON.stringify(beforeProfile), "Nusrat changed Ayesha profile.");
        check(JSON.stringify(await own(ayesha.client, ayesha.id, "access_preferences")) === JSON.stringify(beforePrefs), "Nusrat changed Ayesha preferences.");
      },
      async () => {
        for (const table of ["profiles", "access_preferences"]) {
          denied(await anonymous.from(table).select("*"), `Anonymous ${table} read`);
          const payload = table === "profiles" ? { display_name: "Forbidden anonymous change" } : { settings: preferences.settings };
          denied(await anonymous.from(table).update(payload).eq("user_id", ayesha.id).select("*"), `Anonymous ${table} update`);
        }
      },
      async () => {
        denied(await ayesha.client.from("profiles").update({ role: "provider" }).eq("user_id", ayesha.id).select("role"), "Mother role escalation");
        check((await own(ayesha.client, ayesha.id, "profiles")).role === "mother", "Mother role changed.");
      },
      async () => {
        if (nusratProfile.role !== "provider") return "Nusrat requires a trusted, pre-provisioned LOCAL provider fixture; no role is forged or promoted by these tests.";
        // Positive own reads distinguish row isolation from a broken session.
        for (const table of ["profiles", "access_preferences"]) {
          await own(nusrat.client, nusrat.id, table);
          const rows = success(await nusrat.client.from(table).select("user_id"), `Provider ${table} listing`);
          check(rows.length === 1 && rows[0].user_id === nusrat.id, `Provider listing leaked another user's ${table}.`);
        }
        await isolated(nusrat.client, ayesha.id, "profiles", { display_name: "Forbidden provider change" });
        await isolated(nusrat.client, ayesha.id, "access_preferences", { settings: preferences.settings });
      },
    ];
    for (const [index, test] of tests.entries()) {
      try {
        const reason = await test();
        if (reason) { blocked++; console.log(`BLOCKED: ${scenarios[index]} — ${reason}`); }
        else console.log(`PASS: ${scenarios[index]}`);
      } catch (error) {
        failures++;
        console.log(`FAIL: ${scenarios[index]} — ${error instanceof assert.AssertionError ? error.message : "Request failed; raw response omitted."}`);
      }
    }
  } finally {
    for (const [table, payload] of originals) {
      try {
        const result = await ayesha.client.from(table).update(payload).eq("user_id", ayesha.id).select("user_id");
        check(!result.error && result.data?.length === 1, "Restore failed.");
      } catch {
        failures++;
        console.log(`FAIL: Restore Ayesha's synthetic ${table} fixture. Reset its values locally before reusing it.`);
      }
    }
  }
} catch (error) {
  // Never print tokens, credentials, request headers, or SDK response objects.
  const reason = error instanceof assert.AssertionError ? error.message :
    error instanceof Error && /^(Missing test configuration:|RLS tests allow only|A local Supabase URL|Use a local publishable)/.test(error.message)
      ? error.message : "Local Auth/API unavailable or fixture setup failed; check local Supabase and the two synthetic accounts.";
  for (const scenario of scenarios) console.log(`BLOCKED: ${scenario} — ${reason}`);
  blocked += scenarios.length;
} finally {
  // Local-only sign-out; never logs session contents or attempts admin cleanup.
  await Promise.allSettled(clients.map((client) => client.auth.signOut({ scope: "local" })));
}
console.log("Scope: profiles and access_preferences only. Clinical-record tables do not exist in this slice.");
process.exitCode = failures ? 1 : blocked ? 2 : 0;
