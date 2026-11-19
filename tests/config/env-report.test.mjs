import assert from "node:assert/strict";
import test from "node:test";
import { envReport } from "../../scripts/lib/env-report.mjs";

const example = "# comment\nNEXT_PUBLIC_SITE_URL=x\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\nOPENROUTER_API_KEY=\n";

test("unknown local names are reported, required/optional gaps are separated", () => {
  const report = envReport(["AI_API_KEY", "NEXT_PUBLIC_SUPABASE_URL"],
    example, { NEXT_PUBLIC_SUPABASE_URL: "u", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: " ", AI_API_KEY: "k" });
  assert.deepEqual(report.unknown, ["AI_API_KEY"]);
  assert.deepEqual(report.missingRequired, ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]);
  assert.deepEqual(report.missingOptional, ["OPENROUTER_API_KEY"]);
});
