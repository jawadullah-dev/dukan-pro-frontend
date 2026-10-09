"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Hardcoded text audit", { emoji: "📖" });

const EXCLUDE_DIRS = ["data", "assets", "types", "styles", "config", "constants", "ui", "__tests__"];
const SCAN_EXTS = [".tsx", ".ts", ".jsx", ".js"];

const STRING_PROPS = new Set([
  "placeholder", "title", "label", "message", "description",
  "subtitle", "hint", "header", "buttonText", "errorMessage",
  "successMessage", "helperText", "emptyText", "accessibilityLabel",
  "accessibilityHint", "tooltip", "caption", "noDataText",
  "confirmText", "cancelText", "okText", "children",
]);

const IGNORED_PATTERNS = [
  /^$/,
  /^\s+$/,
  /^[a-z][a-zA-Z0-9]*$/,
  /^[A-Z_]{2,}$/,
  /^[a-z_\-./:\\@#%]+$/,
  /^\d[\d.,\s%pxremvhw]*$/,
  /^#[0-9a-fA-F]{3,8}$/,
  /^rgba?\(/,
  /^https?:\/\//,
  /^[a-z]+:[a-z]/,
  /^\./,
  /^src\//,
  /^icon-/i,
  /^test-/i,
];

function isIgnored(text) {
  const t = text.trim();
  if (!t || t.length < 2) return true;
  if (!/[a-zA-Z]/.test(t)) return true;
  if ((t.match(/[a-zA-Z]/g) || []).length < 2) return true;
  return IGNORED_PATTERNS.some((p) => p.test(t));
}

const roots = [path.join(__dirname, "../src"), path.join(__dirname, "../app")].filter((p) =>
  fs.existsSync(p),
);

roots.forEach((srcRoot) => {
  walkTree(srcRoot, (absPath, relPath) => {
    if (!SCAN_EXTS.some((ext) => absPath.endsWith(ext))) return;
    if (EXCLUDE_DIRS.some((dir) => absPath.includes(`${path.sep}${dir}${path.sep}`))) return;

    const code = fs.readFileSync(absPath, "utf8");
    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    function report(label, text, node) {
      const t = (text || "").trim();
      if (!t || isIgnored(t)) return;
      r.addViolation(relPath, node.loc ? node.loc.start.line : 0, `Hardcoded text [${label}]: "${t.substring(0, 40)}"`);
    }

    traverse(ast, {
      JSXText(nodePath) {
        const text = nodePath.node.value.trim();
        if (text) report("JSX Text", text, nodePath.node);
      },
      JSXExpressionContainer(nodePath) {
        const expr = nodePath.node.expression;
        if (expr.type === "StringLiteral") {
          report("JSX Expression", expr.value, nodePath.node);
        }
      },
      JSXAttribute(nodePath) {
        const attrName = nodePath.node.name && nodePath.node.name.name;
        const val = nodePath.node.value;
        if (!val) return;

        if (val.type === "StringLiteral") {
          if (STRING_PROPS.has(attrName)) {
            report(`Prop: ${attrName}`, val.value, nodePath.node);
          }
        } else if (val.type === "JSXExpressionContainer") {
          const expr = val.expression;
          if (expr.type === "StringLiteral" && STRING_PROPS.has(attrName)) {
            report(`Prop: ${attrName}`, expr.value, nodePath.node);
          }
        }
      },
      CallExpression(nodePath) {
        const callee = nodePath.node.callee;
        const args = nodePath.node.arguments;
        const isAlertCall =
          (callee.type === "MemberExpression" && callee.object.name === "Alert" && callee.property.name === "alert") ||
          (callee.type === "Identifier" && ["showToast", "showMessage", "showError", "showSuccess", "toast"].includes(callee.name));

        if (isAlertCall) {
          args.forEach((arg) => {
            if (arg.type === "StringLiteral") {
              report("Alert/Toast", arg.value, nodePath.node);
            }
          });
        }
      },
    });
  });
});

r.finish({
  fixTip: "Move all user-visible strings to next-intl message files (messages/en.json and messages/ur.json) and use useTranslations() or getTranslations().",
});