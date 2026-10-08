const fs = require('fs');
const path = require('path');

const UI_DIR = path.join(__dirname, 'src', 'components', 'ui');
const TABLE_DIR = path.join(UI_DIR, 'table');

const targetFiles = [
  'breadcrumb.tsx',
  'info-button.tsx',
  'dialog.tsx',
  'sheet.tsx',
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

const tableSubFiles = ['data-table-skeleton.tsx'];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filePath}`);
    return { changed: false, changes: [] };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  const changes = [];

  const replacements = [
    [/text-left/g, 'text-start'],
    [/text-right/g, 'text-end'],
    [/ml-auto/g, 'ms-auto'],
    [/mr-auto/g, 'me-auto'],
    [/-ml-/g, '-ms-'],
    [/-mr-/g, '-me-'],
    [/ml-/g, 'ms-'],
    [/mr-/g, 'me-'],
    [/pl-/g, 'ps-'],
    [/pr-/g, 'pe-'],
    [/rounded-l-/g, 'rounded-s-'],
    [/rounded-r-/g, 'rounded-e-'],
    [/border-l-/g, 'border-s-'],
    [/border-r-/g, 'border-e-']
  ];

  for (const [pattern, replacement] of replacements) {
    const count = (content.match(pattern) || []).length;
    if (count > 0) {
      content = content.replace(pattern, replacement);
      changes.push(`${pattern} → ${replacement} (${count}x)`);
    }
  }

  const flexSpaceRegex = /className=\{cn\(\s*'([^']*flex[^']*space-x-[^']*)'/g;
  let match;
  let spaceXCount = 0;
  const tempContent = content;
  content = content.replace(/space-x-/g, (matchStr, offset) => {
    const before = content.slice(Math.max(0, offset - 200), offset);
    if (before.includes('flex')) {
      spaceXCount++;
      return 'gap-x-';
    }
    return matchStr;
  });
  if (spaceXCount > 0) {
    changes.push(`space-x- → gap-x- on flex containers (${spaceXCount}x)`);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`MODIFIED: ${filePath}`);
    changes.forEach(c => console.log(`  - ${c}`));
    return { changed: true, changes };
  } else {
    console.log(`UNCHANGED: ${filePath}`);
    return { changed: false, changes: [] };
  }
}

console.log('Starting RTL CSS fixes...\n');

const allModified = [];

for (const file of targetFiles) {
  const result = processFile(path.join(UI_DIR, file));
  if (result.changed) {
    allModified.push({ file, changes: result.changes });
  }
}

for (const file of tableSubFiles) {
  const result = processFile(path.join(TABLE_DIR, file));
  if (result.changed) {
    allModified.push({ file: `table/${file}`, changes: result.changes });
  }
}

console.log('\n========================================');
console.log(`SUMMARY: ${allModified.length} files modified`);
console.log('========================================');
for (const { file, changes } of allModified) {
  console.log(`\n${file}:`);
  changes.forEach(c => console.log(`  - ${c}`));
}
