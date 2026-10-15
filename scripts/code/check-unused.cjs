"use strict";

/**
 * check-unused.cjs — Zero-Tolerance Unused Imports & Exports Audit
 *
 * Detects:
 *   1. Unused imports in any file (named, default, namespace, type imports)
 *      with full TypeScript type and JSX awareness.
 *   2. Unused exports across the project (functions, constants, classes,
 *      types, interfaces, enums) that are never imported anywhere.
 *
 * CLI Flags:
 *   --imports           Only check unused imports
 *   --exports           Only check unused exports
 *   --include-ui        Also check exports in src/components/ui/ & src/styles/
 *   --include-internal  Report exports that are only used locally in the same file
 *   --fix               Automatically remove unused imports
 */

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const ROOT = path.resolve(__dirname, "../..");
const srcRoot = path.join(ROOT, "src");

const args = process.argv.slice(2);
const checkOnlyImports = args.includes("--imports");
const checkOnlyExports = args.includes("--exports");
const includeUi = args.includes("--include-ui");
const includeInternal = args.includes("--include-internal");
const autoFix = args.includes("--fix");

const shouldCheckImports = !checkOnlyExports;
const shouldCheckExports = !checkOnlyImports;

const r = new Reporter("Unused Imports & Exports Audit", { emoji: "🧹" });

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

function isFrameworkEntryPoint(normFilePath, exportName) {
  if (normFilePath.includes("/src/app/")) {
    const basename = path.basename(normFilePath);
    if (
      [
        "page.tsx",
        "page.jsx",
        "page.js",
        "layout.tsx",
        "layout.jsx",
        "loading.tsx",
        "error.tsx",
        "not-found.tsx",
        "template.tsx",
        "default.tsx",
        "global-error.tsx",
      ].includes(basename)
    ) {
      if (
        [
          "default",
          "metadata",
          "viewport",
          "generateMetadata",
          "generateViewport",
          "generateStaticParams",
          "revalidate",
          "dynamic",
          "dynamicParams",
          "fetchCache",
          "runtime",
          "preferredRegion",
          "maxDuration",
        ].includes(exportName)
      ) {
        return true;
      }
    }

    if (basename === "route.ts" || basename === "route.js") {
      if (
        [
          "GET",
          "POST",
          "PUT",
          "DELETE",
          "PATCH",
          "OPTIONS",
          "HEAD",
          "dynamic",
          "revalidate",
        ].includes(exportName)
      ) {
        return true;
      }
    }

    if (
      [
        "manifest.ts",
        "sitemap.ts",
        "robots.ts",
        "sw.ts",
        "sw-network-retry.ts",
      ].includes(basename)
    ) {
      return true;
    }
  }

  if (
    normFilePath.endsWith("/instrumentation.ts") ||
    normFilePath.endsWith("/instrumentation-client.ts")
  ) {
    return true;
  }
  if (
    normFilePath.endsWith("/proxy.ts") ||
    normFilePath.endsWith("/middleware.ts")
  ) {
    return true;
  }
  if (
    normFilePath.endsWith("/auth.ts") ||
    normFilePath.endsWith("/auth.config.ts")
  ) {
    return true;
  }
  if (normFilePath.endsWith("/i18n/request.ts")) {
    return true;
  }

  return false;
}

// -------------------------------------------------------------
// Collect all source files
// -------------------------------------------------------------
const allFiles = [];
walkTree(
  srcRoot,
  (absPath) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;
    if (absPath.endsWith(".d.ts")) return;
    allFiles.push(absPath);
  },
  { includeTests: true }
);

// Map: normPath -> parsed AST & code
const fileAsts = new Map();
// Map: normPath -> Map(exportName -> { line, kind, usedInFile })
const fileExports = new Map();
// Map: normPath -> Set(importedExportNames)
const directImports = new Map();
// Map: normPath -> Set(subModuleNormPaths) for export * from '...'
const starReExports = new Map();
// Map: normPath -> Map(exportedAs -> { resolved, orig })
const namedReExports = new Map();

// Unused imports per file: normPath -> Array<{ name, source, line, isFullDeclaration }>
const unusedImportsByFile = new Map();

