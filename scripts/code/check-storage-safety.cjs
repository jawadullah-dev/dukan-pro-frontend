"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Web Storage & SSR Hydration Safety Audit", { emoji: "🛡️" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    // Exempt shadcn primitives and Next generated types
    if (relPath.includes("components/ui/") || relPath.includes("next-env.d.ts")) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    const hasStorage = code.includes("localStorage") || code.includes("sessionStorage");
    const hasJsonParse = code.includes("JSON.parse");

    if (!hasStorage && !hasJsonParse) return;

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    const isClientComponent = code.includes("'use client'") || code.includes('"use client"');
    const isAppRoute = relPath.startsWith("src/app/") && !relPath.startsWith("src/app/api/");

    traverse(ast, {
      MemberExpression(p) {
        const obj = p.node.object;
        if (
          obj.type === "Identifier" &&
          (obj.name === "localStorage" || obj.name === "sessionStorage")
        ) {
          const line = p.node.loc ? p.node.loc.start.line : 0;

          // 1. Storage access in a Server Component
          if (isAppRoute && !isClientComponent) {
            r.addViolation(
              relPath,
              line,
              `Forbidden \`${obj.name}\` in Server Component — browser storage cannot be accessed during SSR`,
              { fix: "Move storage access into a Client Component with 'use client' or inside useEffect." }
            );
            return;
          }

          // 2. Storage access at module top level (outside any function/class)
          let inFunction = false;
          let curr = p;
          while (curr) {
            if (
              curr.isFunctionDeclaration() ||
              curr.isFunctionExpression() ||
              curr.isArrowFunctionExpression() ||
              curr.isClassMethod()
            ) {
              inFunction = true;
              break;
            }
            curr = curr.parentPath;
          }

          if (!inFunction) {
            r.addViolation(
              relPath,
              line,
              `Forbidden top-level \`${obj.name}\` access — executing storage at module load crashes SSR`,
              { fix: "Wrap storage access inside a function or useEffect with a typeof window !== 'undefined' check." }
            );
          }
        }
      },

      CallExpression(p) {
        const callee = p.node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "JSON" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "parse"
        ) {
          // Verify JSON.parse is wrapped in a try/catch
          let insideTry = false;
          let curr = p;
          while (curr) {
            if (curr.isTryStatement()) {
              insideTry = true;
              break;
            }
            curr = curr.parentPath;
          }

          if (!insideTry) {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              "Unprotected `JSON.parse()` — parsing raw strings without try/catch can crash the application on invalid payloads",
              { fix: "Wrap JSON.parse() inside a try/catch block with fallback handling." }
            );
          }
        }
      },
    });
  });
}

r.finish({
  fixTip: "Defensive Programming: Guard browser storage against SSR and always protect JSON.parse with try/catch.",
});
