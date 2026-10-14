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
  { re: /['"`][A-Za-z0-9]{32}['"`]/, label: "Possible MD5/Key string" },
];

const roots = [path.resolve(__dirname, "../../src")].filter((p) =>
  fs.existsSync(p),
);

roots.forEach((root) => {
  walkTree(root, (absPath, relPath) => {
    if (!/\.(ts|tsx|js|jsx|json|env)$/.test(absPath)) return;
    if (absPath.includes(".test.") || absPath.includes(".spec.")) return;

    const content = fs.readFileSync(absPath, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) return;

      PATTERNS.forEach(({ re, label }) => {
        if (re.test(trimmed)) {
          if (trimmed.includes("@") || trimmed.includes("Placeholder") || trimmed.includes("Example")) return;
          
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