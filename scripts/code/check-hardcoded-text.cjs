"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Hardcoded Text & Translation Audit", { emoji: "📖" });

const ROOT = path.resolve(__dirname, "../..");
const srcRoot = path.join(ROOT, "src");

const SCAN_EXTS = new Set([".tsx", ".ts", ".jsx", ".js"]);

const EXCLUDE_PATHS = [
  "components/ui/",
  "styles/",
  "types/",
  "config/",
  "src/constants/",
  "i18n/",
  "__tests__/",
  ".test.",
  ".spec.",
  ".d.ts"
];

const STRING_PROPS = new Set([
  "placeholder",
  "title",
  "label",
  "message",
  "description",
  "subtitle",
  "hint",
  "header",
  "buttonText",
  "errorMessage",
  "successMessage",
  "helperText",
  "emptyText",
  "accessibilityLabel",
  "accessibilityHint",
  "tooltip",
  "caption",
  "noDataText",
  "confirmText",
  "cancelText",
  "okText",
  "heading",
  "subheading",
  "summary",
  "badge",
  "badgeText",
  "statusText",
  "alt",
  "aria-label",
  "aria-placeholder",
  "aria-description",
  "aria-roledescription",
  "text",
  "cta",
  "ctaText",
  "actionLabel",
  "submitText",
  "saveText",
  "content",
  "help",
  "helpText",
  "alert",
  "notice",
  "warning",
  "modalTitle",
  "dialogTitle",
  "emptyTitle",
  "emptyDescription"
]);

// Ignored non-human-text tokens
const IGNORED_EXACT = new Set([
  "submit", "reset", "button", "text", "password", "email", "number", "tel", "search",
  "default", "outline", "destructive", "ghost", "secondary", "link",
  "sm", "lg", "md", "xl", "xs", "icon",
  "ltr", "rtl", "auto",
  "asc", "desc",
  "horizontal", "vertical",
  "dialog", "sheet", "alert",
  "true", "false", "undefined", "null"
]);

