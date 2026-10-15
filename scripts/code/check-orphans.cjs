"use strict";

/**
 * check-orphans.cjs — Zombie / Orphan Component & Hook Scanner
 *
 * Scans the entire project starting from Next.js entry points (pages, layouts,
 * route handlers, middleware, auth, instrumentation) to identify any:
 *   1. Orphan components in src/features/ or src/components/ that are never
 *      mounted, imported, or rendered anywhere in the application.
 *   2. Orphan hooks in src/hooks/ or feature hooks that are never imported.
 *
 * Excludes:
 *   - src/components/ui/ (design system / primitive kit)
 *   - src/styles/
 *   - test and mock files
 */

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const ROOT = path.resolve(__dirname, "../..");
const srcRoot = path.join(ROOT, "src");

const r = new Reporter("Orphan Components & Hooks Audit", { emoji: "🧟" });

function normPath(p) {
  return path.normalize(path.resolve(p)).toLowerCase().replace(/\\/g, "/");
}

function resolveModule(fromFile, source) {
  let target;
  if (source.startsWith("@/")) {
    target = path.join(srcRoot, source.slice(2));
  } else if (source.startsWith(".")) {
    target = path.resolve(path.dirname(fromFile), source);
  } else {
    return null; // External package
  }

  const candidates = [
    target,
    target + ".ts",
    target + ".tsx",
    target + ".js",
    target + ".jsx",
    path.join(target, "index.ts"),
    path.join(target, "index.tsx"),
    path.join(target, "index.js"),
    path.join(target, "index.jsx"),
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return normPath(cand);
    }
  }
  return null;
}

// -------------------------------------------------------------
// Step 1: Collect all Next.js Entry Points
// -------------------------------------------------------------
const entryFiles = new Set();
const appDir = path.join(srcRoot, "app");

if (fs.existsSync(appDir)) {
  walkTree(appDir, (absPath) => {
    const filename = path.basename(absPath);
    if (
      /^(page|layout|loading|error|not-found|template|default|global-error|route)\.(tsx|ts|jsx|js)$/.test(
        filename
      ) ||
      /^(manifest|sitemap|robots|sw|sw-network-retry)\.(ts|js)$/.test(filename)
    ) {
      entryFiles.add(normPath(absPath));
    }
  });
}

// Standard top-level convention files
const ROOT_CONVENTIONS = [
  "src/auth.ts",
  "src/auth.config.ts",
  "src/proxy.ts",
  "src/middleware.ts",
  "src/instrumentation.ts",
  "src/instrumentation-client.ts",
  "src/i18n/request.ts",
];

ROOT_CONVENTIONS.forEach((rel) => {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) {
    entryFiles.add(normPath(p));
  }
});

// -------------------------------------------------------------
// Step 2: Traverse Dependency Graph from Entry Points
// -------------------------------------------------------------
const reachableFiles = new Set(entryFiles);
const queue = Array.from(entryFiles);

while (queue.length > 0) {
  const currentPath = queue.pop();
  let code;
  try {
    code = fs.readFileSync(currentPath, "utf8");
  } catch {
    continue;
  }

  let ast;
  try {
    ast = parseFile(currentPath, code);
  } catch {
    continue;
  }

  function enqueue(resolved) {
    if (resolved && !reachableFiles.has(resolved)) {
      reachableFiles.add(resolved);
      queue.push(resolved);
    }
  }

  traverse(ast, {
    ImportDeclaration(p) {
      enqueue(resolveModule(currentPath, p.node.source.value));
    },
    ExportAllDeclaration(p) {
      if (p.node.source) {
        enqueue(resolveModule(currentPath, p.node.source.value));
      }
    },
    ExportNamedDeclaration(p) {
      if (p.node.source) {
        enqueue(resolveModule(currentPath, p.node.source.value));
      }
    },
    CallExpression(p) {
      // Dynamic imports: import(...)
      if (p.node.callee && p.node.callee.type === "Import") {
        const arg = p.node.arguments[0];
        if (arg && arg.type === "StringLiteral") {
          enqueue(resolveModule(currentPath, arg.value));
        }
      }
    },
  });
}

// -------------------------------------------------------------
// Step 3: Find Orphan Components and Hooks
// -------------------------------------------------------------
walkTree(srcRoot, (absPath) => {
  const norm = normPath(absPath);
  if (reachableFiles.has(norm)) return;

  const rel = path.relative(ROOT, absPath).replace(/\\/g, "/");

  // Ignore UI primitives & styles & tests
  if (
    rel.includes("components/ui/") ||
    rel.includes("styles/") ||
    rel.includes("constants/mock-") ||
    /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(rel) ||
    rel.endsWith(".d.ts")
  ) {
    return;
  }

  // Check if it is a component
  const isComponent =
    /\.(tsx|jsx)$/.test(absPath) &&
    (rel.includes("/components/") || rel.includes("/features/"));

  // Check if it is a custom hook
  const isHook =
    (rel.includes("/hooks/") || /use-[a-z0-9\-]+\.(ts|tsx)$/.test(path.basename(rel))) &&
    !rel.includes(".test.");

  if (isComponent) {
    r.addViolation(
      rel,
      1,
      `Orphan component "${path.basename(rel)}" is never imported or rendered by any page — delete dead file or connect it to a route`,
      { fix: `Delete orphan component file ${rel} or import it into a page/layout` }
    );
  } else if (isHook) {
    r.addViolation(
      rel,
      1,
      `Orphan hook "${path.basename(rel)}" is never imported anywhere — delete dead hook or connect it`,
      { fix: `Delete orphan hook file ${rel} or import it where needed` }
    );
  }
});

r.finish({
  fixTip:
    "Orphan components increase bundle size and maintenance overhead. Connect them to a route or delete them.",
});
