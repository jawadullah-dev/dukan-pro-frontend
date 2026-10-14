"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Button Form-Safety & Explicit Type Audit", { emoji: "🔘" });

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
    if (!code.includes("<button") && !code.includes("<Button")) return;

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      JSXOpeningElement(p) {
        const nameNode = p.node.name;
        if (nameNode.type !== "JSXIdentifier") return;
        const name = nameNode.name;

        if (name === "button" || name === "Button") {
          const attributes = p.node.attributes || [];

          // asChild renders as another element (e.g. <Link>), so type is not required on the wrapper
          const hasAsChild = attributes.some(
            (attr) => attr.type === "JSXAttribute" && attr.name && attr.name.name === "asChild"
          );
          if (hasAsChild) return;

          const typeAttr = attributes.find(
            (attr) => attr.type === "JSXAttribute" && attr.name && attr.name.name === "type"
          );

          if (!typeAttr) {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              `Missing explicit \`type\` attribute on <${name}> (defaults to type="submit", risking accidental form submission on Enter key)`,
              { fix: `Add explicit \`type="button"\` or \`type="submit"\`.` }
            );
          }
        }
      },
    });
  });
}

r.finish({
  fixTip: "Always specify explicit type on buttons (type='button' or type='submit') to prevent unintended form submissions.",
});
