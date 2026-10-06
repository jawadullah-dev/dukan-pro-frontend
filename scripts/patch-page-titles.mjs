import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('D:/Products/dukan pro');
const replacements = [
  [
    "pageTitle='Dashboard' pageDescription='Shop snapshot for today'",
    "pageTitle='pages.dashboard.title' pageDescription='pages.dashboard.description'"
  ],
  [
    "pageTitle='Sales' pageDescription='Cash, part payment, and Udhar sales'",
    "pageTitle='pages.sales.title' pageDescription='pages.sales.description'"
  ],
  [
    "pageTitle='Customers' pageDescription='Customer list and Udhar'",
    "pageTitle='pages.customers.title' pageDescription='pages.customers.description'"
  ],
  [
    "pageTitle='Customer ledger' pageDescription='Udhar history and payments'",
    "pageTitle='pages.customerLedger.title' pageDescription='pages.customerLedger.description'"
  ],
  [
    "pageTitle='Purchases' pageDescription='Stock-in purchases'",
    "pageTitle='pages.purchases.title' pageDescription='pages.purchases.description'"
  ],
  [
    "pageTitle='Purchase detail' pageDescription='View and cancel with reason'",
    "pageTitle='pages.purchaseDetail.title' pageDescription='pages.purchaseDetail.description'"
  ],
  [
    "pageTitle='Categories' pageDescription='Product categories for this shop'",
    "pageTitle='pages.categories.title' pageDescription='pages.categories.description'"
  ],
  [
    "pageTitle='Brands' pageDescription='Product brands for this shop'",
    "pageTitle='pages.brands.title' pageDescription='pages.brands.description'"
  ],
  [
    "pageTitle='Expenses' pageDescription='Operating expenses'",
    "pageTitle='pages.expenses.title' pageDescription='pages.expenses.description'"
  ],
  [
    "pageTitle='Cash ledger' pageDescription='Append-only cash movements'",
    "pageTitle='pages.cash.title' pageDescription='pages.cash.description'"
  ],
  [
    "pageTitle='Supplier payments' pageDescription='Pay supplier dues later'",
    "pageTitle='pages.supplierPayments.title' pageDescription='pages.supplierPayments.description'"
  ],
  [
    "pageTitle='Sale detail' pageDescription='Receipt, cancel with reason'",
    "pageTitle='pages.saleDetail.title' pageDescription='pages.saleDetail.description'"
  ],
  ["pageTitle='Products'", "pageTitle='pages.products.title'"],
  ["pageTitle='Inventory'", "pageTitle='pages.inventory.title'"],
  ["pageTitle='Inventory movements'", "pageTitle='pages.movements.title'"],
  ["pageTitle='Stock adjustments'", "pageTitle='pages.adjustments.title'"],
  ["pageTitle='Payments'", "pageTitle='pages.payments.title'"],
  ["pageTitle='Expense categories'", "pageTitle='pages.expenseCategories.title'"],
  ["pageTitle='Suppliers'", "pageTitle='pages.suppliers.title'"],
  ["pageTitle='Shop Management'", "pageTitle='pages.shops.title'"],
  ["pageTitle='Subscriptions'", "pageTitle='pages.subscriptions.title'"],
  ["pageTitle='Platform'", "pageTitle='pages.platform.title'"]
];

const files = [
  'src/app/dashboard/overview/layout.tsx',
  'src/app/dashboard/sales/page.tsx',
  'src/app/dashboard/sales/new/page.tsx',
  'src/app/dashboard/customers/page.tsx',
  'src/app/dashboard/customers/[id]/page.tsx',
  'src/app/dashboard/purchases/page.tsx',
  'src/app/dashboard/purchases/new/page.tsx',
  'src/app/dashboard/purchases/[id]/page.tsx',
  'src/app/dashboard/products/page.tsx',
  'src/app/dashboard/products/new/page.tsx',
  'src/app/dashboard/categories/page.tsx',
  'src/app/dashboard/brands/page.tsx',
  'src/app/dashboard/inventory/page.tsx',
  'src/app/dashboard/inventory-movements/page.tsx',
  'src/app/dashboard/stock-adjustments/page.tsx',
  'src/app/dashboard/payments/page.tsx',
  'src/app/dashboard/supplier-payments/page.tsx',
  'src/app/dashboard/expenses/page.tsx',
  'src/app/dashboard/expense-categories/page.tsx',
  'src/app/dashboard/cash/page.tsx',
  'src/app/dashboard/suppliers/page.tsx',
  'src/app/dashboard/sales/[id]/page.tsx',
  'src/app/dashboard/platform/page.tsx',
  'src/app/dashboard/platform/shops/page.tsx',
  'src/app/dashboard/platform/subscriptions/page.tsx'
];

for (const rel of files) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    console.log('missing', rel);
    continue;
  }
  let s = fs.readFileSync(p, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (s.includes(from)) {
      s = s.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(p, s);
    console.log('updated', rel);
  } else {
    console.log('skip', rel);
  }
}
