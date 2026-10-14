"use strict";

const fs = require("fs");
const path = require("path");
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");

const r = new Reporter("File Length & Line Limits Audit", { emoji: "📏" });

const srcRoot = path.join(__dirname, "../../src");

const EXEMPT_PATTERNS = [
  "components/ui/",
  "next-env.d.ts",
  "src/lib/dukaan/operations.ts",
  "src/lib/dukaan/store.ts",
  "src/lib/dukaan/types.ts",
  "src/lib/api/types.ts",
];

const TIER_LIMITS = {
  PAGE: 100,
  LAYOUT: 300,
  HOOK: 300,
  API_SCHEMA: 350,
  COMPONENT: 480,
  POS_TERMINAL: 750,
  DEFAULT: 400,
};

function resolveLimit(relPath) {
  if (EXEMPT_PATTERNS.some((pattern) => relPath.includes(pattern))) {
    return { limit: Infinity, category: "Exempt" };
  }

  if (relPath.startsWith("src/app/") && relPath.endsWith("page.tsx")) {
    return { limit: TIER_LIMITS.PAGE, category: "App Router Page (page.tsx)" };
  }

  if (relPath.startsWith("src/app/")) {
    return {
      limit: TIER_LIMITS.LAYOUT,
      category: "App Router Layout / Route File",
    };
  }

  if (relPath.includes("/hooks/")) {
    return { limit: TIER_LIMITS.HOOK, category: "Custom Hook" };
  }

  if (relPath.endsWith("sales.tsx")) {
    return { limit: TIER_LIMITS.POS_TERMINAL, category: "POS Terminal View" };
  }

  if (relPath.includes("/components/")) {
    return { limit: TIER_LIMITS.COMPONENT, category: "UI Component / Dialog" };
  }

  if (relPath.includes("/api/") || relPath.includes("/schemas/")) {
    return { limit: TIER_LIMITS.API_SCHEMA, category: "API Service / Schema" };
  }

  return { limit: TIER_LIMITS.DEFAULT, category: "Module / Utility" };
}

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    const { limit, category } = resolveLimit(relPath);

    if (limit === Infinity) return;

    const content = fs.readFileSync(absPath, "utf8");
    const lineCount = content.split("\n").length;

    if (lineCount > limit) {
      r.addViolation(
        relPath,
        lineCount,
        `File has ${lineCount} lines, exceeding the ${limit}-line limit for ${category}`,
        {
          fix: `Refactor and decompose into smaller subcomponents, custom hooks, or utility helpers.`,
        },
      );
    }
  });
}

r.finish({
  fixTip:
    "Keep files modular and focused: Pages <= 100 lines, Components <= 480 lines, Hooks <= 300 lines, Schemas/API <= 350 lines.",
});
