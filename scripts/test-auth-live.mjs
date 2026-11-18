import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { localSessionFetch, readSessionConfig } from "./lib/rls-session-safety.mjs";

try {
  const config = readSessionConfig(process.env);
  const response = await localSessionFetch(config.url)(`${config.url}/auth/v1/health`, {
    headers: { apikey: config.key },
  });
  if (!response.ok) throw new Error("Local Auth is unavailable.");
  const child = spawn(process.execPath, [fileURLToPath(new URL("../node_modules/@playwright/test/cli.js", import.meta.url)),
    "test", "--config", "playwright.auth.config.ts"], {
    stdio: "inherit", env: { ...process.env, PROHOR_AUTH_LIVE: "1" },
  });
  child.on("error", () => { console.log("FAIL: Could not start local authentication tests."); process.exitCode = 1; });
  child.on("exit", (code) => { process.exitCode = code ?? 1; });
} catch {
  console.log("NOT RUN: Live authentication, registration confirmation, cookie persistence, provider authorization and expired-session integration.");
  console.log("Missing/unavailable: local Supabase on port 54321 and/or PROHOR_RLS_URL, PROHOR_RLS_PUBLIC_KEY, PROHOR_RLS_AYESHA_PASSWORD, PROHOR_RLS_NUSRAT_PASSWORD. See docs/AUTHENTICATION.md. No remote fallback is allowed.");
  process.exitCode = 2;
}
