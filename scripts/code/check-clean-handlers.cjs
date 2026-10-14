"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Clean Named Handlers & Inline JSX Closure Audit", { emoji: "🎯" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(tsx|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    if (relPath.includes("components/ui/") || relPath.includes("components/kbar/")) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    if (!code.includes("on")) return;

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      JSXAttribute(p) {
        const attrName = p.node.name && p.node.name.name;
        if (!attrName || !/^on[A-Z]/.test(attrName)) return;

        const container = p.node.value;
        if (!container || container.type !== "JSXExpressionContainer") return;
        const expr = container.expression;
        if (
          !expr ||
          (expr.type !== "ArrowFunctionExpression" && expr.type !== "FunctionExpression")
        ) {
          return;
        }

        const line = p.node.loc ? p.node.loc.start.line : 0;

        let hasTimerOrRaf = false;
        p.traverse({
          CallExpression(callPath) {
            const callee = callPath.node.callee;
            if (
              callee.type === "Identifier" &&
              ["requestAnimationFrame", "setTimeout", "setInterval"].includes(callee.name)
            ) {
              hasTimerOrRaf = true;
            }
          }
        });

        if (hasTimerOrRaf) {
          r.addViolation(
            relPath,
            line,
            `Inline \`${attrName}\` contains a timer or animation frame call (\`requestAnimationFrame\`, \`setTimeout\`, or \`setInterval\`).`,
            { fix: "Extract to a dedicated named handler function or hook." }
          );
        }

        if (expr.body && expr.body.type === "BlockStatement") {
          const stmtCount = expr.body.body.length;
          if (stmtCount > 1) {
            r.addViolation(
              relPath,
              line,
              `Inline \`${attrName}\` contains ${stmtCount} statements in JSX. Multi-statement logic must not be inlined in JSX.`,
              { fix: `Extract to a dedicated named handler function (e.g. \`handle${attrName.slice(2)}\`).` }
            );
          }
        }
      }
    });
  });
}

r.finish();
