"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Feature Boundaries & Layering Audit", { emoji: "🛡️" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    const code = fs.readFileSync(absPath, "utf8");

    if (!code.includes("import ") && !code.includes("from '") && !code.includes('from "')) {
      return;
    }

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    // Determine current layer
    const isFeature = relPath.startsWith("src/features/");
    let currentFeature = null;
    if (isFeature) {
      const parts = relPath.split("/");
      currentFeature = parts[2]; // src/features/<featureName>/...
    }

    const isLib = relPath.startsWith("src/lib/");
    const isTypes = relPath.startsWith("src/types/");
    const isUiComponent = relPath.startsWith("src/components/ui/");

    traverse(ast, {
      ImportDeclaration(p) {
        const source = p.node.source.value;
        const line = p.node.loc ? p.node.loc.start.line : 0;

        // Rule 1: Feature modules cannot import from src/app
        if (isFeature && (source.startsWith("@/app") || source.includes("../app/"))) {
          r.addViolation(
            relPath,
            line,
            `Forbidden upward import from App layer ("${source}") inside feature '${currentFeature}'`,
            { fix: "Features must remain decoupled from specific route page implementations." }
          );
        }

        // Rule 2: Cross-feature private component / schema imports
        if (isFeature && source.startsWith("@/features/")) {
          const targetParts = source.replace("@/features/", "").split("/");
          const targetFeature = targetParts[0];

          if (targetFeature && targetFeature !== currentFeature) {
            if (targetParts[1] === "components") {
              r.addViolation(
                relPath,
                line,
                `Forbidden cross-feature component import ("${source}") from '${currentFeature}' into '${targetFeature}'`,
                { fix: "Components are feature-private. Move shared components to src/components/." }
              );
            }
            if (targetParts[1] === "schemas") {
              r.addViolation(
                relPath,
                line,
                `Forbidden cross-feature schema import ("${source}") from '${currentFeature}' into '${targetFeature}'`,
                { fix: "Move shared schemas or validation types to src/types/ or src/lib/." }
              );
            }
          }
        }

        // Rule 3: Low-level UI primitives in components/ui cannot import features or app
        if (isUiComponent && (source.startsWith("@/features") || source.startsWith("@/app"))) {
          r.addViolation(
            relPath,
            line,
            `Forbidden domain import ("${source}") inside primitive UI component`,
            { fix: "UI primitives must be domain-agnostic." }
          );
        }

        // Rule 4: Core lib utilities cannot depend on features or app
        // (exception: dukaan operations mock data store which simulates backend)
        if (
          isLib &&
          !relPath.includes("lib/dukaan/") &&
          (source.startsWith("@/features") || source.startsWith("@/app"))
        ) {
          r.addViolation(
            relPath,
            line,
            `Forbidden higher-level import ("${source}") inside core utility src/lib/`,
            { fix: "Move feature-specific logic out of src/lib/." }
          );
        }

        // Rule 5: Type definitions in src/types cannot import from features or app
        if (isTypes && (source.startsWith("@/features") || source.startsWith("@/app"))) {
          r.addViolation(
            relPath,
            line,
            `Forbidden import ("${source}") inside global types src/types/`,
            { fix: "Global types cannot depend on feature implementations." }
          );
        }
      },
    });
  });
}

r.finish({
  fixTip: "Maintain strict unidirectional architectural boundaries between features, components, lib, and app.",
});
