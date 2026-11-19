#!/usr/bin/env node
async function verifyBondhon() {
  const { spawnSync } = await import('node:child_process');
  const { existsSync } = await import('node:fs');
  const path = await import('node:path');
  const root = path.resolve(__dirname, '..');
  const compiler = path.join(root, 'node_modules/typescript/bin/tsc');
  if (!existsSync(compiler)) {
    console.error('Install project dependencies with npm ci, then rerun node scripts/bondhon-verify.cjs.');
    process.exit(1);
  }
  const checks = [
    ['Typecheck', [compiler, '--noEmit']],
    ['Lint', ['node_modules/eslint/bin/eslint.js', '.']],
    ['Care HTTP contracts', ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.contracts.config.ts', 'care.spec.ts', 'care-sql.spec.ts', 'bondhon.spec.ts']],
    ['Care database regression tests', ['--test', 'tests/database/care-backend-proposal.test.mjs', 'tests/database/bondhon-coordination.test.mjs', 'tests/database/bujhi-review-commit.test.mjs']],
    ['Production build', ['node_modules/next/dist/bin/next', 'build', '--webpack']],
  ];
  for (const [label, args] of checks) {
    console.log(`\nRunning ${label}`);
    const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
    if (result.error || result.status !== 0) {
      console.error(`${label} did not pass. Fix the reported issue before release.`);
      process.exit(result.status || 1);
    }
  }
  console.log('\nAll local checks passed. Hosted database, two-account and accessibility checks still need the live environment.');
}

verifyBondhon().catch(error => {
  console.error(error instanceof Error ? error.message : 'Bondhon verification failed.');
  process.exitCode = 1;
});
