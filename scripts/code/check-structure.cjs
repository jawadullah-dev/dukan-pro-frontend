"use strict";

/**
 * check-structure.cjs
 *
 * Guards that src/ only contains directories that belong in this project's
 * feature-based Next.js architecture. Flags unknown top-level dirs or stray
 * loose files so that AI agents don't accidentally scatter code outside the
 * defined structure.
 *
 * Allowed directories mirror the actual project layout (see AGENTS.md):
 *   app, components, config, constants, features, hooks, i18n, lib, styles, types
 *
 * Allowed root files are Next.js / Auth.js boot files that live in src/ by convention.
 */

const fs = require("fs");
const path = require("path");
const { Reporter } = require("./lib/reporter.cjs");

const r = new Reporter("Project Structure Audit", { emoji: "📂" });

const SRC_DIR = path.join(__dirname, "../../src");

// Directories that are intentionally present at src/ top-level.
const ALLOWED_TOP_LEVEL_DIRS = new Set([
  "app",         // Next.js App Router pages, layouts, API routes
  "components",  // Shared UI components (shadcn/ui + layout)
  "config",      // Site config, nav config, env config
  "constants",   // Mock API stores, shared constants
  "features",    // Feature modules (products, shops, etc.)
  "hooks",       // Custom React hooks
  "i18n",        // next-intl routing and locale helpers
  "lib",         // Utility functions (cn, formatters, query-client, etc.)
  "styles",      // Global CSS, theme files
  "types",       // TypeScript type definitions (no JSX, no hooks)
]);

// Loose files allowed at src/ root by Next.js / Auth.js convention.
const ALLOWED_ROOT_FILES = new Set([
  "middleware.ts",
  "middleware.js",
  "next-env.d.ts",
  "auth.ts",        // Auth.js v5 server-side config
  "auth.config.ts", // Auth.js v5 shared (edge-compatible) config
  "instrumentation.ts",         // Next.js instrumentation for Sentry (server)
  "instrumentation-client.ts",  // Next.js instrumentation for Sentry (client)
  "proxy.ts",       // Next-intl or rewrite proxy helper
]);

function runAudit() {
  if (!fs.existsSync(SRC_DIR)) {
    r.addViolation("src/", 0, "Source directory 'src/' does not exist!");
    r.finish();
    return;
  }

  const srcContents = fs.readdirSync(SRC_DIR, { withFileTypes: true });

  for (const entry of srcContents) {
    if (entry.isDirectory()) {
      if (!ALLOWED_TOP_LEVEL_DIRS.has(entry.name)) {
        r.addViolation(
          `src/${entry.name}`,
          0,
          `Unknown top-level directory 'src/${entry.name}'. ` +
            `Allowed: ${Array.from(ALLOWED_TOP_LEVEL_DIRS).join(", ")}. ` +
            `If this is intentional, add it to ALLOWED_TOP_LEVEL_DIRS in check-structure.cjs.`
        );
      }
    } else if (entry.isFile()) {
      if (!ALLOWED_ROOT_FILES.has(entry.name)) {
        r.addViolation(
          `src/${entry.name}`,
          0,
          `Loose file 'src/${entry.name}' is not in the allowed list. ` +
            `Place code files in the appropriate directory. ` +
            `Allowed root files: ${Array.from(ALLOWED_ROOT_FILES).join(", ")}.`
        );
      }
    }
  }

  // Guard: types/ must only contain .ts files (no components or hooks)
  const typesDir = path.join(SRC_DIR, "types");
  if (fs.existsSync(typesDir)) {
    walkFiles(typesDir).forEach((file) => {
      const relPath = path.relative(SRC_DIR, file).split(path.sep).join("/");

      if (!file.endsWith(".ts") || file.endsWith(".tsx")) {
        r.addViolation(relPath, 0, `types/ must contain .ts files only — got: '${path.basename(file)}'`);
      }

      const content = fs.readFileSync(file, "utf8");
      const hasJsx = content.includes("</") || content.includes("/>");
      const hasHooks =
        content.includes("useState(") ||
        content.includes("useEffect(") ||
        content.includes("useContext(");

      if (hasJsx || hasHooks) {
        r.addViolation(
          relPath,
          0,
          `Component/hook code found in types/. Files in src/types/ must only contain interface, type, or enum declarations.`
        );
      }
    });
  }

  r.finish({
    fixTip:
      "Check AGENTS.md for the project's folder structure. " +
      "Features belong in src/features/<name>/. " +
      "New top-level dirs require explicit approval and an update to check-structure.cjs.",
  });
}

function walkFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkFiles(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

runAudit();
