const fs = require('fs');
const path = require('path');

const UI_DIR = path.join(__dirname, 'src', 'components', 'ui');
const TABLE_DIR = path.join(UI_DIR, 'table');

const ALL_TARGET_FILES = [
  'pagination.tsx',
  'breadcrumb.tsx',
  'info-button.tsx',
  'sidebar.tsx',
  'infobar.tsx',
  'dialog.tsx',
  'sheet.tsx',
  'carousel.tsx',
  'accordion.tsx',
  'context-menu.tsx',
  'dropdown-menu.tsx',
  'menubar.tsx',
  'navigation-menu.tsx',
  'field.tsx',
  'combobox.tsx',
  'input-group.tsx',
  'marker.tsx',
  'progress.tsx',
  'button.tsx',
  'toggle.tsx',
  'select.tsx',
  'native-select.tsx',
  'tabs.tsx',
  'toggle-group.tsx',
  'badge.tsx',
  'button-group.tsx',
  'drawer.tsx',
  'input-otp.tsx',
  'scroll-area.tsx',
  'item.tsx',
  'alert.tsx',
  'tooltip.tsx',
  'table.tsx',
  'message.tsx',
  'command.tsx',
  'alert-dialog.tsx'
];

const ALL_TABLE_SUBFILES = ['data-table-skeleton.tsx'];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { changed: false, changes: [] };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const changes = [];

  function safeReplace(pattern, replacement, label) {
    const count = (content.match(pattern) || []).length;
    if (count > 0) {
      content = content.replace(pattern, replacement);
      changes.push(`${label} (${count}x)`);
    }
  }

  safeReplace(
    /(?<![\w-])border-l(?![\w-])/g,
    'border-s',
    'border-l → border-s (standalone)'
  );
  safeReplace(
    /(?<![\w-])border-r(?![\w-])/g,
    'border-e',
    'border-r → border-e (standalone)'
  );

  safeReplace(
    /(?<![\w-])rounded-l(?![\w-])/g,
    'rounded-s',
    'rounded-l → rounded-s (standalone)'
  );
  safeReplace(
    /(?<![\w-])rounded-r(?![\w-])/g,
    'rounded-e',
    'rounded-r → rounded-e (standalone)'
  );

  safeReplace(
    /rounded-tl-/g,
    'rounded-ts-',
    'rounded-tl- → rounded-ts- (top-left → top-start)'
  );
  safeReplace(
    /rounded-tr-/g,
    'rounded-te-',
    'rounded-tr- → rounded-te- (top-right → top-end)'
  );
  safeReplace(
    /rounded-bl-/g,
    'rounded-bs-',
    'rounded-bl- → rounded-bs- (bottom-left → bottom-start)'
  );
  safeReplace(
    /rounded-br-/g,
    'rounded-be-',
    'rounded-br- → rounded-be- (bottom-right → bottom-end)'
  );

  safeReplace(
    /(?<![\w-])left-(?=\d|auto|full)/g,
    'start-',
    'left-* → start-* (positioning)'
  );
  safeReplace(
    /(?<![\w-])right-(?=\d|auto|full)/g,
    'end-',
    'right-* → end-* (positioning)'
  );

  const originalContent = fs.readFileSync(filePath, 'utf8');
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return { changed: true, changes };
  }
  return { changed: false, changes: [] };
}

console.log('Second pass RTL CSS fixes (edge cases)...\n');

const allModified = [];

for (const file of ALL_TARGET_FILES) {
  const result = processFile(path.join(UI_DIR, file));
  if (result.changed) {
    allModified.push({ file, changes: result.changes });
  }
}

for (const file of ALL_TABLE_SUBFILES) {
  const result = processFile(path.join(TABLE_DIR, file));
  if (result.changed) {
    allModified.push({ file: `table/${file}`, changes: result.changes });
  }
}

console.log('\n========================================');
console.log(`SECOND PASS SUMMARY: ${allModified.length} files modified`);
console.log('========================================');
for (const { file, changes } of allModified) {
  console.log(`\n${file}:`);
  changes.forEach(c => console.log(`  - ${c}`));
}
