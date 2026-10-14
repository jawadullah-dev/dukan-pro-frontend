"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Catch Block & Error Handling Audit", { emoji: "🛡️" });

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
    if (!code.includes("catch")) return;

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      CatchClause(p) {
        const body = p.node.body;
        const line = p.node.loc ? p.node.loc.start.line : 0;

        // 1. Completely empty catch block
        if (!body || !body.body || body.body.length === 0) {
          r.addViolation(
            relPath,
            line,
            "Empty catch block — catch must handle the error or provide an explicit fallback",
            { fix: "Handle error with Sentry, toast, error state, or return an explicit fallback." }
          );
          return;
        }

        // 2. Catch block with only `void 0` or void expressions
        const hasVoidExpr = body.body.some((stmt) => {
          if (stmt.type === "ExpressionStatement") {
            const expr = stmt.expression;
            if (expr.type === "UnaryExpression" && expr.operator === "void") {
              return true;
            }
          }
          return false;
        });

        if (hasVoidExpr) {
          r.addViolation(
            relPath,
            line,
            "Forbidden `void 0` statement in catch block — handle error properly with Sentry, fallback, or state",
            { fix: "Replace void 0 with Sentry.captureException, fallback return, or state assignment." }
          );
        }
      },
    });
  });
}

r.finish({
  fixTip: "Catch blocks must properly handle exceptions (e.g. Sentry.captureException, fallbacks, or state updates).",
});
