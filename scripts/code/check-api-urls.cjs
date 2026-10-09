"use strict";

const fs = require("fs");
const path = require("path");
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");

const r = new Reporter("Hardcoded API URLs Audit", { emoji: "🌐" });

const srcRoot = path.join(__dirname, "../../src");

const URL_REGEX = /https?:\/\/[^\s"'`<>{}]+/g;
const EXEMPT_URLS = [
  "schema.org",
  "w3.org",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "avatars.githubusercontent.com",
  "images.unsplash.com",
  "api.dicebear.com",
  "localhost",
  "127.0.0.1",
  "tanstack.com",
  "nuqs.47ng.com",
  "tabler.io",
  "example.com",
  "slingacademy.com",
  "pokeapi.co"
];

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    // Exclude config, mock constants, and shadcn ui primitives
    if (
      relPath.includes("config/") ||
      relPath.includes("constants/api.ts") ||
      relPath.includes("components/ui/") ||
      relPath.includes("constants/mock-")
    ) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    const lines = code.split("\n");

    lines.forEach((line, index) => {
      const matches = line.match(URL_REGEX);
      if (matches) {
        matches.forEach((url) => {
          const isExempt = EXEMPT_URLS.some((exempt) => url.includes(exempt));
          if (!isExempt) {
            r.addViolation(
              relPath,
              index + 1,
              `Forbidden hardcoded URL "${url}" — define API endpoints in src/config/ or src/constants/api.ts`,
            );
          }
        });
      }
    });
  });
}

r.finish({
  fixTip: "Centralize all API base URLs and endpoints in src/config/ or src/constants/api.ts.",
});
