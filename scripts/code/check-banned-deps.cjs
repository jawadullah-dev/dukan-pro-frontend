"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Prohibited Packages & Invariants Audit", { emoji: "🚫" });

const srcRoot = path.join(__dirname, "../../src");

const BANNED_PACKAGES = {
  axios: "Use native `fetch` via `apiRequest<T>()` from `@/lib/api/client`.",
  "react-hook-form": "Use TanStack Form v1 with `useAppForm` from `@/lib/form`.",
  moment: "Use native `Date` methods or `@/lib/dates`.",
  dayjs: "Use native `Date` methods or `@/lib/dates`.",
  lodash: "Use standard ES2024 array/object methods.",
  underscore: "Use standard ES2024 array/object methods.",
  bcrypt: "Do not hash passwords on the client. Send credentials via HTTPS directly to backend.",
  bcryptjs: "Do not hash passwords on the client. Send credentials via HTTPS directly to backend.",
};

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
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

    traverse(ast, {
      ImportDeclaration(p) {
        const source = p.node.source.value.toLowerCase();
        for (const [pkg, reason] of Object.entries(BANNED_PACKAGES)) {
          if (source === pkg || source.startsWith(`${pkg}/`)) {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              `Forbidden package "${source}" is imported — ${reason}`
            );
          }
        }
      },

      JSXOpeningElement(p) {
        // Guard: target="_blank" must include rel="noopener noreferrer"
        const tag = p.node.name.name;
        if (tag === "a" || tag === "Link") {
          let hasTargetBlank = false;
          let hasSafeRel = false;

          p.node.attributes.forEach((attr) => {
            if (attr.type === "JSXAttribute" && attr.name && attr.name.name === "target") {
              if (attr.value && attr.value.value === "_blank") {
                hasTargetBlank = true;
              }
            }
            if (attr.type === "JSXAttribute" && attr.name && attr.name.name === "rel") {
              const relVal = attr.value && attr.value.value;
              if (
                relVal &&
                relVal.includes("noopener") &&
                relVal.includes("noreferrer")
              ) {
                hasSafeRel = true;
              }
            }
          });

          if (hasTargetBlank && !hasSafeRel) {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              'Security vulnerability: `target="_blank"` link is missing `rel="noopener noreferrer"`'
            );
          }
        }
      },
    });
  });
}

r.finish({
  fixTip: "Follow the project tech stack strictly: TanStack Form (no RHF), apiRequest (no axios), and secure HTTPS credential transmission.",
});