const TECHNICAL_PATTERNS = [
  /^$/,
  /^\s+$/,
  /^\d[\d.,\s%pxremvhw]*$/,          // Pure numbers, CSS units, percentages
  /^#[0-9a-fA-F]{3,8}$/,              // Hex colors
  /^rgba?\(/,                         // RGB colors
  /^https?:\/\//,                     // URLs
  /^\/[a-zA-Z0-9_\-\.\/]*$/,          // URL/route paths (e.g. /dashboard/purchases)
  /^[A-Z0-9_]{2,}$/,                  // Enums & constants (e.g. ACTIVE, CANCELLED, PKR, USD)
  /^[a-z]+:[a-z]/,                    // Schemes (e.g. mailto:, tel:)
  /^[a-z0-9_\-]+(?:\.[a-z0-9_\-]+)+$/,// Translation keys or dot notation (e.g. pages.dashboard.title, common.cancel)
  /^icon-[a-z0-9_\-]+$/i,             // Icon names
  /^[+*\-/_=><!|&%~^.:;,?()[\]{}#@]+$/ // Pure punctuation / symbols
];

function isIgnored(text) {
  const t = text.trim();
  if (!t || t.length < 2) return true;
  if (!/[a-zA-Z]/.test(t)) return true;
  if (IGNORED_EXACT.has(t.toLowerCase())) return true;
  return TECHNICAL_PATTERNS.some((p) => p.test(t));
}

function shouldSkipFile(relPath) {
  const norm = relPath.replace(/\\/g, "/");
  return EXCLUDE_PATHS.some((p) => norm.includes(p));
}

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    const ext = path.extname(absPath);
    if (!SCAN_EXTS.has(ext)) return;

    const relPath = relPathRaw.replace(/\\/g, "/");
    if (shouldSkipFile(relPath)) return;

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
      r.addViolation(
        relPath,
        node && node.loc ? node.loc.start.line : 0,
        `Hardcoded text [${label}]: "${t.length > 50 ? t.substring(0, 47) + '...' : t}"`
      );
    }

    function checkCallExpressionStrings(args, label) {
      function inspect(arg) {
        if (!arg) return;
        if (arg.type === "StringLiteral") {
          report(label, arg.value, arg);
        } else if (arg.type === "TemplateLiteral") {
          const raw = arg.quasis.map((q) => q.value.raw).join(" ").trim();
          if (raw) report(label, raw, arg);
        } else if (arg.type === "LogicalExpression" || arg.type === "BinaryExpression") {
          inspect(arg.left);
          inspect(arg.right);
        } else if (arg.type === "ConditionalExpression") {
          inspect(arg.consequent);
          inspect(arg.alternate);
        }
      }
      args.forEach(inspect);
    }

    function inspectPropExpression(expr, propName) {
      if (!expr) return;
      if (expr.type === "ArrayExpression") {
        expr.elements.forEach((el) => inspectPropExpression(el, propName));
      } else if (expr.type === "ObjectExpression") {
        expr.properties.forEach((prop) => {
          if (prop.type === "ObjectProperty") {
            const keyName = prop.key && (prop.key.name || prop.key.value);
            if (keyName && STRING_PROPS.has(keyName)) {
              if (prop.value.type === "StringLiteral") {
                report(`Prop ${propName}.[${keyName}]`, prop.value.value, prop.value);
              } else if (prop.value.type === "TemplateLiteral") {
                const raw = prop.value.quasis.map((q) => q.value.raw).join(" ").trim();
                if (raw) report(`Prop ${propName}.[${keyName}]`, raw, prop.value);
              }
            } else if (prop.value) {
              inspectPropExpression(prop.value, `${propName}.${keyName || ""}`);
            }
          }
        });
      }
    }

    traverse(ast, {
      JSXText(nodePath) {
        const text = nodePath.node.value.trim();
        if (text) report("JSX Text", text, nodePath.node);
      },

      JSXExpressionContainer(nodePath) {
        const parent = nodePath.parent;
        // Skip JSX attributes (handled by JSXAttribute)
        if (parent && parent.type === "JSXAttribute") return;

        const expr = nodePath.node.expression;
        if (expr.type === "StringLiteral") {
          report("JSX Expression", expr.value, nodePath.node);
        } else if (expr.type === "TemplateLiteral") {
          const raw = expr.quasis.map((q) => q.value.raw).join(" ").trim();
          if (raw) report("JSX Template", raw, nodePath.node);
        }
      },

      JSXAttribute(nodePath) {
        const attrName = nodePath.node.name && nodePath.node.name.name;
        if (!attrName) return;

        const val = nodePath.node.value;
        if (!val) return;

        if (STRING_PROPS.has(attrName)) {
          if (val.type === "StringLiteral") {
            report(`Prop: ${attrName}`, val.value, nodePath.node);
          } else if (val.type === "JSXExpressionContainer") {
            const expr = val.expression;
            if (expr.type === "StringLiteral") {
              report(`Prop: ${attrName}`, expr.value, nodePath.node);
            } else if (expr.type === "TemplateLiteral") {
              const raw = expr.quasis.map((q) => q.value.raw).join(" ").trim();
              if (raw) report(`Prop: ${attrName}`, raw, nodePath.node);
            } else if (expr.type === "LogicalExpression" || expr.type === "BinaryExpression") {
              if (expr.right && expr.right.type === "StringLiteral") {
                report(`Prop: ${attrName}`, expr.right.value, nodePath.node);
              }
            }
          }
        }

        // Recursively inspect objects & arrays passed as props (e.g. options={[{ label: "..." }]})
        if (val.type === "JSXExpressionContainer") {
          inspectPropExpression(val.expression, attrName);
        }
      },

      CallExpression(nodePath) {
        const callee = nodePath.node.callee;
        const args = nodePath.node.arguments;

        // Skip translation calls (t('key'), t.raw('key'), t.rich('key'))
        if (
          callee.type === "Identifier" && (callee.name === "t" || callee.name === "formatPkr")
        ) {
          return;
        }
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "t"
        ) {
          return;
        }

        // Check toast / alert calls
        const isToastMember =
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "toast";

        const isAlertMember =
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "Alert" &&
          callee.property.name === "alert";

        const isToastOrAlertFunc =
          callee.type === "Identifier" &&
          ["showToast", "showMessage", "showError", "showSuccess", "toast", "alert", "confirm", "prompt"].includes(
            callee.name
          );

        const isWindowDialog =
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "window" &&
          ["alert", "confirm", "prompt"].includes(callee.property.name);

        if (isToastMember || isAlertMember || isToastOrAlertFunc || isWindowDialog) {
          checkCallExpressionStrings(args, "Toast/Alert/Confirm");
        }
      }
    });
  });
}

r.finish({
  fixTip: "Move all user-visible strings to next-intl message files (messages/en.json, messages/ur.json, messages/ps.json) and use useTranslations() / useT().",
});