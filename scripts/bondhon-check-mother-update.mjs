import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
if (!existsSync(new URL("../node_modules/typescript/bin/tsc", import.meta.url))) {
  console.error("Install the locked project dependencies with npm.cmd ci first.");
  process.exit(1);
}
const checks = [
  ["Route type generation", ["node_modules/next/dist/bin/next", "typegen"]],
  ["Typecheck", ["node_modules/typescript/bin/tsc", "--noEmit"]],
  ["Lint", ["node_modules/eslint/bin/eslint.js", "."]],
  ["Status and scoped permission tests", ["--test", "tests/unit/bondhon-status.test.mjs"]],
  ["Existing care HTTP contracts", ["node_modules/@playwright/test/cli.js", "test", "--config=playwright.contracts.config.ts", "care.spec.ts", "care-sql.spec.ts", "bondhon.spec.ts"]],
  ["Production build", ["node_modules/next/dist/bin/next", "build", "--webpack"]],
];
for (const [label, args] of checks) {
  console.log(`\nRunning ${label}`);
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(`${label} failed. Exit status: ${result.status}; signal: ${result.signal ?? "none"}.`);
    if (result.error) console.error(result.error.message);
    process.exit(result.status || 1);
  }
}
console.log("\nLocal update checks passed. Hosted accounts, Supabase activation and live accessibility tests remain separate checks.");
