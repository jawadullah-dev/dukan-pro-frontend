"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Nested/Inline Type Literals Audit", { emoji: "📦" });

const ROOT = path.resolve(__dirname, "../..");
const srcRoot = path.join(ROOT, "src");

function isTypeFile(relPath) {
  const norm = relPath.replace(/\\/g, "/");
  return (
    norm.includes("/types/") ||
    norm.endsWith("/types.ts") ||
    norm.endsWith(".types.ts") ||
    norm.endsWith(".d.ts")
  );
}

function checkTypeAnnotation(node, relPath) {
  if (!node || !node.typeAnnotation) return;
  const tsType = node.typeAnnotation.typeAnnotation || node.typeAnnotation;
  if (tsType && tsType.type === "TSTypeLiteral") {
    if (tsType.members && tsType.members.length > 0) {
      r.addViolation(
        relPath,
        tsType.loc ? tsType.loc.start.line : 0,
        "Forbidden inline object type literal in parameter or prop — define and import a named type from src/types/ or a types file"
      );
    }
  }
}

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.replace(/\\/g, "/");
    if (relPath.includes("components/ui/")) return;

    const code = fs.readFileSync(absPath, "utf8");
    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    const isComponentFile =
      relPath.includes("components/") ||
      (relPath.includes("app/") && relPath.endsWith(".tsx"));

    traverse(ast, {
      Function(p) {
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
      },

      TSInterfaceDeclaration(p) {
        if (isComponentFile && !isTypeFile(relPath)) {
          const name = p.node.id ? p.node.id.name : "unnamed";
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            `Forbidden interface declaration "${name}" in component file — define and import from src/types/ or feature types.ts/types folder`
          );
        }
      },

      TSTypeAliasDeclaration(p) {
        if (isComponentFile && !isTypeFile(relPath)) {
          const name = p.node.id ? p.node.id.name : "unnamed";
          // Allow internal utility helpers or PageProps on route pages if needed, but flag component props
          if (name !== "PageProps") {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              `Forbidden type alias "${name}" in component file — define and import from src/types/ or feature types.ts/types folder`
            );
          }
        }
      }
    });
  });
}

r.finish({
  fixTip: "Move all interfaces, component props, and object shapes to dedicated files in src/types/ or feature types.ts files.",
});
