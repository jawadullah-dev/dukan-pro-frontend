/**
 * run-checks.mjs — custom quality and architectural checks for dukaan-pro.
 *
 * Enforces project rules that oxlint, tsc, and next build cannot:
 *   1. secrets          — no hardcoded secrets / API keys
 *   2. hardcoded-text   — no raw UI strings (must use next-intl)
 *   3. arch-rules       — no raw process.env, no inline style, no as any, RTL safe classes, no hex colors
 *   4. structure        — allowed src/ top-level dirs and root files
 *   5. metadata         — every page.tsx server component with SEO metadata & openGraph
 *   6. types            — ban any, !, @ts-ignore, as unknown, Function, Object
 *   7. nest-type        — ban inline/nested object shape literals in params/props
 *   8. api-urls         — ban hardcoded http(s) URLs outside config
 *   9. comments         — zero-comments rule
 *  10. list-tables      — data tables use responsive mobile engine
 *  11. duplicates       — copy-paste detection via jscpd (.jscpd.json)
 *  12. knip             — dead code and unused dependency detection (knip.json)
 *
 * Usage:
 *   npm run check
 *   npm run check -- --only types,arch-rules
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const CHECKS = [
  { id: 'secrets',            cmd: ['node', 'scripts/code/check-secrets.cjs'] },
  { id: 'hardcoded-text',     cmd: ['node', 'scripts/code/check-hardcoded-text.cjs'] },
  { id: 'arch-rules',         cmd: ['node', 'scripts/code/check-arch-rules.cjs'] },
  { id: 'structure',          cmd: ['node', 'scripts/code/check-structure.cjs'] },
  { id: 'metadata',           cmd: ['node', 'scripts/code/check-metadata.cjs'] },
  { id: 'types',              cmd: ['node', 'scripts/code/check-types.cjs'] },
  { id: 'nest-type',          cmd: ['node', 'scripts/code/check-nest-type.cjs'] },
  { id: 'api-urls',           cmd: ['node', 'scripts/code/check-api-urls.cjs'] },
  { id: 'comments',           cmd: ['node', 'scripts/code/check-comments.cjs'] },
  { id: 'console',            cmd: ['node', 'scripts/code/check-console.cjs'] },
  { id: 'feature-boundaries', cmd: ['node', 'scripts/code/check-feature-boundaries.cjs'] },
  { id: 'banned-deps',        cmd: ['node', 'scripts/code/check-banned-deps.cjs'] },
  { id: 'tenancy',            cmd: ['node', 'scripts/code/check-tenancy.cjs'] },
  { id: 'financial-safety',   cmd: ['node', 'scripts/code/check-financial-safety.cjs'] },
  { id: 'error-boundaries',   cmd: ['node', 'scripts/code/check-error-boundaries.cjs'] },
  { id: 'catch-handling',     cmd: ['node', 'scripts/code/check-catch.cjs'] },
  { id: 'max-lines',          cmd: ['node', 'scripts/code/check-max-lines.cjs'] },
  { id: 'storage-safety',     cmd: ['node', 'scripts/code/check-storage-safety.cjs'] },
  { id: 'button-safety',      cmd: ['node', 'scripts/code/check-button-safety.cjs'] },
  { id: 'accessibility',      cmd: ['node', 'scripts/code/check-accessibility.cjs'] },
  { id: 'react-purity',       cmd: ['node', 'scripts/code/check-react-purity.cjs'] },
  { id: 'nextjs-features',    cmd: ['node', 'scripts/code/check-nextjs-best-practices.cjs'] },
  { id: 'mutation-hooks',     cmd: ['node', 'scripts/code/check-mutation-hooks.cjs'] },
  { id: 'clean-handlers',     cmd: ['node', 'scripts/code/check-clean-handlers.cjs'] },
  { id: 'list-tables',        cmd: ['node', 'scripts/check-list-tables.mjs'] },
  { id: 'duplicates',         cmd: ['npx', '--yes', 'jscpd', '--config', '.jscpd.json'] },
  { id: 'knip',               cmd: ['npx', '--yes', 'knip', '--include', 'files,dependencies,unlisted,unresolved,exports,nsExports,types,nsTypes,enumMembers,duplicates,cycles', '--reporter', 'compact'] },
];

const onlyArg = process.argv.find((a) => a.startsWith('--only=') || a === '--only');
let onlyIds = null;
if (onlyArg) {
  const val =
    onlyArg.startsWith('--only=')
      ? onlyArg.slice(7)
      : process.argv[process.argv.indexOf('--only') + 1];
  onlyIds = new Set(val ? val.split(',').map((s) => s.trim()) : []);
}

const toRun = onlyIds ? CHECKS.filter((c) => onlyIds.has(c.id)) : CHECKS;

let passed = 0;
let failed = 0;
const failures = [];

const PAD = Math.max(...toRun.map((c) => c.id.length)) + 2;

console.log('\n🔍  Running project checks...\n');

for (const check of toRun) {
  const label = check.id.padEnd(PAD);
  const result = spawnSync(check.cmd[0], check.cmd.slice(1), {
    cwd: root,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if (result.status === 0) {
    console.log(`  ✅  ${label} — ok`);
    passed++;
  } else {
    console.log(`  ❌  ${label} — FAILED`);
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    failed++;
    failures.push(check.id);
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`  ${passed} passed  •  ${failed} failed`);
if (failed > 0) {
  console.error(`\n  Failed checks: ${failures.join(', ')}\n`);
  process.exit(1);
} else {
  console.log('\n  All checks passed ✅\n');
  process.exit(0);
}
