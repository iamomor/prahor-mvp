import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import { authConfigReady, authConfirmationPolicy, probeAuthConfig } from "./lib/auth-config-preflight.mjs";

nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
try {
  const report = await probeAuthConfig(process.env);
  const confirmationRequired = authConfirmationPolicy(await readFile(new URL("../supabase/config.toml", import.meta.url), "utf8"));
  const ready = authConfigReady(report, confirmationRequired);
  console.log(JSON.stringify({ ...report, expectedConfirmationRequired: confirmationRequired, publicPreflightReady: ready }, null, 2));
  if (!confirmationRequired) console.log("Declared hackathon auto-confirm policy: email ownership is not verified.");
  console.log("Read-only public preflight only. Session, RLS, migration history and Dashboard redirects are NOT verified.");
  if (!ready) process.exitCode = 2;
} catch {
  console.log("NOT VERIFIED: Configuration inspection failed. No credentials or response bodies are logged.");
  process.exitCode = 2;
}
