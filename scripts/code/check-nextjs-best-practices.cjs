"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Next.js Built-in Features & Best Practices Audit", { emoji: "▲" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(ts|tsx|js|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    // Exempt shadcn primitives, next-env, and i18n core configuration
    if (
      relPath.includes("components/ui/") ||
      relPath.includes("next-env.d.ts") ||
      relPath.startsWith("src/i18n/")
    ) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      // 1. Audit Imports: Check for next/link or React.lazy
      ImportDeclaration(p) {
        const source = p.node.source.value;
        const line = p.node.loc ? p.node.loc.start.line : 0;

        // Bypassing next-intl localized navigation
        if (source === "next/link") {
          r.addViolation(
            relPath,
            line,
            "Forbidden direct `next/link` import — use localized `{ Link }` from `@/i18n/navigation` to maintain locale routing",
            { fix: "Change import to: import { Link } from '@/i18n/navigation';" }
          );
        }

        // Unlocalized useRouter or usePathname from next/navigation
        if (source === "next/navigation") {
          const forbiddenRoutingHooks = p.node.specifiers
            .filter((spec) => spec.type === "ImportSpecifier" && ["useRouter", "usePathname"].includes(spec.imported.name))
            .map((spec) => spec.imported.name);

          if (forbiddenRoutingHooks.length > 0 && !relPath.startsWith("src/app/not-found.tsx")) {
            r.addViolation(
              relPath,
              line,
              `Forbidden direct \`${forbiddenRoutingHooks.join(", ")}\` from \`next/navigation\` — use localized \`{ ${forbiddenRoutingHooks.join(", ")} }\` from \`@/i18n/navigation\` to maintain locale routing`,
              { fix: `Change import to: import { ${forbiddenRoutingHooks.join(", ")} } from '@/i18n/navigation';` }
            );
          }
        }

        // Using React.lazy instead of next/dynamic
        if (source === "react") {
          const hasLazy = p.node.specifiers.some(
            (spec) => spec.type === "ImportSpecifier" && spec.imported.name === "lazy"
          );
          if (hasLazy) {
            r.addViolation(
              relPath,
              line,
              "Forbidden `React.lazy` — use Next.js `dynamic()` from `next/dynamic` for SSR-compatible code splitting",
              { fix: "Replace with Next.js dynamic import: import dynamic from 'next/dynamic';" }
            );
          }
        }
      },

      JSXOpeningElement(p) {
        const name = p.node.name && p.node.name.name;
        const line = p.node.loc ? p.node.loc.start.line : 0;

        // 2. Raw <img> instead of Next.js <Image>
        if (name === "img") {
          r.addViolation(
            relPath,
            line,
            "Forbidden raw `<img>` element — use Next.js `<Image>` from `next/image` for automatic optimization, responsive sizing, and CLS prevention",
            { fix: "Replace with Next.js `<Image>` from `next/image`." }
          );
        }

        // 3. Raw <script> tag in components (excluding root layout inline theme script)
        if (name === "script" && !relPath.endsWith("src/app/layout.tsx")) {
          r.addViolation(
            relPath,
            line,
            "Forbidden raw `<script>` tag — use Next.js `<Script>` from `next/script` with an explicit loading strategy",
            { fix: "Replace with `<Script>` from `next/script`." }
          );
        }

        // 4. In-component <head> or <title> in App Router
        if (name === "head" || name === "title") {
          if (!relPath.endsWith("src/app/layout.tsx") && !relPath.includes("components/icons")) {
            r.addViolation(
              relPath,
              line,
              `Forbidden \`<${name}>\` tag in component body — Next.js App Router uses the Metadata API (\`export const metadata\` or \`generateMetadata\`)`,
              { fix: "Remove the tag and define page metadata using Next.js Metadata API." }
            );
          }
        }
      },
    });
  });
}

r.finish({
  fixTip:
    "Next.js Best Practices: Use `@/i18n/navigation` for routing, `<Image>` from `next/image`, and `next/dynamic`.",
});
