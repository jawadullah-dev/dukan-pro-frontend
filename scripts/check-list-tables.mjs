/**
 * Guard: list pages should not render a raw HTML <table> for data lists.
 * Receipts/forms with <table> inside feature detail files are allowlisted.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(process.cwd(), 'src');
const allow = [
  'features/dukaan/components/sales.tsx', // receipt
  'features/dukaan/components/customers.tsx', // ledger detail
  'features/dukaan/components/purchases.tsx', // line items
  'components/ui/table.tsx', // primitive
  'components/data-table/responsive-data-table.tsx', // engine
  'components/ui/table/data-table-skeleton.tsx'
];

const offenders = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      walk(path);
      continue;
    }
    if (!/\.(tsx|jsx)$/.test(name)) continue;
    const rel = relative(root, path).replace(/\\/g, '/');
    if (allow.some((a) => rel.endsWith(a) || rel === a)) continue;
    const src = readFileSync(path, 'utf8');
    if (/<table[\s>]/.test(src) && !/ResponsiveDataTable|from '@\/components\/ui\/table\/data-table'/.test(src)) {
      // Raw table without going through the engine — flag list-like files
      if (/ColumnDef|useDataTable/.test(src) || /dashboard/.test(rel)) {
        offenders.push(rel);
      }
    }
  }
}

walk(root);

if (offenders.length) {
  console.error('Raw <table> data lists found outside ResponsiveDataTable engine:');
  for (const o of offenders) console.error(' -', o);
  process.exit(1);
}

console.log('check-list-tables: ok');