// -------------------------------------------------------------
// Pass 1: Parse and analyze each file
// -------------------------------------------------------------
for (const absPath of allFiles) {
  const norm = normPath(absPath);
  const code = fs.readFileSync(absPath, "utf8");
  let ast;
  try {
    ast = parseFile(absPath, code);
  } catch (e) {
    r.addParseError(path.relative(ROOT, absPath).replace(/\\/g, "/"), e.message);
    continue;
  }

  fileAsts.set(norm, { ast, code, absPath });

  const imports = new Map(); // localName -> { name, source, line, referenced, isFullDeclaration, binding }
  const exports = new Map(); // exportName -> { name, line, kind, usedInFile }
  const importDecls = []; // track ImportDeclaration paths for isFullDeclaration computation

  traverse(ast, {
    ImportDeclaration(p) {
      importDecls.push(p);
      const source = p.node.source.value;
      const resolved = resolveModule(absPath, source);

      if (resolved && shouldCheckExports) {
        if (!directImports.has(resolved)) directImports.set(resolved, new Set());
        const importedSet = directImports.get(resolved);

        p.node.specifiers.forEach((s) => {
          if (s.type === "ImportSpecifier") {
            const importedName =
              s.imported.type === "Identifier" ? s.imported.name : s.imported.value;
            importedSet.add(importedName);
          } else if (s.type === "ImportDefaultSpecifier") {
            importedSet.add("default");
          } else if (s.type === "ImportNamespaceSpecifier") {
            importedSet.add("*");
          }
        });
      }

      if (shouldCheckImports) {
        const isSideEffect = p.node.specifiers.length === 0;
        if (!isSideEffect) {
          p.node.specifiers.forEach((s) => {
            const localName = s.local.name;
            imports.set(localName, {
              name: localName,
              source,
              line: s.loc ? s.loc.start.line : p.node.loc.start.line,
              declStartLine: p.node.loc ? p.node.loc.start.line : 0,
              declEndLine: p.node.loc ? p.node.loc.end.line : 0,
              specifierCount: p.node.specifiers.length,
              referenced: false,
              binding: p.scope.getBinding(localName),
            });
          });
        }
      }
    },

    ExportDefaultDeclaration(p) {
      if (shouldCheckExports) {
        exports.set("default", {
          name: "default",
          line: p.node.loc ? p.node.loc.start.line : 0,
          kind: "default",
          usedInFile: true,
        });
      }
    },

    ExportNamedDeclaration(p) {
      if (!shouldCheckExports) return;

      if (p.node.source) {
        const source = p.node.source.value;
        const resolved = resolveModule(absPath, source);
        if (resolved) {
          if (!namedReExports.has(norm)) namedReExports.set(norm, new Map());
          p.node.specifiers.forEach((s) => {
            if (s.type === "ExportNamespaceSpecifier") {
              const exportedAs =
                s.exported.type === "Identifier" ? s.exported.name : s.exported.value;
              namedReExports.get(norm).set(exportedAs, { resolved, orig: "*" });
              exports.set(exportedAs, {
                name: exportedAs,
                line: s.loc ? s.loc.start.line : p.node.loc.start.line,
                kind: "namespace-export",
                usedInFile: false,
              });
            } else {
              const orig = s.local ? s.local.name : s.exported.name;
              const exportedAs =
                s.exported.type === "Identifier" ? s.exported.name : s.exported.value;
              namedReExports.get(norm).set(exportedAs, { resolved, orig });
              exports.set(exportedAs, {
                name: exportedAs,
                line: s.loc ? s.loc.start.line : p.node.loc.start.line,
                kind: "re-export",
                usedInFile: false,
              });
            }
          });
        }
      } else if (p.node.declaration) {
        const d = p.node.declaration;
        if (d.type === "FunctionDeclaration" && d.id) {
          exports.set(d.id.name, {
            name: d.id.name,
            line: d.loc ? d.loc.start.line : p.node.loc.start.line,
            kind: "function",
            usedInFile: false,
          });
        } else if (d.type === "ClassDeclaration" && d.id) {
          exports.set(d.id.name, {
            name: d.id.name,
            line: d.loc ? d.loc.start.line : p.node.loc.start.line,
            kind: "class",
            usedInFile: false,
          });
        } else if (d.type === "VariableDeclaration") {
          d.declarations.forEach((decl) => {
            if (decl.id.type === "Identifier") {
              exports.set(decl.id.name, {
                name: decl.id.name,
                line: decl.loc ? decl.loc.start.line : p.node.loc.start.line,
                kind: "variable",
                usedInFile: false,
              });
            }
          });
        } else if (d.type === "TSTypeAliasDeclaration" && d.id) {
          exports.set(d.id.name, {
            name: d.id.name,
            line: d.loc ? d.loc.start.line : p.node.loc.start.line,
            kind: "type",
            usedInFile: false,
          });
        } else if (d.type === "TSInterfaceDeclaration" && d.id) {
          exports.set(d.id.name, {
            name: d.id.name,
            line: d.loc ? d.loc.start.line : p.node.loc.start.line,
            kind: "interface",
            usedInFile: false,
          });
        } else if (d.type === "TSEnumDeclaration" && d.id) {
          exports.set(d.id.name, {
            name: d.id.name,
            line: d.loc ? d.loc.start.line : p.node.loc.start.line,
            kind: "enum",
            usedInFile: false,
          });
        }
      } else if (p.node.specifiers) {
        p.node.specifiers.forEach((s) => {
          const exportName =
            s.exported.type === "Identifier" ? s.exported.name : s.exported.value;
          exports.set(exportName, {
            name: exportName,
            line: s.loc ? s.loc.start.line : p.node.loc.start.line,
            kind: "export",
            usedInFile: false,
          });
        });
      }
    },

    ExportAllDeclaration(p) {
      if (!shouldCheckExports) return;
      if (p.node.source) {
        const source = p.node.source.value;
        const resolved = resolveModule(absPath, source);
        if (resolved) {
          if (p.node.exported) {
            const expName =
              p.node.exported.type === "Identifier"
                ? p.node.exported.name
                : p.node.exported.value;
            exports.set(expName, {
              name: expName,
              line: p.node.loc ? p.node.loc.start.line : 0,
              kind: "namespace-export",
              usedInFile: false,
            });
            if (!namedReExports.has(norm)) namedReExports.set(norm, new Map());
            namedReExports.get(norm).set(expName, { resolved, orig: "*" });
          } else {
            if (!starReExports.has(norm)) starReExports.set(norm, new Set());
            starReExports.get(norm).add(resolved);
          }
        }
      }
    },
  });

  // Check identifier references in this file (for both imports and exports)
  traverse(ast, {
    Identifier(p) {
      const name = p.node.name;

      // Unused imports check
      if (shouldCheckImports && imports.has(name)) {
        if (!p.findParent((x) => x.isImportDeclaration())) {
          const impInfo = imports.get(name);
          const binding = p.scope.getBinding(name);
          if (binding === impInfo.binding) {
            if (p.isReferencedIdentifier() || p.parent.type === "ExportSpecifier") {
              impInfo.referenced = true;
            }
          }
        }
      }

      // Local export usage check (is an exported name referenced in its own file?)
      if (shouldCheckExports && exports.has(name)) {
        if (
          p.parent.type !== "ExportSpecifier" &&
          p.parent.type !== "ImportSpecifier" &&
          p.parent.type !== "ImportDefaultSpecifier" &&
          !(p.parent.type === "FunctionDeclaration" && p.parent.id === p.node) &&
          !(p.parent.type === "ClassDeclaration" && p.parent.id === p.node) &&
          !(p.parent.type === "VariableDeclarator" && p.parent.id === p.node) &&
          !(p.parent.type === "TSTypeAliasDeclaration" && p.parent.id === p.node) &&
          !(p.parent.type === "TSInterfaceDeclaration" && p.parent.id === p.node) &&
          !(p.parent.type === "TSEnumDeclaration" && p.parent.id === p.node)
        ) {
          if (p.isReferencedIdentifier()) {
            exports.get(name).usedInFile = true;
          }
        }
      }
    },

    JSXIdentifier(p) {
      const name = p.node.name;
      if (shouldCheckImports && imports.has(name)) {
        const impInfo = imports.get(name);
        const binding = p.scope.getBinding(name);
        if (binding === impInfo.binding) {
          impInfo.referenced = true;
        }
      }
      if (shouldCheckExports && exports.has(name)) {
        exports.get(name).usedInFile = true;
      }
    },
  });

  if (shouldCheckImports) {
    const fileUnusedImports = [];
    for (const [name, info] of imports.entries()) {
      if (!info.referenced) {
        fileUnusedImports.push({
          name: info.name,
          source: info.source,
          line: info.line,
          declStartLine: info.declStartLine,
          declEndLine: info.declEndLine,
          isFullDeclaration: info.specifierCount === 1,
        });
      }
    }
    if (fileUnusedImports.length > 0) {
      unusedImportsByFile.set(norm, fileUnusedImports);
    }
  }

  if (shouldCheckExports) {
    fileExports.set(norm, exports);
  }
}

