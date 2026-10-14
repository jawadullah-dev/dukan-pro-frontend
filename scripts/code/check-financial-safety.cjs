"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Financial Precision & Paisa Safety Audit", { emoji: "💰" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");

    // Exempt files where currency conversion and precision logic is defined
    if (
      relPath.includes("lib/money") ||
      relPath.includes("lib/dukaan/numbers.ts") ||
      relPath.includes("lib/dukaan/operations.ts") ||
      relPath.includes("constants/mock-api")
    ) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    if (!code.includes("100") && !code.includes(".toFixed(")) return;

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      BinaryExpression(p) {
        // Flag raw multiplication or division by 100 on price/amount/rupee variables
        const isMulOrDiv = p.node.operator === "*" || p.node.operator === "/";
        if (!isMulOrDiv) return;

        const left = p.node.left;
        const right = p.node.right;

        const has100 =
          (right.type === "NumericLiteral" && right.value === 100) ||
          (left.type === "NumericLiteral" && left.value === 100);

        if (has100) {
          const varName = left.name || (left.property && left.property.name) || "";
          const isFinancialName =
            /amount|price|paisa|rupee|cost|total|balance|shortfall|rate/i.test(varName);

          if (isFinancialName) {
            const op = p.node.operator === "*" ? "toPaisa" : "fromPaisa";
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              `Forbidden raw float currency calculation (\`${varName} ${p.node.operator} 100\`) — use \`${op}()\` from @/lib/money`,
              { fix: `Import \`${op}\` from '@/lib/money' to prevent floating-point rounding errors.` }
            );
          }
        }
      },
    });
  });
}

r.finish({
  fixTip: "Pakistani Rupee financial safety: Store all money in integer Paisa. Use toPaisa(), fromPaisa(), and formatPkr() from @/lib/money.",
});
