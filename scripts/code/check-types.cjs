"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Type Safety Audit", { emoji: "🛡️" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    if (relPath.includes("components/ui")) return;

    const code = fs.readFileSync(absPath, "utf8");

    // Check comments for @ts-ignore or @ts-expect-error
    const lines = code.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes("@ts-ignore")) {
        r.addViolation(relPath, idx + 1, "Forbidden `@ts-ignore` — fix type error instead of suppressing it");
      }
      if (line.includes("@ts-expect-error")) {
        r.addViolation(relPath, idx + 1, "Forbidden `@ts-expect-error` — fix type error instead of suppressing it");
      }
    });

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      TSAnyKeyword(p) {
        r.addViolation(relPath, p.node.loc.start.line, "Forbidden `any` type keyword — use explicit named types or generics");
      },

      TSNonNullExpression(p) {
        r.addViolation(relPath, p.node.loc.start.line, "Forbidden non-null assertion `!` — use optional chaining or explicit conditional checks");
      },

      TSAsExpression(p) {
        const targetType = p.node.typeAnnotation;
        // Check for "as unknown as Something" or "as any"
        if (targetType.type === "TSUnknownKeyword") {
          r.addViolation(relPath, p.node.loc.start.line, "Forbidden `as unknown` assertion");
        }
        if (targetType.type === "TSAnyKeyword") {
          r.addViolation(relPath, p.node.loc.start.line, "Forbidden `as any` assertion");
        }
      },

      TSTypeReference(p) {
        const name = p.node.typeName && p.node.typeName.name;
        if (name === "Function") {
          r.addViolation(relPath, p.node.loc.start.line, "Forbidden bare `Function` type — use explicit function signature `() => void` or specific parameters");
        }
        if (name === "Object") {
          r.addViolation(relPath, p.node.loc.start.line, "Forbidden bare `Object` type — use Record<string, T> or an explicit interface");
        }
      }
    });
  });
}

r.finish({
  fixTip: "Strict type safety enforced: define explicit types in src/types/ and avoid assertions/escapes.",
});