// -------------------------------------------------------------
// Pass 2: Report or Auto-Fix Unused Imports
// -------------------------------------------------------------
let totalFixedFiles = 0;

if (shouldCheckImports) {
  for (const [norm, unusedList] of unusedImportsByFile.entries()) {
    const fileData = fileAsts.get(norm);
    const relPath = path.relative(ROOT, fileData.absPath).replace(/\\/g, "/");

    if (autoFix) {
      // Remove unused specifiers or full declarations
      let lines = fileData.code.split(/\r?\n/);
      const linesToRemove = new Set();
      const specifiersToRemove = new Map();

      // Check if all specifiers in a declaration are unused
      const declGroup = new Map();
      unusedList.forEach((u) => {
        const key = `${u.declStartLine}-${u.declEndLine}`;
        declGroup.set(key, (declGroup.get(key) || 0) + 1);
      });

      unusedList.forEach((u) => {
        const key = `${u.declStartLine}-${u.declEndLine}`;
        if (u.isFullDeclaration || declGroup.get(key) === u.specifierCount) {
          for (let l = u.declStartLine; l <= u.declEndLine; l++) {
            linesToRemove.add(l);
          }
        } else {
          if (!specifiersToRemove.has(u.line)) {
            specifiersToRemove.set(u.line, new Set());
          }
          specifiersToRemove.get(u.line).add(u.name);
        }
      });

      const updatedLines = [];
      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        if (linesToRemove.has(lineNum)) return;

        if (specifiersToRemove.has(lineNum)) {
          const names = specifiersToRemove.get(lineNum);
          let mod = line;
          names.forEach((name) => {
            const re = new RegExp(`\\b(type\\s+)?${name}\\b\\s*,?\\s*`, "g");
            mod = mod.replace(re, "");
          });
          mod = mod.replace(/,\s*}/g, " }").replace(/{\s*,/g, "{ ");
          if (mod.trim() === "" || mod.trim() === ",") return;
          updatedLines.push(mod);
        } else {
          updatedLines.push(line);
        }
      });

      fs.writeFileSync(fileData.absPath, updatedLines.join("\n"), "utf8");
      totalFixedFiles++;
      console.log(`  🔧 Fixed ${unusedList.length} unused import(s) in ${relPath}`);
    } else {
      unusedList.forEach((u) => {
        r.addViolation(
          relPath,
          u.line,
          `Unused import "${u.name}" from "${u.source}" — remove or use it`,
          { fix: `Remove unused import "${u.name}"` }
        );
      });
    }
  }
}

