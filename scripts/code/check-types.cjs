"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Type Safety Audit", { emoji: "🛡️" });

const ROOT = path.resolve(__dirname, "../..");
const srcRoot = path.join(ROOT, "src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.replace(/\\/g, "/");
    if (relPath.includes("components/ui/") || relPath.endsWith(".d.ts")) return;

    const code = fs.readFileSync(absPath, "utf8");

    // Check comments for @ts-ignore, @ts-expect-error, or @ts-nocheck
    const lines = code.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes("@ts-ignore")) {
        r.addViolation(relPath, idx + 1, "Forbidden `@ts-ignore` — fix type error instead of suppressing it");
      }
      if (line.includes("@ts-expect-error")) {
        r.addViolation(relPath, idx + 1, "Forbidden `@ts-expect-error` — fix type error instead of suppressing it");
      }
      if (line.includes("@ts-nocheck")) {
        r.addViolation(relPath, idx + 1, "Forbidden `@ts-nocheck` — fix type error instead of disabling type checks");
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
        r.addViolation(
          relPath,
          p.node.loc ? p.node.loc.start.line : 0,
          "Forbidden `any` type keyword — use explicit named types or generics"
        );
      },

      TSNonNullExpression(p) {
        r.addViolation(
          relPath,
          p.node.loc ? p.node.loc.start.line : 0,
          "Forbidden non-null assertion `!` — use optional chaining or explicit conditional checks"
        );
      },

      TSAsExpression(p) {
        const targetType = p.node.typeAnnotation;
        if (targetType.type === "TSUnknownKeyword") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            "Forbidden `as unknown` assertion"
          );
        }
        if (targetType.type === "TSAnyKeyword") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            "Forbidden `as any` assertion"
          );
        }
      },

      TSTypeAssertion(p) {
        const targetType = p.node.typeAnnotation;
        if (targetType.type === "TSUnknownKeyword") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            "Forbidden `<unknown>` assertion"
          );
        }
        if (targetType.type === "TSAnyKeyword") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            "Forbidden `<any>` assertion"
          );
        }
      },

      TSTypeReference(p) {
        const name = p.node.typeName && p.node.typeName.name;
        if (name === "Function") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            "Forbidden bare `Function` type — use explicit function signature `() => void` or specific parameters"
          );
        }
        if (name === "Object") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            "Forbidden bare `Object` type — use Record<string, T> or an explicit interface"
          );
        }
        if (name === "String" || name === "Number" || name === "Boolean" || name === "Symbol") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            `Forbidden boxed primitive type \`${name}\` — use lowercase \`${name.toLowerCase()}\``
          );
        }
        if (name === "Record") {
          const typeArgs = p.node.typeParameters && p.node.typeParameters.params;
          if (typeArgs && typeArgs.length > 1 && typeArgs[1].type === "TSAnyKeyword") {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              "Forbidden `Record<string, any>` — use `Record<string, unknown>` or a specific interface"
            );
          }
        }
      }
    });
  });
}

r.finish({
  fixTip: "Strict type safety enforced: define explicit types in src/types/ and avoid assertions/escapes.",
});
