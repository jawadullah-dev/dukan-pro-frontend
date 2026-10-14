"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("React 19 & Next.js Hydration Purity Audit", { emoji: "⚛️" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(tsx|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    // Exempt shadcn primitives and Next generated types
    if (relPath.includes("components/ui/") || relPath.includes("next-env.d.ts")) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    if (
      !code.includes("Math.random") &&
      !code.includes("crypto.randomUUID") &&
      !code.includes("document.")
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
      CallExpression(p) {
        const callee = p.node.callee;
        const line = p.node.loc ? p.node.loc.start.line : 0;

        // Check if expression is inside an effect or event handler
        let isSafeContext = false;
        let curr = p;
        while (curr) {
          // Inside useEffect / useLayoutEffect / useMemo / useCallback
          if (
            curr.isCallExpression() &&
            curr.node.callee.type === "Identifier" &&
            (curr.node.callee.name === "useEffect" ||
              curr.node.callee.name === "useLayoutEffect" ||
              curr.node.callee.name === "useCallback" ||
              curr.node.callee.name === "useMemo")
          ) {
            isSafeContext = true;
            break;
          }
          // Inside a function starting with "handle" or "on"
          if (
            (curr.isFunctionDeclaration() || curr.isFunctionExpression() || curr.isArrowFunctionExpression()) &&
            curr.parentPath &&
            curr.parentPath.isVariableDeclarator() &&
            curr.parentPath.node.id.type === "Identifier" &&
            (curr.parentPath.node.id.name.startsWith("handle") || curr.parentPath.node.id.name.startsWith("on"))
          ) {
            isSafeContext = true;
            break;
          }
          curr = curr.parentPath;
        }

        // 1. Math.random() in component render body
        if (
          callee.type === "MemberExpression" &&
          callee.object.name === "Math" &&
          callee.property.name === "random" &&
          !isSafeContext
        ) {
          r.addViolation(
            relPath,
            line,
            "Non-deterministic `Math.random()` in render body — causes SSR hydration mismatch. Use deterministic values or move into useEffect.",
            { fix: "Move random generation into an effect, event handler, or use deterministic keys." }
          );
        }

        // 2. crypto.randomUUID() in render body
        if (
          callee.type === "MemberExpression" &&
          callee.property.name === "randomUUID" &&
          !isSafeContext
        ) {
          r.addViolation(
            relPath,
            line,
            "Non-deterministic `crypto.randomUUID()` in render body — generates different IDs during SSR vs hydration.",
            { fix: "Generate IDs inside event handlers (e.g. form submit) or state initializers." }
          );
        }
      },
    });
  });
}

r.finish({
  fixTip: "Component Purity: Keep component render bodies pure and deterministic for flawless SSR hydration.",
});
