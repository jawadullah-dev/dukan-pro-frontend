"use strict";

/**
 * check-metadata.cjs
 *
 * Every Next.js page.tsx must:
 *   1. Be a server component (no "use client")
 *   2. Export a default React component
 *   3. Export `metadata` or `generateMetadata`
 *   4. Include `title` and `description` in metadata  ← enforced as errors
 *   5. Include `openGraph`                             ← warned (not required for dashboards)
 */

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Next.js Metadata & SEO Audit", { emoji: "🌐" });

function findAllPages(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      findAllPages(fullPath, results);
    } else if (entry.isFile() && entry.name === "page.tsx") {
      results.push(fullPath);
    }
  }
  return results;
}

const appRoot = path.join(__dirname, "../src/app");

if (!fs.existsSync(appRoot)) {
  console.error("❌ src/app not found — skipping metadata check");
  process.exit(0);
}

const pages = findAllPages(appRoot);
let scannedCount = 0;

pages.forEach((absPath) => {
  scannedCount++;
  const relPath = path.relative(process.cwd(), absPath);
  const code = fs.readFileSync(absPath, "utf8");

  // pages must be server components for SEO
  if (code.includes('"use client"') || code.includes("'use client'")) {
    r.addViolation(relPath, 1, '"use client" on page — pages must be server components to export metadata');
  }

  let ast;
  try {
    ast = parseFile(absPath, code);
  } catch (e) {
    r.addParseError(relPath, e.message);
    return;
  }

  let hasMetadata = false;
  let hasGenerateMetadata = false;
  let hasTitle = false;
  let hasDescription = false;
  let hasOpenGraph = false;
  let hasDefaultExport = false;

  traverse(ast, {
    ExportDefaultDeclaration() {
      hasDefaultExport = true;
    },
    ExportNamedDeclaration(nodePath) {
      const declaration = nodePath.node.declaration;
      if (!declaration) return;

      if (declaration.type === "VariableDeclaration") {
        declaration.declarations.forEach((d) => {
          if (d.id.type === "Identifier" && d.id.name === "metadata") {
            hasMetadata = true;
            if (d.init && d.init.type === "ObjectExpression") {
              d.init.properties.forEach((prop) => {
                if (prop.key && prop.key.name === "title") hasTitle = true;
                if (prop.key && prop.key.name === "description") hasDescription = true;
                if (prop.key && prop.key.name === "openGraph") hasOpenGraph = true;
              });
            }
          }
        });
      }

      if (declaration.type === "FunctionDeclaration") {
        if (declaration.id && declaration.id.name === "generateMetadata") {
          hasGenerateMetadata = true;
          // generateMetadata handles all fields dynamically
          hasTitle = true;
          hasDescription = true;
          hasOpenGraph = true;
        }
      }
    },
  });

  if (!hasMetadata && !hasGenerateMetadata) {
    r.addViolation(relPath, 1, 'Missing SEO metadata — export `metadata` or `generateMetadata`');
  }
  if (hasMetadata && !hasTitle) {
    r.addViolation(relPath, 1, 'Missing `title` in metadata');
  }
  if (hasMetadata && !hasDescription) {
    r.addViolation(relPath, 1, 'Missing `description` in metadata');
  }
  const isDashboardPage = relPath.includes("dashboard") || relPath.includes("/dashboard");
  if (hasMetadata && !hasOpenGraph && !isDashboardPage) {
    r.addViolation(relPath, 1, 'Missing `openGraph` in metadata on public page');
  }
  if (!hasDefaultExport) {
    r.addViolation(relPath, 1, 'Missing default export — every page.tsx must export a default React component');
  }
});

console.log(`\n📄 Pages scanned: ${scannedCount}`);

r.finish({
  fixTip:
    "Every page.tsx must be a server component, export a default component, " +
    "and export `metadata` (with title + description). " +
    "Add openGraph for public-facing pages.",
});