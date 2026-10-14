"use strict";

const fs = require("fs");
const path = require("path");

const ALWAYS_SKIP = new Set([
  "node_modules",
  ".git",
  "build",
  "dist",
  ".next",
  "out",
  "coverage",
  "__snapshots__",
]);

const DEFAULT_EXTS = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walkTree(rootDir, onFile, opts = {}) {
  const exts =
    opts.extensions instanceof Set
      ? opts.extensions
      : new Set(opts.extensions || DEFAULT_EXTS);

  const extraSkip =
    opts.skipDirs instanceof Set
      ? opts.skipDirs
      : new Set(opts.skipDirs || []);

  const includeTests = opts.includeTests === true;

  const defaultProjectRoot = path.resolve(__dirname, "../../..");
  const projectRoot = opts.projectRoot || defaultProjectRoot;

  function _walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (ALWAYS_SKIP.has(entry.name)) continue;
        if (extraSkip.has(entry.name)) continue;
        if (
          !includeTests &&
          (entry.name === "__tests__" || entry.name === "__mocks__")
        ) {
          continue;
        }
        _walk(full);
        continue;
      }

      if (!entry.isFile()) continue;

      if (entry.name.startsWith(".") || entry.name.endsWith("~") || entry.name.endsWith(".swp")) {
        if (entry.name !== ".env" && !entry.name.startsWith(".env.")) {
          continue;
        }
      }

      const ext = path.extname(entry.name);
      if (!exts.has(ext)) continue;

      if (!includeTests) {
        if (/\.(test|spec)\.(tsx?|jsx?)$/.test(entry.name)) continue;
      }

      const relative = path.relative(projectRoot, full).split(path.sep).join("/");
      onFile(full, relative);
    }
  }

  _walk(rootDir);
}

module.exports = { walkTree };
