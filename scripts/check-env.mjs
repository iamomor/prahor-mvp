// Warn-only env check (runs before `npm run dev`). Never fails: a teammate's extra or missing optional key must not block anyone.
import nextEnv from "@next/env";
import { readFileSync } from "node:fs";
import { envReport, exampleNames } from "./lib/env-report.mjs";

const { loadedEnvFiles } = nextEnv.loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const localNames = [...new Set(loadedEnvFiles.flatMap(file => Object.keys(file.env)))];
const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const report = envReport(localNames, example, process.env);

console.log(`[env] PROHOR reads ${exampleNames(example).length} names (see .env.example). Values are never printed.`);
if (report.missingRequired.length) console.log(`[env] MISSING (needed for sign-in/saves): ${report.missingRequired.join(", ")}`);
if (report.missingRequired.includes("NEXT_PUBLIC_SITE_URL")) console.log("[env]   In dev, NEXT_PUBLIC_SITE_URL falls back to http://localhost:3000.");
if (report.unknown.length) console.log(`[env] Not used by PROHOR (safe to delete, harmless if kept): ${report.unknown.join(", ")}`);
if (report.missingOptional.length) console.log(`[env] Optional, not set (features fall back gracefully): ${report.missingOptional.join(", ")}`);
if (!report.missingRequired.length && !report.unknown.length) console.log("[env] OK");
