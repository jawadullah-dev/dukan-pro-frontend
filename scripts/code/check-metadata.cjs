"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Next.js Metadata & SEO Audit", { emoji: "🌐" });

const ROOT = path.resolve(__dirname, "../..");
const appRoot = path.join(ROOT, "src/app");

function findAllPages(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name.startsWith("@")) {
        continue;
      }
      findAllPages(fullPath, results);
    } else if (entry.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

if (!fs.existsSync(appRoot)) {
  console.error("❌ src/app not found — skipping metadata check");
  process.exit(1);
}

const pages = findAllPages(appRoot);
let scannedCount = 0;

pages.forEach((absPath) => {
  scannedCount++;
  const relPath = path.relative(ROOT, absPath).replace(/\\/g, "/");
  const code = fs.readFileSync(absPath, "utf8");

  // Skip offline PWA fallback if not needed
  if (relPath.includes("~offline")) return;

  // Pages must be server components for SEO
  if (code.includes('"use client"') || code.includes("'use client'")) {
    r.addViolation(relPath, 1, '"use client" on page — pages must be server components to export metadata');
  }

  // Pure redirect pages in Next.js do not render HTML
  const isPureRedirect =
    (code.includes("redirect(") || code.includes("redirect (")) &&
    !code.includes("<PageContainer") &&
    !code.includes("<main") &&
    !code.includes("<div");

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
          if (d.id.type === "Identifier" && d.id.name === "generateMetadata") {
            hasGenerateMetadata = true;
            hasTitle = true;
            hasDescription = true;
            hasOpenGraph = true;
          }
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
          hasTitle = true;
          hasDescription = true;
          hasOpenGraph = true;
        }
      }
    }
  });

  if (!isPureRedirect) {
    if (!hasMetadata && !hasGenerateMetadata) {
      r.addViolation(relPath, 1, "Missing SEO metadata — export `metadata` or `generateMetadata`");
    }
    if (hasMetadata && !hasTitle) {
      r.addViolation(relPath, 1, "Missing `title` in metadata");
    }
    if (hasMetadata && !hasDescription) {
      r.addViolation(relPath, 1, "Missing `description` in metadata");
    }
    const isDashboardPage = relPath.includes("dashboard");
    if (hasMetadata && !hasOpenGraph && !isDashboardPage) {
      r.addViolation(relPath, 1, "Missing `openGraph` in metadata on public page");
    }
  }

  if (!hasDefaultExport) {
    r.addViolation(relPath, 1, "Missing default export — every page.tsx must export a default React component");
  }
});

console.log(`\n📄 Pages scanned: ${scannedCount}`);

r.finish({
  fixTip:
    "Every page.tsx must be a server component, export a default component, " +
    "and export `metadata` (with title + description).",
});