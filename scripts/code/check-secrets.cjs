"use strict";

const fs = require("fs");
const path = require("path");
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");

const r = new Reporter("Hardcoded Secrets Audit", { emoji: "🔑" });

const PATTERNS = [
  { re: /(['"`])sk-[a-zA-Z0-9]{20,}\1/, label: "OpenAI API key" },
  { re: /(['"`])[A-Za-z0-9_\-]{20,}\1\s*,?\s*\/\/.*secret/i, label: "Possible secret" },
  {
    re: /(?<![a-zA-Z0-9_])password\s*[:=]\s*['"`][^'"`]{4,}['"`]/i,
    label: "Hardcoded password",
  },
  { re: /api[_-]?key\s*[:=]\s*['"`][^'"`]{8,}['"`]/i, label: "Hardcoded API key" },
  { re: /secret\s*[:=]\s*['"`][^'"`]{6,}['"`]/i, label: "Hardcoded secret" },
  { re: /token\s*[:=]\s*['"`][^'"`]{8,}['"`]/i, label: "Hardcoded token" },
  { re: /AUTH_[A-Z_]+\s*[:=]\s*['"`][^'"`]+['"`]/, label: "Hardcoded auth value" },
  { re: /private[_-]?key\s*[:=]\s*['"`][^'"`]{10,}['"`]/i, label: "Private key" },
  { re: /bearer\s+['"`][A-Za-z0-9._\-\/]{10,}['"`]/i, label: "Hardcoded bearer token" },
  { re: /AKIA[0-9A-Z]{16}/, label: "AWS Access Key" },
  { re: /gh[pousr]_[A-Za-z0-9_]{36,}/, label: "GitHub Token" },
  { re: /github_pat_[A-Za-z0-9_]{50,}/, label: "GitHub Fine-Grained Token" },
  { re: /sk_(?:live|test)_[0-9a-zA-Z]{24,}/, label: "Stripe Secret Key" },
  { re: /AIza[0-9A-Za-z-_]{35}/, label: "Google API Key" },
  { re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: "Private Key block" },
];

const ROOT = path.resolve(__dirname, "../..");
const roots = [path.join(ROOT, "src"), path.join(ROOT, "scripts")].filter((p) =>
  fs.existsSync(p),
);

// Also scan root config files
const ROOT_CONFIG_FILES = [
  "next.config.ts",
  "next.config.mjs",
  "next.config.js",
  "auth.ts",
  "auth.config.ts",
  "package.json"
];

ROOT_CONFIG_FILES.forEach((fileName) => {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    PATTERNS.forEach(({ re, label }) => {
      if (re.test(trimmed)) {
        if (trimmed.includes("@") || trimmed.includes("Placeholder") || trimmed.includes("Example") || trimmed.includes("dummy")) return;
        r.addViolation(fileName, idx + 1, `${label} — use process.env instead`, {
          sample: trimmed.slice(0, 100),
        });
      }
    });
  });
});

roots.forEach((root) => {
  walkTree(root, (absPath, relPath) => {
    if (!/\.(ts|tsx|js|jsx|json|env)$/.test(absPath)) return;
    if (absPath.includes(".test.") || absPath.includes(".spec.")) return;
    if (absPath.endsWith("bun.lock") || absPath.endsWith("package-lock.json")) return;

    const content = fs.readFileSync(absPath, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) return;

      PATTERNS.forEach(({ re, label }) => {
        if (re.test(trimmed)) {
          if (trimmed.includes("@") || trimmed.includes("Placeholder") || trimmed.includes("Example") || trimmed.includes("dummy")) return;
          
          if (label === "Hardcoded password") {
            const valueMatch = trimmed.match(/(?<![a-zA-Z0-9_])password\s*[:=]\s*['"`]([^'"`]+)['"`]/i);
            if (valueMatch && /^password$/i.test(valueMatch[1].trim())) return;
          }

          r.addViolation(relPath, idx + 1, `${label} — use process.env instead`, {
            sample: trimmed.slice(0, 100),
          });
        }
      });
    });
  });
});

r.finish({
  fixTip: "NEVER hardcode secrets. Always use environment variables (.env) and access them via process.env.",
});