"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Data Fetching Encapsulation & Service Separation Audit", { emoji: "⚡" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(tsx|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");

    // Only inspect presentation components (features/*/components and src/components)
    const isComponent =
      relPath.includes("/components/") &&
      !relPath.includes("components/ui/") &&
      !relPath.includes("components/data-table/");

    if (!isComponent) return;

    const code = fs.readFileSync(absPath, "utf8");
    if (!code.includes("fetch(") && !code.includes("apiRequest(") && !code.includes("appFetch(")) {
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

        // Raw fetch in component
        if (callee.type === "Identifier" && callee.name === "fetch") {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            "Forbidden raw `fetch()` call inside UI component — encapsulate HTTP calls in `features/*/api/service.ts`",
            { fix: "Move the endpoint call to the feature's service.ts and consume it via TanStack Query." }
          );
        }

        // Direct apiRequest in component
        if (
          callee.type === "Identifier" &&
          (callee.name === "apiRequest" || callee.name === "appFetch")
        ) {
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            `Forbidden direct \`${callee.name}()\` call inside UI component — use custom React Query hooks/options`,
            { fix: "Components must not directly orchestrate HTTP clients; use queryOptions or mutation hooks." }
          );
        }
      },
    });
  });
}

r.finish({
  fixTip: "Presentation components must remain pure UI; all networking must be encapsulated in dedicated feature services and React Query hooks.",
});
