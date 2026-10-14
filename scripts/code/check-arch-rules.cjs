"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Architectural Compliance Audit", { emoji: "🏛️" });

const roots = [path.join(__dirname, "../../src"), path.join(__dirname, "../../app")].filter((p) =>
  fs.existsSync(p),
);

const RTL_UNSAFE_REGEX = /\b(?:ml|mr|pl|pr|rounded-l|rounded-r|border-l|border-r)-[a-zA-Z0-9_\-\.]+\b|\btext-(?:left|right)\b/;
const HEX_COLOR_REGEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;

function extractClassStrings(node, results = []) {
  if (!node) return results;
  if (node.type === "StringLiteral") {
    results.push({ value: node.value, line: node.loc ? node.loc.start.line : 0 });
  } else if (node.type === "TemplateLiteral") {
    node.quasis.forEach((q) => {
      if (q.value.raw) {
        results.push({ value: q.value.raw, line: q.loc ? q.loc.start.line : 0 });
      }
    });
    node.expressions.forEach((expr) => extractClassStrings(expr, results));
  } else if (node.type === "JSXExpressionContainer") {
    extractClassStrings(node.expression, results);
  } else if (node.type === "CallExpression") {
    node.arguments.forEach((arg) => extractClassStrings(arg, results));
  } else if (node.type === "LogicalExpression" || node.type === "BinaryExpression") {
    extractClassStrings(node.left, results);
    extractClassStrings(node.right, results);
  } else if (node.type === "ConditionalExpression") {
    extractClassStrings(node.consequent, results);
    extractClassStrings(node.alternate, results);
  } else if (node.type === "ArrayExpression") {
    node.elements.forEach((el) => extractClassStrings(el, results));
  }
  return results;
}

roots.forEach((root) => {
  walkTree(root, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    const code = fs.readFileSync(absPath, "utf8");
    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    const isUi = relPath.includes("components/ui");
    const isStyle = relPath.includes("styles");

    traverse(ast, {
      ThrowStatement(p) {
        const arg = p.node.argument;
        if (arg.type === "NewExpression" && arg.callee.name === "Error") {
          if (!isUi) {
            r.addViolation(relPath, p.node.loc.start.line, "Forbidden generic `throw new Error()` — use custom domain errors (e.g. ValidationError, AppError)");
          }
        }
      },

      MemberExpression(p) {
        if (
          p.node.object.type === "Identifier" &&
          p.node.object.name === "process" &&
          p.node.property.type === "Identifier" &&
          p.node.property.name === "env"
        ) {
          const isAllowedEnv =
            relPath.includes("config") ||
            relPath.includes("constants/api.ts") ||
            relPath.includes("constants/index.ts") ||
            relPath.includes("instrumentation") ||
            relPath.includes("sw.ts") ||
            relPath.includes("sw-network-retry") ||
            relPath.includes("next.config");

          if (!isAllowedEnv) {
            r.addViolation(
              relPath,
              p.node.loc.start.line,
              "Forbidden direct `process.env` access — use centralized config in src/config/env.ts",
            );
          }
        }
      },

      JSXAttribute(p) {
        if (p.node.name.name === "style") {
          if (isUi) return;

          const value = p.node.value;
          const isDynamicProgressStyle =
            value?.type === "JSXExpressionContainer" &&
            value.expression?.type === "ObjectExpression" &&
            value.expression.properties?.every((prop) => {
              const key = prop.key?.name || prop.key?.value;
              return key === "width" || key === "height";
            });

          if (!isDynamicProgressStyle) {
            r.addViolation(
              relPath,
              p.node.loc.start.line,
              "Forbidden inline `style` prop — use Tailwind CSS classes or CSS modules (exception: dynamic width/height for progress bars)",
            );
          }
        }

        // Check RTL unsafe classes and hex colors in className
        if (p.node.name.name === "className" && !isUi) {
          const strings = extractClassStrings(p.node.value);
          strings.forEach(({ value: str, line }) => {
            if (!str) return;
            const rtlMatch = str.match(RTL_UNSAFE_REGEX);
            if (rtlMatch) {
              r.addViolation(
                relPath,
                line || p.node.loc.start.line,
                `Forbidden RTL-unsafe class in className ("${rtlMatch[0]}") — use logical utilities (ms-, me-, ps-, pe-, start-, end-, text-start, text-end)`,
              );
            }
            const hexMatch = str.match(HEX_COLOR_REGEX);
            if (hexMatch && !isStyle) {
              r.addViolation(
                relPath,
                line || p.node.loc.start.line,
                `Forbidden hardcoded hex color in className ("${hexMatch[0]}") — use semantic theme tokens`,
              );
            }
          });
        }
      },

      TSAsExpression(p) {
        if (p.node.typeAnnotation.type === "TSAnyKeyword") {
          r.addViolation(relPath, p.node.loc.start.line, "Forbidden `as any` assertion — use proper typing or unknown narrowing");
        }
      },

      TSTypeReference(p) {
        if (p.node.typeName.name === "Record") {
          const typeArgs = p.node.typeParameters && p.node.typeParameters.params;
          if (typeArgs && typeArgs.length > 1 && typeArgs[1].type === "TSAnyKeyword") {
            r.addViolation(relPath, p.node.loc.start.line, "Forbidden `Record<string, any>` — use `Record<string, unknown>` or a specific interface");
          }
        }
      }
    });
  });
});

r.finish({
  fixTip: "Follow the project's strict architectural guidelines. Centralize config, support RTL, and use semantic tokens.",
});
