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

function hasInlineObjectType(tsType) {
  if (!tsType) return false;
  if (tsType.type === "TSTypeLiteral" && tsType.members && tsType.members.length > 0) {
    return true;
  }
  if (tsType.type === "TSArrayType") {
    return hasInlineObjectType(tsType.elementType);
  }
  if (tsType.type === "TSUnionType" || tsType.type === "TSIntersectionType") {
    return tsType.types.some(hasInlineObjectType);
  }
  if (tsType.type === "TSOptionalType") {
    return hasInlineObjectType(tsType.typeAnnotation);
  }
  return false;
}

function checkType(node, relPath, context) {
  if (!node) return;
  const tsType = node.typeAnnotation || node;
  const target = tsType.typeAnnotation || tsType;
  if (hasInlineObjectType(target)) {
    r.addViolation(
      relPath,
      target.loc ? target.loc.start.line : 0,
      `Forbidden inline object type literal in ${context} — define and import a named type from src/types/ or a types file`
    );
  }
}

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.replace(/\\/g, "/");
    if (
      relPath.includes("components/ui/") ||
      relPath.endsWith(".d.ts") ||
      relPath.includes("sw.ts") ||
      relPath.includes("sw-network-retry") ||
      relPath.includes("constants/mock-")
    ) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    const isCodeFile = !isTypeFile(relPath);

    traverse(ast, {
      Function(p) {
        if (p.node.params) {
          p.node.params.forEach((param) => {
            checkType(param.typeAnnotation, relPath, "parameter or prop");
          });
        }
        if (p.node.returnType) {
          checkType(p.node.returnType, relPath, "function return type");
        }
      },

      TSFunctionType(p) {
        if (p.node.parameters) {
          p.node.parameters.forEach((param) => {
            checkType(param.typeAnnotation, relPath, "function signature parameter");
          });
        }
        if (p.node.typeAnnotation) {
          checkType(p.node.typeAnnotation, relPath, "function signature return type");
        }
      },

      TSMethodSignature(p) {
        if (p.node.parameters) {
          p.node.parameters.forEach((param) => {
            checkType(param.typeAnnotation, relPath, "method parameter");
          });
        }
        if (p.node.typeAnnotation) {
          checkType(p.node.typeAnnotation, relPath, "method return type");
        }
      },

      VariableDeclarator(p) {
        if (p.node.id && p.node.id.typeAnnotation) {
          checkType(p.node.id.typeAnnotation, relPath, "variable type annotation");
        }
      },

      TSTypeParameterInstantiation(p) {
        if (isCodeFile && p.node.params) {
          p.node.params.forEach((param) => {
            checkType(param, relPath, "generic type parameter");
          });
        }
      },

      TSInterfaceDeclaration(p) {
        if (isCodeFile) {
          const name = p.node.id ? p.node.id.name : "unnamed";
          r.addViolation(
            relPath,
            p.node.loc ? p.node.loc.start.line : 0,
            `Forbidden interface declaration "${name}" outside type files — define and import from src/types/ or feature types.ts/types folder`
          );
        }
      },

      TSTypeAliasDeclaration(p) {
        if (isCodeFile) {
          const name = p.node.id ? p.node.id.name : "unnamed";
          const isComponent = relPath.endsWith(".tsx");
          if (isComponent || hasInlineObjectType(p.node.typeAnnotation)) {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              `Forbidden type alias "${name}" in code file — define and import from src/types/ or feature types.ts/types folder`
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