// -------------------------------------------------------------
// Pass 3: Propagate and check Unused Exports
// -------------------------------------------------------------
if (shouldCheckExports) {
  function markUsed(resolvedFile, exportName, visited = new Set()) {
    const key = `${resolvedFile}::${exportName}`;
    if (visited.has(key)) return;
    visited.add(key);

    if (!directImports.has(resolvedFile)) directImports.set(resolvedFile, new Set());
    directImports.get(resolvedFile).add(exportName);

    // Propagate named re-exports
    if (namedReExports.has(resolvedFile)) {
      const map = namedReExports.get(resolvedFile);
      if (map.has(exportName)) {
        const { resolved, orig } = map.get(exportName);
        markUsed(resolved, orig, visited);
      }
      if (exportName === "*") {
        for (const { resolved, orig } of map.values()) {
          markUsed(resolved, orig, visited);
        }
      }
    }

    // Propagate star re-exports
    if (starReExports.has(resolvedFile)) {
      for (const sub of starReExports.get(resolvedFile)) {
        const subExports = fileExports.get(sub);
        if (subExports && subExports.has(exportName)) {
          markUsed(sub, exportName, visited);
        }
        if (exportName === "*") {
          markUsed(sub, "*", visited);
        }
      }
    }
  }

  // Propagate all recorded imports through re-export chains
  for (const [file, importedNames] of Array.from(directImports.entries())) {
    for (const name of importedNames) {
      markUsed(file, name);
    }
  }

  // Audit exports for each file
  for (const [norm, exports] of fileExports.entries()) {
    const fileData = fileAsts.get(norm);
    if (!fileData) continue;

    const relPath = path.relative(ROOT, fileData.absPath).replace(/\\/g, "/");

    // UI primitives filter (unless --include-ui)
    if (!includeUi) {
      if (relPath.includes("/components/ui/") || relPath.includes("/styles/")) {
        continue;
      }
    }

    const importedSet = directImports.get(norm) || new Set();
    const hasStarImport = importedSet.has("*");
    if (hasStarImport) continue;

    for (const [name, info] of exports.entries()) {
      if (isFrameworkEntryPoint(norm, name)) continue;

      if (!importedSet.has(name)) {
        if (!info.usedInFile) {
          r.addViolation(
            relPath,
            info.line,
            `Unused export "${name}" (${info.kind}) is never imported anywhere — remove dead code`,
            { fix: `Remove unused export "${name}" or import it where needed` }
          );
        } else if (includeInternal) {
          const fixText =
            info.kind === "export"
              ? `Remove 'export' from '${name}'`
              : `Change 'export ${info.kind} ${name}' to '${info.kind} ${name}'`;
          r.addWarning(
            relPath,
            info.line,
            `Export "${name}" is never imported by other files (only used in this file) — remove 'export' keyword`,
            { fix: fixText }
          );
        }
      }
    }
  }
}

if (autoFix && totalFixedFiles > 0) {
  console.log(`\n✅ Successfully auto-fixed unused imports in ${totalFixedFiles} file(s)!\n`);
  process.exit(0);
}

r.finish({
  fixTip:
    "To auto-fix unused imports across all files, run: node scripts/code/check-unused.cjs --fix\n" +
    "To view exports only used locally in their own file, run: node scripts/code/check-unused.cjs --include-internal",
});
