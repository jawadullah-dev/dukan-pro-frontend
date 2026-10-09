"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Nested/Inline Type Literals Audit", { emoji: "📦" });

const srcRoot = path.join(__dirname, "../../src");

function checkTypeAnnotation(node, relPath) {
  if (!node || !node.typeAnnotation) return;
  const tsType = node.typeAnnotation.typeAnnotation || node.typeAnnotation;
  if (tsType && tsType.type === "TSTypeLiteral") {
    // Has inline properties like { foo: string }
    if (tsType.members && tsType.members.length > 0) {
      r.addViolation(
        relPath,
        tsType.loc ? tsType.loc.start.line : 0,
        "Forbidden inline object type literal in parameter or prop — define and import a named type from src/types/",
      );
    }
  }
}

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    if (relPath.includes("components/ui")) return;

    const code = fs.readFileSync(absPath, "utf8");
    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      Function(p) {
        // Check parameters of functions, arrow functions, methods
        if (p.node.params) {
          p.node.params.forEach((param) => {
            checkTypeAnnotation(param, relPath);
          });
        }
      },

      TSFunctionType(p) {
        if (p.node.parameters) {
          p.node.parameters.forEach((param) => {
            checkTypeAnnotation(param, relPath);
          });
        }
      },

      TSMethodSignature(p) {
        if (p.node.parameters) {
          p.node.parameters.forEach((param) => {
            checkTypeAnnotation(param, relPath);
          });
        }
      }
    });
  });
}

r.finish({
  fixTip: "Move inline object shapes `{ key: type }` to dedicated interfaces or types in src/types/.",
});
