import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [
 ['Poth discovery and source safety', ['--test', 'tests/unit/poth-directory.test.mjs']],
 ['Preserved nationwide source snapshot', ['scripts/verify-poth-community-cache.mjs']],
 ['Route definitions', ['node_modules/next/dist/bin/next', 'typegen']],
 ['Typecheck', ['node_modules/typescript/bin/tsc', '--noEmit']],
 ['Lint', ['node_modules/eslint/bin/eslint.js', '.']],
 ['Existing nearby checks', ['scripts/PROHOR-Poth-FinalCheck-20261118.mjs']],
];
for (const [label, args] of checks) {
 console.log('\nRunning ' + label);
 const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
 if (result.error || result.status !== 0) {
  console.error(`${label} failed: exit ${result.status}; signal ${result.signal ?? 'none'}.`);
  if (result.error) console.error(result.error.message);
  process.exit(result.status || 1);
 }
}
console.log('\nCode checks passed. Run the production build directly in PowerShell, then check the public and signed-in Poth journeys.');
