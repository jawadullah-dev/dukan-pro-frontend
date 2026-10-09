"use strict";

class Reporter {
  constructor(title, opts = {}) {
    this.title = title;
    this.violations = [];
    this.warnings = [];
    this.parseErrors = [];
    this.emoji = opts.emoji || "🔍";
  }

  addViolation(file, line, message, extra = {}) {
    this.violations.push({ file, line, message, ...extra });
  }

  addWarning(file, line, message, extra = {}) {
    this.warnings.push({ file, line, message, ...extra });
  }

  addParseError(file, message) {
    this.parseErrors.push({ file, message });
  }

  finish(opts = {}) {
    console.log(`${this.emoji}  ${this.title}\n`);

    if (this.parseErrors.length > 0) {
      console.log(
        "❌ Parse errors (fix syntax — checks did not run on these files):\n"
      );
      this.parseErrors.forEach((p) => {
        console.log(`  📄 ${p.file}`);
        console.log(`     ${p.message}\n`);
      });
      process.exit(1);
    }

    const grouped = {};

    if (this.violations.length > 0) {
      this.violations.forEach((v) => {
        (grouped[v.file] = grouped[v.file] || []).push(v);
      });

      console.log(
        `❌ Found ${this.violations.length} violation(s) in ${Object.keys(grouped).length} file(s):\n`
      );

      Object.entries(grouped).forEach(([file, items]) => {
        console.log(`  📄 ${file}`);
        items.forEach((v) => {
          const loc = v.line ? ` L${v.line}` : "";
          console.log(`    ${loc}  ${v.message}`);
          if (v.fix) console.log(`       💡 ${v.fix}`);
          if (v.sample) console.log(`       ${v.sample}`);
        });
        console.log();
      });
    }

    if (this.warnings.length > 0) {
      const wGrouped = {};
      this.warnings.forEach((w) => {
        (wGrouped[w.file] = wGrouped[w.file] || []).push(w);
      });

      console.log(`⚠️  ${this.warnings.length} warning(s):\n`);

      Object.entries(wGrouped).forEach(([file, items]) => {
        console.log(`  📄 ${file}`);
        items.forEach((w) => {
          const loc = w.line ? ` L${w.line}` : "";
          console.log(`    ${loc}  ${w.message}`);
          if (w.fix) console.log(`       💡 ${w.fix}`);
        });
        console.log();
      });
    }

    if (opts.fixTip && (this.violations.length > 0 || this.warnings.length > 0)) {
      console.log(`💡 ${opts.fixTip}\n`);
    }

    const total = this.violations.length + this.warnings.length;
    if (total > 0) {
      console.log(`Total: ${this.violations.length} error(s), ${this.warnings.length} warning(s)`);
    }

    if (this.violations.length > 0) {
      process.exit(1);
    }

    if (this.warnings.length > 0 && !opts.warnOnly) {
      process.exit(1);
    }

    if (total === 0) {
      console.log(`✅ ${this.title} — all clean!`);
    }
    process.exit(0);
  }
}

module.exports = { Reporter };
