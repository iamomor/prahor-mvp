import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const checks = [
  ["Bondhon view, consent and lifecycle regressions", ["--test", "tests/unit/bondhon-view.test.mjs", "tests/unit/bondhon-status.test.mjs"]],
  ["Route definitions", ["node_modules/next/dist/bin/next", "typegen"]],
  ["Typecheck", ["node_modules/typescript/bin/tsc", "--noEmit"]],
  ["Lint", ["node_modules/eslint/bin/eslint.js", "."]],
  ["Existing care HTTP contracts", ["node_modules/@playwright/test/cli.js", "test", "--config=playwright.contracts.config.ts", "care.spec.ts", "care-sql.spec.ts", "bondhon.spec.ts"]],
  ["Existing database regressions", ["--test", "tests/database/care-backend-proposal.test.mjs", "tests/database/bondhon-coordination.test.mjs", "tests/database/bujhi-review-commit.test.mjs"]],
];
for (const [label, args] of checks) {
  console.log(`\nRunning ${label}`);
  if (args[0].startsWith("node_modules/") && !existsSync(new URL(`../${args[0]}`, import.meta.url))) {
    console.error("Locked dependencies are missing. Run npm.cmd ci, then retry."); process.exit(1);
  }
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(`${label} failed: exit ${result.status}; signal ${result.signal ?? "none"}.`);
    if (result.error) console.error(result.error.message);
    process.exit(result.status || 1);
  }
}
console.log("\nCode checks completed. Next run the production build directly in PowerShell, then the signed-in browser acceptance checklist.");
