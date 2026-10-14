"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Console & Debugging Leftovers Audit", { emoji: "🛑" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    const code = fs.readFileSync(absPath, "utf8");

    // Fast check before AST parsing
    if (
      !code.includes("console.") &&
      !code.includes("debugger") &&
      !code.includes("alert(") &&
      !code.includes("confirm(") &&
      !code.includes("prompt(")
    ) {
      return;
    }

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      DebuggerStatement(p) {
        r.addViolation(
          relPath,
          p.node.loc ? p.node.loc.start.line : 0,
          "Forbidden `debugger` statement — remove before committing code"
        );
      },

      CallExpression(p) {
        const callee = p.node.callee;

        // console.* calls
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "console" &&
          callee.property.type === "Identifier"
        ) {
          const method = callee.property.name;
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            `Forbidden \`console.${method}()\` call — use proper logger or remove debugging leftovers`,
            { fix: "Use Sentry/instrumentation or remove the console call." }
          );
        }

        // alert / confirm / prompt
        if (
          callee.type === "Identifier" &&
          (callee.name === "alert" || callee.name === "confirm" || callee.name === "prompt")
        ) {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            `Forbidden \`${callee.name}()\` browser prompt — use accessible UI dialogs (shadcn/ui AlertDialog)`,
            { fix: "Replace with Dialog or AlertDialog component." }
          );
        }
      },
    });
  });
}

r.finish({
  fixTip: "Zero console or debugger statements are permitted in production code.",
});
