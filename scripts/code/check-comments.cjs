"use strict";

const fs = require("fs");
const path = require("path");
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");

const r = new Reporter("Comments Audit (Zero-Comments Rule)", { emoji: "💬" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    // Exempt shadcn primitives and Next generated types
    if (relPath.includes("components/ui/") || relPath.includes("next-env.d.ts")) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    const lines = code.split("\n");

    let inBlockComment = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check block comments
      if (inBlockComment) {
        r.addViolation(relPath, index + 1, "Forbidden comment — zero-comments rule is active");
        if (trimmed.includes("*/")) {
          inBlockComment = false;
        }
        return;
      }

      if (trimmed.startsWith("/*")) {
        r.addViolation(relPath, index + 1, "Forbidden block / JSDoc comment — zero-comments rule is active");
        if (!trimmed.includes("*/")) {
          inBlockComment = true;
        }
        return;
      }

      // Check single-line comments
      if (trimmed.startsWith("//")) {
        // "use client" is a string directive, not a comment
        r.addViolation(relPath, index + 1, `Forbidden line comment "${trimmed.slice(0, 40)}" — zero-comments rule is active`);
        return;
      }

      // Check JSX comments {/* ... */}
      if (trimmed.includes("{/*") || trimmed.includes("*/}")) {
        r.addViolation(relPath, index + 1, "Forbidden JSX comment — zero-comments rule is active");
        return;
      }

      // Inline comments after code (e.g., const a = 1; // comment)
      // Make sure it's not a URL like https://
      const slashIndex = line.indexOf("//");
      if (slashIndex !== -1) {
        const prefix = line.slice(0, slashIndex);
        if (!prefix.includes("http:") && !prefix.includes("https:") && !prefix.includes('"') && !prefix.includes("'")) {
          r.addViolation(relPath, index + 1, `Forbidden trailing comment "${line.slice(slashIndex, slashIndex + 40)}" — zero-comments rule is active`);
        }
      }
    });
  });
}

r.finish({
  fixTip: "Zero comments allowed: write self-documenting code with clear names instead of comments.",
});
