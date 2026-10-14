"use strict";

const fs = require("fs");
const path = require("path");
const traverse = require("@babel/traverse").default;
const { Reporter } = require("./lib/reporter.cjs");
const { walkTree } = require("./lib/walkTree.cjs");
const { parseFile } = require("./lib/parseFile.cjs");

const r = new Reporter("Accessibility & Semantic Navigation Audit (WCAG 2.1)", { emoji: "♿" });

const srcRoot = path.join(__dirname, "../../src");

if (fs.existsSync(srcRoot)) {
  walkTree(srcRoot, (absPath, relPathRaw) => {
    if (!/\.(tsx|jsx)$/.test(absPath)) return;

    const relPath = relPathRaw.split(path.sep).join("/");
    // Exempt shadcn primitives and Next generated types
    if (relPath.includes("components/ui/") || relPath.includes("next-env.d.ts")) {
      return;
    }

    const code = fs.readFileSync(absPath, "utf8");
    if (
      !code.includes("<Button") &&
      !code.includes("<button") &&
      !code.includes("<Image") &&
      !code.includes("<img") &&
      !code.includes("<a")
    ) {
      return;
    }

    let ast;
    try {
      ast = parseFile(absPath, code);
    } catch (e) {
      r.addParseError(relPath, e.message);
      return;
    }

    traverse(ast, {
      JSXElement(p) {
        const opening = p.node.openingElement;
        const name = opening.name && opening.name.name;
        const line = opening.loc ? opening.loc.start.line : 0;
        const attributes = opening.attributes || [];

        // 1. Icon-only Button Accessibility
        if (name === "Button" || name === "button") {
          const isIconSize = attributes.some(
            (a) => a.type === "JSXAttribute" && a.name && a.name.name === "size" && a.value && a.value.value === "icon"
          );

          if (isIconSize) {
            const hasAriaLabel = attributes.some(
              (a) =>
                a.type === "JSXAttribute" &&
                a.name &&
                (a.name.name === "aria-label" || a.name.name === "aria-labelledby")
            );

            const hasSrOnly = p.node.children.some(
              (c) =>
                c.type === "JSXElement" &&
                c.openingElement.attributes.some(
                  (a) =>
                    a.type === "JSXAttribute" &&
                    a.name &&
                    a.name.name === "className" &&
                    a.value &&
                    a.value.value &&
                    a.value.value.includes("sr-only")
                )
            );

            if (!hasAriaLabel && !hasSrOnly) {
              r.addViolation(
                relPath,
                line,
                `Icon button missing accessible label — screen readers cannot identify what this button does`,
                { fix: `Add \`aria-label={t('...')}\` or an internal \`<span className="sr-only">...\` element.` }
              );
            }
          }
        }

        // 2. Image Alt Attributes
        if (name === "Image" || name === "img") {
          const altAttr = attributes.find(
            (a) => a.type === "JSXAttribute" && a.name && a.name.name === "alt"
          );
          if (!altAttr) {
            r.addViolation(
              relPath,
              line,
              `Image element missing \`alt\` attribute — required for WCAG accessibility compliance`,
              { fix: `Add a descriptive \`alt="..."\` or \`alt=""\` if strictly decorative.` }
            );
          }
        }

        // 3. Raw <a> Navigation Check
        if (name === "a") {
          const hrefAttr = attributes.find(
            (a) => a.type === "JSXAttribute" && a.name && a.name.name === "href"
          );

          if (hrefAttr && hrefAttr.value && hrefAttr.value.type === "StringLiteral") {
            const hrefVal = hrefAttr.value.value;
            // Protocol links (tel:, mailto:) and anchor links (#...) are allowed
            const isProtocol = hrefVal.startsWith("tel:") || hrefVal.startsWith("mailto:") || hrefVal.startsWith("#");
            const isExternal = hrefVal.startsWith("http://") || hrefVal.startsWith("https://");

            if (!isProtocol && !isExternal) {
              r.addViolation(
                relPath,
                line,
                `Forbidden raw \`<a>\` tag for internal route ("${hrefVal}") — causes hard page reloads and drops client state`,
                { fix: `Use Next.js \`<Link href="...">\` from \`@/i18n/navigation\` for client-side routing.` }
              );
            }
          }

          // 4. External link tabnabbing security
          const targetAttr = attributes.find(
            (a) => a.type === "JSXAttribute" && a.name && a.name.name === "target"
          );
          const isBlank =
            targetAttr &&
            targetAttr.value &&
            (targetAttr.value.value === "_blank" ||
              (targetAttr.value.expression && targetAttr.value.expression.value === "_blank"));

          if (isBlank) {
            const relAttr = attributes.find(
              (a) => a.type === "JSXAttribute" && a.name && a.name.name === "rel"
            );
            const relVal = relAttr && relAttr.value && relAttr.value.value;
            if (!relVal || !relVal.includes("noopener") || !relVal.includes("noreferrer")) {
              r.addViolation(
                relPath,
                line,
                `External link with \`target="_blank"\` missing \`rel="noopener noreferrer"\` — security vulnerability (reverse tabnabbing)`,
                { fix: `Add \`rel="noopener noreferrer"\` to the link.` }
              );
            }
          }
        }
      },
    });
  });
}

r.finish({
  fixTip: "WCAG Accessibility: Provide aria-labels on icon buttons, alt text on images, and use Next.js <Link>.",
});
