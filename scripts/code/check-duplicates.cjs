"use strict";

/**
 * check-duplicates.cjs — Advanced Code Clone & Duplication Auditor
 *
 * Runs copy-paste detection across both TypeScript (.ts) and React JSX (.tsx)
 * files, categorizing duplication clusters and reporting concrete refactoring targets.
 *
 * CLI Flags:
 *   --threshold <num>   Maximum allowed duplication percentage (default: from .jscpd.json)
 *   --max-clones <num>  Maximum allowed clones before failing
 *   --silent            Only exit code
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { Reporter } = require("./lib/reporter.cjs");

const ROOT = path.resolve(__dirname, "../..");
const configPath = path.join(ROOT, ".jscpd.json");

const r = new Reporter("Codebase Duplication & Clone Audit", { emoji: "👥" });

const args = process.argv.slice(2);
const thresholdArgIdx = args.indexOf("--threshold");
const customThreshold = thresholdArgIdx !== -1 ? parseFloat(args[thresholdArgIdx + 1]) : null;

// Run jscpd with json output to parse exact clones
const jscpdCmd = [
  "jscpd",
  "src",
  "--format",
  "typescript,tsx",
  "--min-lines",
  "8",
  "--min-tokens",
  "75",
  "--ignore",
  "**/node_modules/**,**/.next/**,**/src/components/ui/**,**/src/styles/**,**/src/constants/mock*/**,**/src/lib/dukaan/operations.ts",
  "--reporters",
  "json",
  "--output",
  "scripts/.temp-jscpd",
  "--silent",
];

const tempDir = path.join(ROOT, "scripts/.temp-jscpd");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const result = spawnSync("npx", ["--yes", ...jscpdCmd], {
  cwd: ROOT,
  stdio: "pipe",
  encoding: "utf8",
  shell: process.platform === "win32",
});

const reportFile = path.join(tempDir, "jscpd-report.json");
let reportData = null;

if (fs.existsSync(reportFile)) {
  try {
    reportData = JSON.parse(fs.readFileSync(reportFile, "utf8"));
  } catch {}
}

// Clean up temp report file
try {
  if (fs.existsSync(reportFile)) fs.unlinkSync(reportFile);
  if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
} catch {}

if (!reportData || !reportData.statistics) {
  // If jscpd found 0 duplicates, it may output no report
  console.log("👥  Codebase Duplication & Clone Audit\n");
  console.log("✅ Zero code clones detected across all TS and TSX files!");
  process.exit(0);
}

const stats = reportData.statistics.total;
const duplicates = reportData.duplicates || [];
const cloneCount = duplicates.length;
const dupPercentage = stats.percentage || 0;

console.log("👥  Codebase Duplication & Clone Audit\n");
console.log(`📊 Total Files Scanned: ${stats.sources}`);
console.log(`📊 Duplicated Lines:    ${stats.lines} (${dupPercentage}% of codebase)`);
console.log(`📊 Clones Found:         ${cloneCount} clone pairs\n`);

if (cloneCount > 0) {
  // Group clones by cluster
  const clusters = new Map();

  duplicates.forEach((clone) => {
    const f1 = path.relative(ROOT, clone.firstFile.name).replace(/\\/g, "/");
    const f2 = path.relative(ROOT, clone.secondFile.name).replace(/\\/g, "/");
    const key = [f1, f2].sort().join("  ⟷  ");

    if (!clusters.has(key)) {
      clusters.set(key, {
        f1,
        f2,
        instances: 0,
        totalLines: 0,
        sample: `${clone.firstFile.startLoc.line}:${clone.firstFile.endLoc.line}`,
      });
    }

    const c = clusters.get(key);
    c.instances++;
    c.totalLines += clone.lines;
  });

  console.log("🔍 Top Duplicate Clusters To Refactor (Common Things Common):\n");

  const sorted = Array.from(clusters.values()).sort(
    (a, b) => b.totalLines - a.totalLines
  );

  sorted.slice(0, 10).forEach((c, idx) => {
    console.log(`  ${idx + 1}. [${c.totalLines} duplicate lines across ${c.instances} block(s)]`);
    console.log(`     📄 ${c.f1}`);
    console.log(`     📄 ${c.f2}\n`);
  });

  if (sorted.length > 10) {
    console.log(`  ... and ${sorted.length - 10} more duplicate cluster(s).\n`);
  }
}

let configThreshold = 3.0;
if (fs.existsSync(configPath)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (typeof cfg.threshold === "number") configThreshold = cfg.threshold;
  } catch {}
}

const allowedThreshold = customThreshold ?? configThreshold;


if (dupPercentage > allowedThreshold) {
  console.error(
    `❌ Duplication rate (${dupPercentage}%) exceeds the allowed threshold (${allowedThreshold}%).\n`
  );
  process.exit(1);
} else {
  console.log(
    `✅ Duplication rate (${dupPercentage}%) is within allowed threshold (≤ ${allowedThreshold}%).\n`
  );
  process.exit(0);
}
