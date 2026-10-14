"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Multi-Tenant Security & Tenancy Invariant Audit", { emoji: "🏢" });

const srcRoot = path.join(__dirname, "../../src");

const TENANT_FEATURES = [
  "products",
  "categories",
  "brands",
  "purchases",
  "sales",
  "customers",
  "suppliers",
  "inventory",
  "expenses",
  "cash",
  "payments",
  "supplier-payments",
  "returns",
  "reports",
];

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");

    // Only inspect tenant features (platform-admin is the super-admin who administers shops)
    const isTenantFeature = TENANT_FEATURES.some((f) => relPath.startsWith(`src/features/${f}/`));
    if (!isTenantFeature) return;

    const code = fs.readFileSync(absPath, "utf8");
    if (!code.includes("shopId") && !code.includes("shop_id")) return;

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      ObjectProperty(p) {
        const keyName = p.node.key.name || p.node.key.value;
        if (keyName === "shopId" || keyName === "shop_id") {
          // Check if this is inside a form schema or mutation request body
          if (relPath.includes("/schemas/") || relPath.includes("/api/service.ts") || relPath.includes("/api/mutations.ts")) {
            r.addViolation(
              relPath,
              p.node.loc ? p.node.loc.start.line : 0,
              `Forbidden \`${keyName}\` in tenant feature payload — tenancy is strictly derived by the backend from the JWT Bearer token`,
              { fix: "Remove shopId/shop_id from request body/schema. Never pass tenant ID explicitly." }
            );
          }
        }
      },
    });
  });
}

r.finish({
  fixTip: "Multi-tenant rule: Tenancy is derived strictly from the JWT Bearer token on the backend. Never include shopId in client mutation bodies.",
});
