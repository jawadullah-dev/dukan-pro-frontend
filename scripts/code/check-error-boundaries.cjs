"use strict";

const fs = require("fs");
const path = require("path");
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");

const r = new Reporter("Route Resilience & Error Boundaries Audit", { emoji: "🛡️" });

const appRoot = path.join(__dirname, "../../src/app");

if (fs.existsSync(appRoot)) {
  // Check required root error boundaries
  const requiredRoots = [
    "src/app/global-error.tsx",
    "src/app/error.tsx",
    "src/app/[locale]/error.tsx",
    "src/app/[locale]/dashboard/error.tsx",
  ];

  requiredRoots.forEach((reqPath) => {
    const full = path.join(__dirname, "../..", reqPath);
    if (!fs.existsSync(full)) {
      r.addViolation(reqPath, 0, `Missing required route error boundary: ${reqPath}`);
    }
  });

  // Verify all error.tsx and global-error.tsx follow Next.js error boundary conventions
  walkTree(appRoot, (absPath, relPathRaw) => {
    const fileName = path.basename(absPath);
    if (fileName !== "error.tsx" && fileName !== "global-error.tsx") return;

    const relPath = relPathRaw.split(path.sep).join("/");
    const content = fs.readFileSync(absPath, "utf8");

    // Must have 'use client'
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      r.addViolation(
        relPath,
        1,
        "Next.js Error Boundary must be a Client Component: missing `'use client'` directive at top of file"
      );
    }

    // Must export a default function / component
    if (!content.includes("export default")) {
      r.addViolation(
        relPath,
        1,
        "Next.js Error Boundary must have a default export (`export default function ...`)"
      );
    }
  });
}

r.finish({
  fixTip: "Route resilience: Ensure all key route layouts have error.tsx and that every error boundary specifies 'use client'.",
});
