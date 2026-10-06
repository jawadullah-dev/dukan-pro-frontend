import { checkSoftCashWarning, getCashBalance } from './cash';
import {
  getCustomerUdhar,
  getPurchaseOutstanding,
  getSaleOutstanding,
  getSupplierPayable,
  getTotalCustomerUdhar,
  getTotalSupplierPayable,
  buildCustomerLedger
} from './ledger';
import { formatPurchaseNo, formatSaleNo, newId, nowIso, todayIsoDate } from './numbers';
import { assertShopActive, canCancelRecords, getSession, setRuntimeSession } from './session';
import { toDukaanSession } from '@/lib/auth/session-map';
import { getStore, runTransaction } from './store';
import type {
  Brand,
  Category,
  Customer,
  DashboardKpis,
  Expense,
  ExpenseCategory,
  InventoryCondition,
  InventoryMovementType,
  ListFilters,
  Paginated,
  Payment,
  PaymentMethod,
  Product,
  Purchase,
  Sale,
  SoftCashWarning,
  Supplier,
  SupplierPayment
} from './types';

function delay(ms = 80): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function applySort<T>(items: T[], sort?: string): T[] {
  if (!sort) return items;
  try {
    const parsed = JSON.parse(sort) as Array<{ id: string; desc: boolean }>;
    if (!parsed.length) return items;
    const [{ id, desc }] = parsed;
    return items.toSorted((a, b) => {
      const av = (a as Record<string, unknown>)[id];
      const bv = (b as Record<string, unknown>)[id];
      if (av == null && bv == null) return 0;
      if (av == null) return desc ? 1 : -1;
      if (bv == null) return desc ? -1 : 1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return desc ? bv - av : av - bv;
      }
      return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
  } catch {
    return items;
  }
}

function paginate<T>(items: T[], filters: ListFilters): Paginated<T> {
  const sorted = applySort(items, filters.sort);
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const start = (page - 1) * limit;
  return {
    items: sorted.slice(start, start + limit),
    total: sorted.length,
    page,
    limit
  };
}

/** Match item value against comma-separated faceted filter values. */
function matchesFacet(filterCsv: string | undefined, value: string | boolean): boolean {
  if (!filterCsv) return true;
  const allowed = filterCsv.split(',').filter(Boolean);
  if (!allowed.length) return true;
  const normalized = typeof value === 'boolean' ? String(value) : value;
  return allowed.includes(normalized);
}

function shopId(): string {
  assertShopActive();
  return getSession().shop_id;
}

function findIdempotent<T>(
  clientRequestId: string | undefined,
  type: string,
  resolve: (id: string) => T | undefined
): T | undefined {
  if (!clientRequestId) return undefined;
  const hit = getStore().request_index[clientRequestId];
  if (!hit || hit.type !== type) return undefined;
  return resolve(hit.id);
}

function rememberRequest(clientRequestId: string, type: string, id: string): void {
  getStore().request_index[clientRequestId] = { type, id };
}

// ─── Dashboard ───────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKpis> {
  await delay();
  const sid = shopId();
  const store = getStore();
  const today = todayIsoDate();

  const todaySales = store.sales.filter(
    (s) => s.shop_id === sid && s.status === 'ACTIVE' && s.sale_date === today
  );

  const today_sales = todaySales.reduce((sum, s) => sum + s.total_amount, 0);

  let gross = 0;
  for (const sale of todaySales) {
    const items = store.sale_items.filter((i) => i.sale_id === sale.id);
    const cost = items.reduce((sum, i) => sum + i.unit_cost * i.quantity, 0);
    gross += sale.subtotal - sale.discount - cost;
  }

  const today_expenses = store.expenses
    .filter((e) => e.shop_id === sid && e.status === 'ACTIVE' && e.expense_date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const lowQty = store.stock_levels.filter((sl) => {
    if (sl.shop_id !== sid) return false;
    const product = store.products.find((p) => p.id === sl.product_id);
    return product && sl.quantity_on_hand <= product.low_stock_threshold;
  }).length;

  const phoneLow = store.products.filter((p) => {
    if (p.shop_id !== sid || p.tracking_type !== 'SERIALIZED' || !p.is_active) return false;
    const count = store.inventory_units.filter(
      (u) => u.product_id === p.id && u.status === 'IN_STOCK'
    ).length;
    return count <= p.low_stock_threshold;
  }).length;

  return {
    today_sales,
    today_net_profit: gross - today_expenses,
    customer_udhar: getTotalCustomerUdhar(sid),
    supplier_payable: getTotalSupplierPayable(sid),
    today_expenses,
    low_stock_count: lowQty + phoneLow,
    cash_position: getCashBalance(sid)
  };
}

// ─── Categories / Brands / Products ──────────────────────────

export async function listCategories(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  let items = getStore().categories.filter((c) => c.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((c) => c.name.toLowerCase().includes(q));
  }
  return paginate(items, filters);
}

export async function createCategory(name: string): Promise<Category> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    if (
      store.categories.some((c) => c.shop_id === sid && c.name.toLowerCase() === name.toLowerCase())
    ) {
      throw new Error('Category name already exists');
    }
    const row: Category = { id: newId('cat'), shop_id: sid, name, is_active: true };
    store.categories.push(row);
    return row;
  });
}

export async function getCategory(id: string): Promise<Category> {
  await delay();
  const sid = shopId();
  const row = getStore().categories.find((c) => c.id === id && c.shop_id === sid);
  if (!row) throw new Error('Category not found');
  return row;
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<Category, 'name' | 'is_active'>>
) {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.categories.find((c) => c.id === id && c.shop_id === sid);
    if (!row) throw new Error('Category not found');
    Object.assign(row, data);
    return row;
  });
}

export async function deleteCategory(id: string): Promise<Category> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.categories.find((c) => c.id === id && c.shop_id === sid);
    if (!row) throw new Error('Category not found');
    const inUse = store.products.some((p) => p.category_id === id && p.shop_id === sid);
    if (inUse) {
      row.is_active = false;
      return row;
    }
    store.categories = store.categories.filter((c) => c.id !== id);
    return row;
  });
}

export async function listBrands(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  let items = getStore().brands.filter((b) => b.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((b) => b.name.toLowerCase().includes(q));
  }
  return paginate(items, filters);
}

export async function createBrand(name: string): Promise<Brand> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    if (
      store.brands.some((b) => b.shop_id === sid && b.name.toLowerCase() === name.toLowerCase())
    ) {
      throw new Error('Brand name already exists');
    }
    const row: Brand = { id: newId('brand'), shop_id: sid, name, is_active: true };
    store.brands.push(row);
    return row;
  });
}

export async function getBrand(id: string): Promise<Brand> {
  await delay();
  const sid = shopId();
  const row = getStore().brands.find((b) => b.id === id && b.shop_id === sid);
  if (!row) throw new Error('Brand not found');
  return row;
}

export async function updateBrand(id: string, data: Partial<Pick<Brand, 'name' | 'is_active'>>) {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.brands.find((b) => b.id === id && b.shop_id === sid);
    if (!row) throw new Error('Brand not found');
    Object.assign(row, data);
    return row;
  });
}

export async function deleteBrand(id: string): Promise<Brand> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.brands.find((b) => b.id === id && b.shop_id === sid);
    if (!row) throw new Error('Brand not found');
    const inUse = store.products.some((p) => p.brand_id === id && p.shop_id === sid);
    if (inUse) {
      row.is_active = false;
      return row;
    }
    store.brands = store.brands.filter((b) => b.id !== id);
    return row;
  });
}

export async function listProducts(filters: ListFilters & { tracking_type?: string } = {}) {
  await delay();
  const sid = shopId();
  let items = getStore().products.filter((p) => p.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (filters.tracking_type) {
    items = items.filter((p) => matchesFacet(filters.tracking_type, p.tracking_type));
  }
  if (filters.category_id) {
    items = items.filter((p) => matchesFacet(filters.category_id, p.category_id));
  }
  if (filters.brand_id) {
    items = items.filter((p) => matchesFacet(filters.brand_id, p.brand_id));
  }
  if (filters.is_active) {
    items = items.filter((p) => matchesFacet(filters.is_active, p.is_active));
  }
  return paginate(items, filters);
}

export async function getProduct(id: string) {
  await delay();
  const sid = shopId();
  const product = getStore().products.find((p) => p.id === id && p.shop_id === sid);
  if (!product) throw new Error('Product not found');
  return product;
}

export async function createProduct(input: {
  category_id: string;
  brand_id: string;
  name: string;
  model?: string;
  color?: string;
  ram?: string;
  storage?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  tracking_type: 'SERIALIZED' | 'QUANTITY';
  default_purchase_price: number;
  default_selling_price: number;
  low_stock_threshold: number;
}): Promise<Product> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    if (
      store.products.some(
        (p) => p.shop_id === sid && p.name.toLowerCase() === input.name.toLowerCase()
      )
    ) {
      throw new Error('Product name already exists');
    }
    const product: Product = {
      id: newId('prod'),
      shop_id: sid,
      ...input,
      is_active: true,
      created_at: nowIso()
    };
    store.products.push(product);
    if (input.tracking_type === 'QUANTITY') {
      store.stock_levels.push({
        id: newId('sl'),
        shop_id: sid,
        product_id: product.id,
        quantity_on_hand: 0,
        avg_unit_cost: 0
      });
    }
    return product;
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'shop_id' | 'tracking_type' | 'created_at'>> & {
    is_active?: boolean;
  }
) {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.products.find((p) => p.id === id && p.shop_id === sid);
    if (!row) throw new Error('Product not found');
    Object.assign(row, data);
    return row;
  });
}

export async function deleteProduct(id: string): Promise<Product> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.products.find((p) => p.id === id && p.shop_id === sid);
    if (!row) throw new Error('Product not found');
    const used =
      store.purchase_items.some((i) => i.product_id === id) ||
      store.sale_items.some((i) => i.product_id === id) ||
      store.stock_levels.some((s) => s.product_id === id && s.quantity_on_hand > 0) ||
      store.inventory_units.some((u) => u.product_id === id && u.status === 'IN_STOCK');
    if (used) {
      row.is_active = false;
      return row;
    }
    store.products = store.products.filter((p) => p.id !== id);
    store.stock_levels = store.stock_levels.filter((s) => s.product_id !== id);
    return row;
  });
}

// ─── Suppliers / Customers ───────────────────────────────────

export async function listSuppliers(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  let items = getStore().suppliers.filter((s) => s.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (s) => s.name.toLowerCase().includes(q) || s.phone.toLowerCase().includes(q)
    );
  }
  const withPayable = items.map((s) => ({
    ...s,
    payable: getSupplierPayable(sid, s.id)
  }));
  return paginate(withPayable, filters);
}

export async function createSupplier(input: {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  opening_balance?: number;
}): Promise<Supplier> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row: Supplier = {
      id: newId('sup'),
      shop_id: sid,
      name: input.name,
      phone: input.phone,
      address: input.address,
      notes: input.notes,
      opening_balance: input.opening_balance ?? 0,
      is_system: false,
      is_active: true,
      created_at: nowIso()
    };
    store.suppliers.push(row);
    return row;
  });
}

export async function updateSupplier(
  id: string,
  data: Partial<Pick<Supplier, 'name' | 'phone' | 'address' | 'notes' | 'is_active'>>
) {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.suppliers.find((s) => s.id === id && s.shop_id === sid);
    if (!row) throw new Error('Supplier not found');
    if (row.is_system) {
      if (data.is_active === false) {
        throw new Error('Walk-in seller cannot be deactivated');
      }
      if (data.name != null && data.name !== row.name) {
        throw new Error('Walk-in seller cannot be renamed');
      }
    }
    Object.assign(row, data);
    return row;
  });
}

export async function listCustomers(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  let items = getStore().customers.filter((c) => c.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    );
  }
  let withUdhar = items.map((c) => ({
    ...c,
    udhar: getCustomerUdhar(sid, c.id)
  }));
  if (filters.udhar_state) {
    withUdhar = withUdhar.filter((c) => {
      const state = c.udhar > 0 ? 'owing' : 'settled';
      return matchesFacet(filters.udhar_state, state);
    });
  }
  return paginate(withUdhar, filters);
}

export async function getCustomer(id: string) {
  await delay();
  const sid = shopId();
  const customer = getStore().customers.find((c) => c.id === id && c.shop_id === sid);
  if (!customer) throw new Error('Customer not found');
  return {
    ...customer,
    udhar: getCustomerUdhar(sid, id),
    ledger: buildCustomerLedger(sid, id)
  };
}

export async function createCustomer(input: {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  opening_balance?: number;
}): Promise<Customer> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row: Customer = {
      id: newId('cust'),
      shop_id: sid,
      name: input.name,
      phone: input.phone,
      address: input.address,
      notes: input.notes,
      opening_balance: input.opening_balance ?? 0,
      is_active: true,
      created_at: nowIso()
    };
    store.customers.push(row);
    return row;
  });
}

export async function updateCustomer(
  id: string,
  data: Partial<Pick<Customer, 'name' | 'phone' | 'address' | 'notes' | 'is_active'>>
) {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.customers.find((c) => c.id === id && c.shop_id === sid);
    if (!row) throw new Error('Customer not found');
    Object.assign(row, data);
    return row;
  });
}

// ─── Purchases ───────────────────────────────────────────────

export type PurchaseLineInput = {
  product_id: string;
  quantity: number;
  unit_cost: number;
  /** Primary IMEIs — one per unit for SERIALIZED products */
  imei1?: string[];
  /** Optional secondary IMEIs aligned by index with imei1 */
  imei2?: string[];
  condition?: InventoryCondition;
};

function imeiAlreadyExists(
  store: ReturnType<typeof getStore>,
  shopId: string,
  imei: string
): boolean {
  return store.inventory_units.some(
    (u) => u.shop_id === shopId && (u.imei1 === imei || (u.imei2 != null && u.imei2 === imei))
  );
}

export async function listPurchases(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  const store = getStore();
  let items = store.purchases
    .filter((p) => p.shop_id === sid)
    .map((p) => ({
      ...p,
      supplier_name: store.suppliers.find((s) => s.id === p.supplier_id)?.name ?? '—'
    }));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.purchase_no.toLowerCase().includes(q) ||
        (p.supplier_invoice_ref ?? '').toLowerCase().includes(q) ||
        p.supplier_name.toLowerCase().includes(q)
    );
  }
  if (filters.status) {
    items = items.filter((p) => matchesFacet(filters.status, p.status));
  }
  items = items.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  return paginate(items, filters);
}

export async function getPurchase(id: string) {
  await delay();
  const sid = shopId();
  const store = getStore();
  const purchase = store.purchases.find((p) => p.id === id && p.shop_id === sid);
  if (!purchase) throw new Error('Purchase not found');
  const items = store.purchase_items.filter((i) => i.purchase_id === id);
  const payments = store.supplier_payments.filter((p) => p.purchase_id === id);
  return {
    ...purchase,
    items,
    payments,
    outstanding: getPurchaseOutstanding(id),
    supplier: store.suppliers.find((s) => s.id === purchase.supplier_id)
  };
}

export async function createPurchase(input: {
  supplier_id: string;
  supplier_invoice_ref?: string;
  purchase_date?: string;
  paid_now: number;
  is_opening_stock?: boolean;
  confirm_overdraft?: boolean;
  client_request_id: string;
  lines: PurchaseLineInput[];
}): Promise<{ purchase?: Purchase; cash_warning?: SoftCashWarning }> {
  await delay();
  const sid = shopId();

  const existing = findIdempotent(input.client_request_id, 'purchase', (id) =>
    getStore().purchases.find((p) => p.id === id)
  );
  if (existing) return { purchase: existing };

  if (!input.lines.length) throw new Error('Add at least one item');

  const isOpening = Boolean(input.is_opening_stock);
  const paidNow = isOpening ? 0 : input.paid_now;

  const warning = checkSoftCashWarning(sid, paidNow);
  if (!isOpening && warning.needs_confirm && !input.confirm_overdraft) {
    return { cash_warning: warning };
  }

  const purchase = runTransaction((store) => {
    for (const line of input.lines) {
      if (line.quantity <= 0) throw new Error('Quantity must be more than 0');
      const product = store.products.find((p) => p.id === line.product_id && p.shop_id === sid);
      if (!product) throw new Error('Product not found');
      if (product.tracking_type === 'SERIALIZED') {
        const imei1List = line.imei1 ?? [];
        if (imei1List.length !== line.quantity) {
          throw new Error(`IMEI count must equal quantity for ${product.name}`);
        }
        const imei2List = line.imei2 ?? [];
        if (imei2List.length > 0 && imei2List.length !== line.quantity) {
          throw new Error(`IMEI2 count must equal quantity for ${product.name}`);
        }
        for (let i = 0; i < imei1List.length; i++) {
          const imei1 = imei1List[i]!;
          if (imeiAlreadyExists(store, sid, imei1)) {
            throw new Error(`IMEI already exists: ${imei1}`);
          }
          const imei2 = imei2List[i];
          if (imei2) {
            if (imei2 === imei1) {
              throw new Error(`IMEI1 and IMEI2 cannot be the same: ${imei1}`);
            }
            if (imeiAlreadyExists(store, sid, imei2)) {
              throw new Error(`IMEI already exists: ${imei2}`);
            }
          }
        }
      }
    }

    const shop = store.shops.find((s) => s.id === sid)!;
    const purchaseNo = formatPurchaseNo(shop.next_purchase_no);
    shop.next_purchase_no += 1;

    const totalAmount = input.lines.reduce((sum, l) => sum + l.quantity * l.unit_cost, 0);
    const purchaseRow: Purchase = {
      id: newId('pur'),
      shop_id: sid,
      supplier_id: input.supplier_id,
      purchase_no: purchaseNo,
      supplier_invoice_ref: input.supplier_invoice_ref,
      purchase_date: input.purchase_date ?? todayIsoDate(),
      total_amount: totalAmount,
      status: 'ACTIVE',
      is_opening_stock: isOpening,
      client_request_id: input.client_request_id,
      created_at: nowIso()
    };
    store.purchases.push(purchaseRow);

    for (const line of input.lines) {
      const product = store.products.find((p) => p.id === line.product_id)!;
      const piId = newId('pi');
      store.purchase_items.push({
        id: piId,
        shop_id: sid,
        purchase_id: purchaseRow.id,
        product_id: line.product_id,
        quantity: line.quantity,
        unit_cost: line.unit_cost,
        total_cost: line.quantity * line.unit_cost
      });

      if (product.tracking_type === 'SERIALIZED') {
        const imei1List = line.imei1 ?? [];
        const imei2List = line.imei2 ?? [];
        for (let i = 0; i < imei1List.length; i++) {
          const unitId = newId('iu');
          store.inventory_units.push({
            id: unitId,
            shop_id: sid,
            product_id: line.product_id,
            purchase_item_id: piId,
            imei1: imei1List[i]!,
            imei2: imei2List[i] || undefined,
            condition: line.condition ?? 'NEW',
            unit_cost: line.unit_cost,
            status: 'IN_STOCK',
            created_at: nowIso()
          });
          store.inventory_movements.push({
            id: newId('im'),
            shop_id: sid,
            product_id: line.product_id,
            inventory_unit_id: unitId,
            type: 'PURCHASE',
            quantity_change: 1,
            reference_type: 'purchase',
            reference_id: purchaseRow.id,
            created_at: nowIso()
          });
        }
      } else {
        const sl = store.stock_levels.find((s) => s.product_id === line.product_id)!;
        const prevQty = sl.quantity_on_hand;
        const prevCost = sl.avg_unit_cost;
        const newQty = prevQty + line.quantity;
        sl.avg_unit_cost =
          newQty === 0
            ? 0
            : Math.round((prevQty * prevCost + line.quantity * line.unit_cost) / newQty);
        sl.quantity_on_hand = newQty;
        store.inventory_movements.push({
          id: newId('im'),
          shop_id: sid,
          product_id: line.product_id,
          type: 'PURCHASE',
          quantity_change: line.quantity,
          reference_type: 'purchase',
          reference_id: purchaseRow.id,
          created_at: nowIso()
        });
      }
    }

    if (!isOpening && paidNow > 0) {
      const spId = newId('sp');
      store.supplier_payments.push({
        id: spId,
        shop_id: sid,
        supplier_id: input.supplier_id,
        purchase_id: purchaseRow.id,
        amount: paidNow,
        payment_date: purchaseRow.purchase_date,
        status: 'ACTIVE',
        client_request_id: `${input.client_request_id}_pay`,
        created_at: nowIso()
      });
      store.cash_movements.push({
        id: newId('cm'),
        shop_id: sid,
        type: 'SUPPLIER_PAYMENT',
        direction: 'OUT',
        amount: paidNow,
        is_overdraft: Boolean(warning.needs_confirm && input.confirm_overdraft),
        reference_type: 'supplier_payment',
        reference_id: spId,
        created_at: nowIso()
      });
    }

    rememberRequest(input.client_request_id, 'purchase', purchaseRow.id);
    return purchaseRow;
  });

  return { purchase };
}

// ─── Supplier payments ───────────────────────────────────────

export async function createSupplierPayment(input: {
  supplier_id: string;
  purchase_id?: string;
  amount: number;
  payment_date?: string;
  notes?: string;
  confirm_overdraft?: boolean;
  client_request_id: string;
}): Promise<{ payment?: SupplierPayment; cash_warning?: SoftCashWarning }> {
  await delay();
  const sid = shopId();

  const existing = findIdempotent(input.client_request_id, 'supplier_payment', (id) =>
    getStore().supplier_payments.find((p) => p.id === id)
  );
  if (existing) return { payment: existing };

  if (input.amount <= 0) throw new Error('Amount must be more than 0');

  if (input.purchase_id) {
    const left = getPurchaseOutstanding(input.purchase_id);
    if (input.amount > left) throw new Error('Payment cannot exceed outstanding');
  } else {
    const left = getSupplierPayable(sid, input.supplier_id);
    // paying opening — allow up to total payable including opening portion
    if (input.amount > left) throw new Error('Payment cannot exceed payable');
  }

  const warning = checkSoftCashWarning(sid, input.amount);
  if (warning.needs_confirm && !input.confirm_overdraft) {
    return { cash_warning: warning };
  }

  const payment = runTransaction((store) => {
    const row: SupplierPayment = {
      id: newId('sp'),
      shop_id: sid,
      supplier_id: input.supplier_id,
      purchase_id: input.purchase_id,
      amount: input.amount,
      payment_date: input.payment_date ?? todayIsoDate(),
      notes: input.notes,
      status: 'ACTIVE',
      client_request_id: input.client_request_id,
      created_at: nowIso()
    };
    store.supplier_payments.push(row);
    store.cash_movements.push({
      id: newId('cm'),
      shop_id: sid,
      type: 'SUPPLIER_PAYMENT',
      direction: 'OUT',
      amount: input.amount,
      is_overdraft: Boolean(warning.needs_confirm && input.confirm_overdraft),
      reference_type: 'supplier_payment',
      reference_id: row.id,
      created_at: nowIso()
    });
    rememberRequest(input.client_request_id, 'supplier_payment', row.id);
    return row;
  });

  return { payment };
}

export async function listSupplierPayments(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  const store = getStore();
  let items = store.supplier_payments
    .filter((p) => p.shop_id === sid)
    .map((p) => ({
      ...p,
      supplier_name: store.suppliers.find((s) => s.id === p.supplier_id)?.name ?? '—'
    }));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.created_at.toLowerCase().includes(q) ||
        p.payment_date.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.supplier_name.toLowerCase().includes(q) ||
        (p.notes ?? '').toLowerCase().includes(q) ||
        String(p.amount).includes(q)
    );
  }
  if (filters.status) {
    items = items.filter((p) => matchesFacet(filters.status, p.status));
  }
  items = items.toSorted((a, b) => b.payment_date.localeCompare(a.payment_date));
  return paginate(items, filters);
}

// ─── Stock ───────────────────────────────────────────────────

export async function listStock(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  const store = getStore();
  const qtyRows = store.stock_levels
    .filter((sl) => sl.shop_id === sid)
    .map((sl) => {
      const product = store.products.find((p) => p.id === sl.product_id)!;
      return {
        id: sl.id,
        product_id: sl.product_id,
        product_name: product.name,
        tracking_type: 'QUANTITY' as const,
        quantity: sl.quantity_on_hand,
        avg_unit_cost: sl.avg_unit_cost,
        low_stock: sl.quantity_on_hand <= product.low_stock_threshold
      };
    });

  const serialized = store.products
    .filter((p) => p.shop_id === sid && p.tracking_type === 'SERIALIZED' && p.is_active)
    .map((p) => {
      const units = store.inventory_units.filter(
        (u) => u.product_id === p.id && u.status === 'IN_STOCK'
      );
      return {
        id: p.id,
        product_id: p.id,
        product_name: p.name,
        tracking_type: 'SERIALIZED' as const,
        quantity: units.length,
        avg_unit_cost:
          units.length === 0
            ? p.default_purchase_price
            : Math.round(units.reduce((s, u) => s + u.unit_cost, 0) / units.length),
        low_stock: units.length <= p.low_stock_threshold,
        units
      };
    });

  let items = [...qtyRows, ...serialized];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((i) => i.product_name.toLowerCase().includes(q));
  }
  if (filters.tracking_type) {
    items = items.filter((i) => matchesFacet(filters.tracking_type, i.tracking_type));
  }
  if (filters.low_stock) {
    items = items.filter((i) => matchesFacet(filters.low_stock, i.low_stock));
  }
  return paginate(items, filters);
}

export async function listInStockUnits(productId?: string) {
  await delay();
  const sid = shopId();
  return getStore().inventory_units.filter(
    (u) =>
      u.shop_id === sid && u.status === 'IN_STOCK' && (!productId || u.product_id === productId)
  );
}

export async function adjustStock(input: {
  product_id: string;
  inventory_unit_id?: string;
  type: 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  counted_quantity?: number;
  reason: string;
}) {
  await delay();
  const sid = shopId();
  if (!input.reason.trim()) throw new Error('Reason is required');

  return runTransaction((store) => {
    const product = store.products.find((p) => p.id === input.product_id && p.shop_id === sid);
    if (!product) throw new Error('Product not found');

    if (product.tracking_type === 'SERIALIZED') {
      const unit = store.inventory_units.find(
        (u) => u.id === input.inventory_unit_id && u.shop_id === sid
      );
      if (!unit || unit.status !== 'IN_STOCK') {
        throw new Error('Only IN_STOCK phones can be adjusted');
      }
      unit.status = input.type === 'ADJUSTMENT' ? 'LOST' : input.type;
      store.inventory_movements.push({
        id: newId('im'),
        shop_id: sid,
        product_id: product.id,
        inventory_unit_id: unit.id,
        type: input.type as InventoryMovementType,
        quantity_change: -1,
        reason: input.reason,
        created_at: nowIso()
      });
      return { ok: true };
    }

    const sl = store.stock_levels.find((s) => s.product_id === product.id);
    if (!sl) throw new Error('Stock level not found');
    if (input.counted_quantity === undefined) throw new Error('Counted quantity required');
    const diff = input.counted_quantity - sl.quantity_on_hand;
    if (input.counted_quantity < 0) throw new Error('Stock cannot be negative');
    sl.quantity_on_hand = input.counted_quantity;
    store.inventory_movements.push({
      id: newId('im'),
      shop_id: sid,
      product_id: product.id,
      type: input.type as InventoryMovementType,
      quantity_change: diff,
      reason: input.reason,
      created_at: nowIso()
    });
    return { ok: true, quantity_change: diff };
  });
}

// ─── Sales ───────────────────────────────────────────────────

export type SaleLineInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
  inventory_unit_id?: string;
};

export async function listSales(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  const store = getStore();
  let items = store.sales.filter((s) => s.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((s) => {
      const customerName = s.customer_id
        ? (store.customers.find((c) => c.id === s.customer_id)?.name ?? '')
        : '';
      return s.sale_no.toLowerCase().includes(q) || customerName.toLowerCase().includes(q);
    });
  }
  if (filters.status) {
    items = items.filter((s) => matchesFacet(filters.status, s.status));
  }
  items = items.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  const enriched = items.map((s) => ({
    ...s,
    customer_name: s.customer_id
      ? (store.customers.find((c) => c.id === s.customer_id)?.name ?? 'Walk-in')
      : 'Walk-in',
    outstanding: getSaleOutstanding(s.id),
    paid: s.total_amount - getSaleOutstanding(s.id)
  }));
  return paginate(enriched, filters);
}

export async function getSale(id: string) {
  await delay();
  const sid = shopId();
  const store = getStore();
  const sale = store.sales.find((s) => s.id === id && s.shop_id === sid);
  if (!sale) throw new Error('Sale not found');
  const items = store.sale_items
    .filter((i) => i.sale_id === id)
    .map((item) => {
      const product = store.products.find((p) => p.id === item.product_id);
      const unit = item.inventory_unit_id
        ? store.inventory_units.find((u) => u.id === item.inventory_unit_id)
        : undefined;
      return { ...item, product, unit };
    });
  const payments = store.payments.filter((p) => p.sale_id === id);
  const customer = sale.customer_id
    ? store.customers.find((c) => c.id === sale.customer_id)
    : undefined;
  return {
    ...sale,
    items,
    payments,
    customer,
    outstanding: getSaleOutstanding(id),
    shop: store.shops.find((s) => s.id === sid)
  };
}

export async function createSale(input: {
  customer_id?: string;
  discount?: number;
  paid_now: number;
  method?: PaymentMethod;
  due_date?: string;
  client_request_id: string;
  lines: SaleLineInput[];
}): Promise<{ sale: Sale; below_cost_warning?: boolean }> {
  await delay();
  const sid = shopId();

  const existing = findIdempotent(input.client_request_id, 'sale', (id) =>
    getStore().sales.find((s) => s.id === id)
  );
  if (existing) return { sale: existing };

  if (!input.lines.length) throw new Error('Add at least one item');

  const sale = runTransaction((store) => {
    let hasPhone = false;
    let belowCost = false;
    const resolved: Array<SaleLineInput & { unit_cost: number }> = [];

    for (const line of input.lines) {
      const product = store.products.find((p) => p.id === line.product_id && p.shop_id === sid);
      if (!product) throw new Error('Product not found');

      if (product.tracking_type === 'SERIALIZED') {
        hasPhone = true;
        const unit = store.inventory_units.find(
          (u) => u.id === line.inventory_unit_id && u.shop_id === sid
        );
        if (!unit || unit.status !== 'IN_STOCK') {
          throw new Error(`IMEI not available for ${product.name}`);
        }
        if (line.unit_price < unit.unit_cost) belowCost = true;
        resolved.push({ ...line, quantity: 1, unit_cost: unit.unit_cost });
      } else {
        const sl = store.stock_levels.find((s) => s.product_id === product.id);
        if (!sl || sl.quantity_on_hand < line.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
        if (line.unit_price < sl.avg_unit_cost) belowCost = true;
        resolved.push({ ...line, unit_cost: sl.avg_unit_cost });
      }
    }

    if (hasPhone && !input.customer_id) {
      throw new Error('Phone sale requires a customer');
    }

    const subtotal = resolved.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
    const discount = input.discount ?? 0;
    const totalAmount = subtotal - discount;
    const outstanding = totalAmount - input.paid_now;

    if (outstanding > 0 && !input.customer_id) {
      throw new Error('Udhar requires a customer');
    }
    if (input.paid_now < 0 || input.paid_now > totalAmount) {
      throw new Error('Paid amount is invalid');
    }

    const shop = store.shops.find((s) => s.id === sid)!;
    const saleNo = formatSaleNo(shop.next_sale_no);
    shop.next_sale_no += 1;

    const saleRow: Sale = {
      id: newId('sale'),
      shop_id: sid,
      customer_id: input.customer_id,
      sale_no: saleNo,
      sale_date: todayIsoDate(),
      subtotal,
      discount,
      total_amount: totalAmount,
      due_date: outstanding > 0 ? input.due_date : undefined,
      status: 'ACTIVE',
      client_request_id: input.client_request_id,
      created_at: nowIso()
    };
    store.sales.push(saleRow);

    for (const line of resolved) {
      const product = store.products.find((p) => p.id === line.product_id)!;
      const siId = newId('si');
      store.sale_items.push({
        id: siId,
        shop_id: sid,
        sale_id: saleRow.id,
        product_id: line.product_id,
        inventory_unit_id: line.inventory_unit_id,
        quantity: line.quantity,
        unit_price: line.unit_price,
        unit_cost: line.unit_cost,
        total: line.quantity * line.unit_price
      });

      if (product.tracking_type === 'SERIALIZED') {
        const unit = store.inventory_units.find((u) => u.id === line.inventory_unit_id)!;
        unit.status = 'SOLD';
        store.inventory_movements.push({
          id: newId('im'),
          shop_id: sid,
          product_id: product.id,
          inventory_unit_id: unit.id,
          type: 'SALE',
          quantity_change: -1,
          reference_type: 'sale',
          reference_id: saleRow.id,
          created_at: nowIso()
        });
      } else {
        const sl = store.stock_levels.find((s) => s.product_id === product.id)!;
        sl.quantity_on_hand -= line.quantity;
        store.inventory_movements.push({
          id: newId('im'),
          shop_id: sid,
          product_id: product.id,
          type: 'SALE',
          quantity_change: -line.quantity,
          reference_type: 'sale',
          reference_id: saleRow.id,
          created_at: nowIso()
        });
      }
    }

    if (input.paid_now > 0) {
      const payId = newId('pay');
      store.payments.push({
        id: payId,
        shop_id: sid,
        customer_id: input.customer_id,
        sale_id: saleRow.id,
        amount: input.paid_now,
        method: input.method ?? 'CASH',
        receipt_group_id: newId('rg'),
        status: 'ACTIVE',
        client_request_id: `${input.client_request_id}_pay`,
        created_at: nowIso()
      });
      store.cash_movements.push({
        id: newId('cm'),
        shop_id: sid,
        type: 'CUSTOMER_PAYMENT',
        direction: 'IN',
        amount: input.paid_now,
        is_overdraft: false,
        reference_type: 'payment',
        reference_id: payId,
        note: input.customer_id ? undefined : 'Walk-in',
        created_at: nowIso()
      });
    }

    rememberRequest(input.client_request_id, 'sale', saleRow.id);
    return { saleRow, belowCost };
  });

  return { sale: sale.saleRow, below_cost_warning: sale.belowCost };
}

// ─── Customer Udhar payment ──────────────────────────────────

export async function receiveCustomerPayment(input: {
  customer_id: string;
  amount: number;
  method?: PaymentMethod;
  sale_id?: string;
  client_request_id: string;
}): Promise<{ payments: Payment[] }> {
  await delay();
  const sid = shopId();

  const existing = findIdempotent(input.client_request_id, 'payment_group', (id) => {
    const payments = getStore().payments.filter((p) => p.receipt_group_id === id);
    return payments.length ? payments : undefined;
  });
  if (existing) return { payments: existing };

  if (input.amount <= 0) throw new Error('Amount must be more than 0');
  const totalUdhar = getCustomerUdhar(sid, input.customer_id);
  if (input.amount > totalUdhar) {
    throw new Error('Payment cannot exceed total Udhar');
  }

  const payments = runTransaction((store) => {
    const receiptGroupId = newId('rg');
    const created: Payment[] = [];
    let remaining = input.amount;

    const targets: Array<{ sale_id?: string; outstanding: number }> = [];

    if (input.sale_id) {
      targets.push({ sale_id: input.sale_id, outstanding: getSaleOutstanding(input.sale_id) });
    } else {
      const customer = store.customers.find((c) => c.id === input.customer_id)!;
      const openingPaid = store.payments
        .filter((p) => p.customer_id === input.customer_id && !p.sale_id && p.status === 'ACTIVE')
        .reduce((s, p) => s + p.amount, 0);
      const openingLeft = Math.max(0, customer.opening_balance - openingPaid);
      if (openingLeft > 0) targets.push({ outstanding: openingLeft });

      const unpaidSales = store.sales
        .filter(
          (s) =>
            s.shop_id === sid &&
            s.customer_id === input.customer_id &&
            s.status === 'ACTIVE' &&
            getSaleOutstanding(s.id) > 0
        )
        .toSorted(
          (a, b) =>
            a.sale_date.localeCompare(b.sale_date) || a.created_at.localeCompare(b.created_at)
        );

      for (const s of unpaidSales) {
        targets.push({ sale_id: s.id, outstanding: getSaleOutstanding(s.id) });
      }
    }

    for (const target of targets) {
      if (remaining <= 0) break;
      const apply = Math.min(remaining, target.outstanding);
      if (apply <= 0) continue;
      const payId = newId('pay');
      const row: Payment = {
        id: payId,
        shop_id: sid,
        customer_id: input.customer_id,
        sale_id: target.sale_id,
        amount: apply,
        method: input.method ?? 'CASH',
        receipt_group_id: receiptGroupId,
        status: 'ACTIVE',
        client_request_id: `${input.client_request_id}_${payId}`,
        created_at: nowIso()
      };
      store.payments.push(row);
      store.cash_movements.push({
        id: newId('cm'),
        shop_id: sid,
        type: 'CUSTOMER_PAYMENT',
        direction: 'IN',
        amount: apply,
        is_overdraft: false,
        reference_type: 'payment',
        reference_id: payId,
        created_at: nowIso()
      });
      created.push(row);
      remaining -= apply;
    }

    rememberRequest(input.client_request_id, 'payment_group', receiptGroupId);
    return created;
  });

  return { payments };
}

// ─── Expenses ────────────────────────────────────────────────

export async function listExpenseCategories(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  let items = getStore().expense_categories.filter((c) => c.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((c) => c.name.toLowerCase().includes(q));
  }
  return paginate(items, filters);
}

export async function createExpenseCategory(name: string): Promise<ExpenseCategory> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    if (
      store.expense_categories.some(
        (c) => c.shop_id === sid && c.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      throw new Error('Expense category name already exists');
    }
    const row: ExpenseCategory = {
      id: newId('ec'),
      shop_id: sid,
      name,
      is_active: true
    };
    store.expense_categories.push(row);
    return row;
  });
}

export async function updateExpenseCategory(
  id: string,
  data: Partial<Pick<ExpenseCategory, 'name' | 'is_active'>>
) {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.expense_categories.find((c) => c.id === id && c.shop_id === sid);
    if (!row) throw new Error('Expense category not found');
    if (data.name) {
      const trimmed = data.name.trim();
      if (
        store.expense_categories.some(
          (c) => c.shop_id === sid && c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        throw new Error('Expense category name already exists');
      }
      row.name = trimmed;
    }
    if (typeof data.is_active === 'boolean') row.is_active = data.is_active;
    return row;
  });
}

export async function deleteExpenseCategory(id: string): Promise<ExpenseCategory> {
  await delay();
  const sid = shopId();
  return runTransaction((store) => {
    const row = store.expense_categories.find((c) => c.id === id && c.shop_id === sid);
    if (!row) throw new Error('Expense category not found');
    const inUse = store.expenses.some((e) => e.category_id === id && e.shop_id === sid);
    if (inUse) {
      row.is_active = false;
      return row;
    }
    store.expense_categories = store.expense_categories.filter((c) => c.id !== id);
    return row;
  });
}

export async function listExpenses(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  const store = getStore();
  let items = store.expenses
    .filter((e) => e.shop_id === sid)
    .map((e) => ({
      ...e,
      category_name: store.expense_categories.find((c) => c.id === e.category_id)?.name ?? '—'
    }));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (e) =>
        e.expense_date.toLowerCase().includes(q) ||
        (e.description ?? '').toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q) ||
        e.category_name.toLowerCase().includes(q) ||
        String(e.amount).includes(q)
    );
  }
  if (filters.status) {
    items = items.filter((e) => matchesFacet(filters.status, e.status));
  }
  items = items.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  return paginate(items, filters);
}

export async function createExpense(input: {
  category_id: string;
  amount: number;
  expense_date?: string;
  description?: string;
  confirm_overdraft?: boolean;
}): Promise<{ expense?: Expense; cash_warning?: SoftCashWarning }> {
  await delay();
  const sid = shopId();
  if (input.amount <= 0) throw new Error('Amount must be more than 0');

  const warning = checkSoftCashWarning(sid, input.amount);
  if (warning.needs_confirm && !input.confirm_overdraft) {
    return { cash_warning: warning };
  }

  const expense = runTransaction((store) => {
    const row: Expense = {
      id: newId('exp'),
      shop_id: sid,
      category_id: input.category_id,
      amount: input.amount,
      expense_date: input.expense_date ?? todayIsoDate(),
      description: input.description,
      status: 'ACTIVE',
      created_at: nowIso()
    };
    store.expenses.push(row);
    store.cash_movements.push({
      id: newId('cm'),
      shop_id: sid,
      type: 'EXPENSE',
      direction: 'OUT',
      amount: input.amount,
      is_overdraft: Boolean(warning.needs_confirm && input.confirm_overdraft),
      reference_type: 'expense',
      reference_id: row.id,
      created_at: nowIso()
    });
    return row;
  });

  return { expense };
}

export async function cancelExpense(id: string, reason: string) {
  await delay();
  const sid = shopId();
  if (!reason.trim()) throw new Error('Reason is required');
  return runTransaction((store) => {
    const row = store.expenses.find((e) => e.id === id && e.shop_id === sid);
    if (!row || row.status === 'CANCELLED')
      throw new Error('Expense not found or already cancelled');
    row.status = 'CANCELLED';
    row.cancelled_at = nowIso();
    row.cancel_reason = reason;
    const original = store.cash_movements.find(
      (m) => m.reference_type === 'expense' && m.reference_id === id
    );
    store.cash_movements.push({
      id: newId('cm'),
      shop_id: sid,
      type: 'REVERSAL',
      direction: 'IN',
      amount: row.amount,
      is_overdraft: false,
      reverses_movement_id: original?.id,
      reference_type: 'expense',
      reference_id: id,
      note: reason,
      created_at: nowIso()
    });
    return row;
  });
}

// ─── Cancel sale / purchase / payment ────────────────────────

export async function previewCancelSale(id: string) {
  await delay();
  const detail = await getSale(id);
  const activePayments = detail.payments.filter((p) => p.status === 'ACTIVE');
  return {
    stock_back: detail.items.map((i) => ({
      product: i.product?.name,
      quantity: i.quantity,
      imei: i.unit?.imei1
    })),
    cash_out: activePayments.reduce((s, p) => s + p.amount, 0),
    udhar_cleared: detail.outstanding
  };
}

export async function cancelSale(
  id: string,
  reason: string,
  confirm_overdraft?: boolean
): Promise<{ ok: boolean; cash_warning?: SoftCashWarning }> {
  await delay();
  const sid = shopId();
  const session = getSession();
  if (!canCancelRecords(session.role)) throw new Error('Only owner can cancel');
  if (!reason.trim()) throw new Error('Reason is required');

  const cashOut = (await previewCancelSale(id)).cash_out;
  const warning = checkSoftCashWarning(sid, cashOut);
  if (warning.needs_confirm && !confirm_overdraft) {
    return { ok: false, cash_warning: warning };
  }

  runTransaction((store) => {
    const sale = store.sales.find((s) => s.id === id && s.shop_id === sid);
    if (!sale || sale.status === 'CANCELLED')
      throw new Error('Sale not found or already cancelled');
    sale.status = 'CANCELLED';
    sale.cancelled_at = nowIso();
    sale.cancel_reason = reason;

    const items = store.sale_items.filter((i) => i.sale_id === id);
    for (const item of items) {
      const product = store.products.find((p) => p.id === item.product_id)!;
      if (product.tracking_type === 'SERIALIZED' && item.inventory_unit_id) {
        const unit = store.inventory_units.find((u) => u.id === item.inventory_unit_id)!;
        unit.status = 'IN_STOCK';
        store.inventory_movements.push({
          id: newId('im'),
          shop_id: sid,
          product_id: product.id,
          inventory_unit_id: unit.id,
          type: 'SALE_CANCEL',
          quantity_change: 1,
          reason,
          reference_type: 'sale',
          reference_id: id,
          created_at: nowIso()
        });
      } else {
        const sl = store.stock_levels.find((s) => s.product_id === product.id)!;
        sl.quantity_on_hand += item.quantity;
        store.inventory_movements.push({
          id: newId('im'),
          shop_id: sid,
          product_id: product.id,
          type: 'SALE_CANCEL',
          quantity_change: item.quantity,
          reason,
          reference_type: 'sale',
          reference_id: id,
          created_at: nowIso()
        });
      }
    }

    const payments = store.payments.filter((p) => p.sale_id === id && p.status === 'ACTIVE');
    for (const payment of payments) {
      payment.status = 'CANCELLED';
      payment.cancelled_at = nowIso();
      payment.cancel_reason = reason;
      const original = store.cash_movements.find(
        (m) => m.reference_type === 'payment' && m.reference_id === payment.id
      );
      store.cash_movements.push({
        id: newId('cm'),
        shop_id: sid,
        type: 'REVERSAL',
        direction: 'OUT',
        amount: payment.amount,
        is_overdraft: Boolean(warning.needs_confirm && confirm_overdraft),
        reverses_movement_id: original?.id,
        reference_type: 'payment',
        reference_id: payment.id,
        note: reason,
        created_at: nowIso()
      });
    }

    // walk-in cash on sale
    const walkinCash = store.cash_movements.filter(
      (m) => m.reference_type === 'sale' && m.reference_id === id && m.type === 'CUSTOMER_PAYMENT'
    );
    for (const m of walkinCash) {
      store.cash_movements.push({
        id: newId('cm'),
        shop_id: sid,
        type: 'REVERSAL',
        direction: 'OUT',
        amount: m.amount,
        is_overdraft: Boolean(warning.needs_confirm && confirm_overdraft),
        reverses_movement_id: m.id,
        reference_type: 'sale',
        reference_id: id,
        note: reason,
        created_at: nowIso()
      });
    }
  });

  return { ok: true };
}

export async function cancelPurchase(
  id: string,
  reason: string,
  confirm_overdraft?: boolean
): Promise<{ ok: boolean; cash_warning?: SoftCashWarning }> {
  await delay();
  const sid = shopId();
  if (!canCancelRecords()) throw new Error('Only owner can cancel');
  if (!reason.trim()) throw new Error('Reason is required');

  const storePeek = getStore();
  const payments = storePeek.supplier_payments.filter(
    (p) => p.purchase_id === id && p.status === 'ACTIVE'
  );
  const cashIn = payments.reduce((s, p) => s + p.amount, 0);
  // reversal is IN for supplier payment cancel — no soft cash warning on IN
  void cashIn;
  void confirm_overdraft;

  runTransaction((store) => {
    const purchase = store.purchases.find((p) => p.id === id && p.shop_id === sid);
    if (!purchase || purchase.status === 'CANCELLED') {
      throw new Error('Purchase not found or already cancelled');
    }

    const items = store.purchase_items.filter((i) => i.purchase_id === id);
    for (const item of items) {
      const product = store.products.find((p) => p.id === item.product_id)!;
      if (product.tracking_type === 'SERIALIZED') {
        const units = store.inventory_units.filter((u) => u.purchase_item_id === item.id);
        for (const unit of units) {
          if (unit.status !== 'IN_STOCK') {
            throw new Error(`Cannot cancel: phone ${unit.imei1} is not IN_STOCK`);
          }
        }
      } else {
        const sl = store.stock_levels.find((s) => s.product_id === product.id)!;
        if (sl.quantity_on_hand < item.quantity) {
          throw new Error('Cannot cancel: accessory stock would go negative');
        }
      }
    }

    purchase.status = 'CANCELLED';
    purchase.cancelled_at = nowIso();
    purchase.cancel_reason = reason;

    for (const item of items) {
      const product = store.products.find((p) => p.id === item.product_id)!;
      if (product.tracking_type === 'SERIALIZED') {
        const units = store.inventory_units.filter((u) => u.purchase_item_id === item.id);
        for (const unit of units) {
          unit.status = 'VOIDED';
          store.inventory_movements.push({
            id: newId('im'),
            shop_id: sid,
            product_id: product.id,
            inventory_unit_id: unit.id,
            type: 'PURCHASE_CANCEL',
            quantity_change: -1,
            reason,
            reference_type: 'purchase',
            reference_id: id,
            created_at: nowIso()
          });
        }
      } else {
        const sl = store.stock_levels.find((s) => s.product_id === product.id)!;
        sl.quantity_on_hand -= item.quantity;
        store.inventory_movements.push({
          id: newId('im'),
          shop_id: sid,
          product_id: product.id,
          type: 'PURCHASE_CANCEL',
          quantity_change: -item.quantity,
          reason,
          reference_type: 'purchase',
          reference_id: id,
          created_at: nowIso()
        });
      }
    }

    for (const payment of store.supplier_payments.filter(
      (p) => p.purchase_id === id && p.status === 'ACTIVE'
    )) {
      payment.status = 'CANCELLED';
      payment.cancelled_at = nowIso();
      payment.cancel_reason = reason;
      const original = store.cash_movements.find(
        (m) => m.reference_type === 'supplier_payment' && m.reference_id === payment.id
      );
      store.cash_movements.push({
        id: newId('cm'),
        shop_id: sid,
        type: 'REVERSAL',
        direction: 'IN',
        amount: payment.amount,
        is_overdraft: false,
        reverses_movement_id: original?.id,
        reference_type: 'supplier_payment',
        reference_id: payment.id,
        note: reason,
        created_at: nowIso()
      });
    }
  });

  return { ok: true };
}

export async function cancelPayment(
  id: string,
  reason: string,
  kind: 'customer' | 'supplier',
  confirm_overdraft?: boolean
): Promise<{ ok: boolean; cash_warning?: SoftCashWarning }> {
  await delay();
  const sid = shopId();
  if (!canCancelRecords()) throw new Error('Only owner can cancel');
  if (!reason.trim()) throw new Error('Reason is required');

  if (kind === 'customer') {
    const payment = getStore().payments.find((p) => p.id === id && p.shop_id === sid);
    if (!payment || payment.status === 'CANCELLED') throw new Error('Payment not found');
    const warning = checkSoftCashWarning(sid, payment.amount);
    if (warning.needs_confirm && !confirm_overdraft) {
      return { ok: false, cash_warning: warning };
    }
    runTransaction((store) => {
      const row = store.payments.find((p) => p.id === id)!;
      row.status = 'CANCELLED';
      row.cancelled_at = nowIso();
      row.cancel_reason = reason;
      const original = store.cash_movements.find(
        (m) => m.reference_type === 'payment' && m.reference_id === id
      );
      store.cash_movements.push({
        id: newId('cm'),
        shop_id: sid,
        type: 'REVERSAL',
        direction: 'OUT',
        amount: row.amount,
        is_overdraft: Boolean(warning.needs_confirm && confirm_overdraft),
        reverses_movement_id: original?.id,
        reference_type: 'payment',
        reference_id: id,
        note: reason,
        created_at: nowIso()
      });
    });
    return { ok: true };
  }

  runTransaction((store) => {
    const row = store.supplier_payments.find((p) => p.id === id && p.shop_id === sid);
    if (!row || row.status === 'CANCELLED') throw new Error('Payment not found');
    row.status = 'CANCELLED';
    row.cancelled_at = nowIso();
    row.cancel_reason = reason;
    const original = store.cash_movements.find(
      (m) => m.reference_type === 'supplier_payment' && m.reference_id === id
    );
    store.cash_movements.push({
      id: newId('cm'),
      shop_id: sid,
      type: 'REVERSAL',
      direction: 'IN',
      amount: row.amount,
      is_overdraft: false,
      reverses_movement_id: original?.id,
      reference_type: 'supplier_payment',
      reference_id: id,
      note: reason,
      created_at: nowIso()
    });
  });
  return { ok: true };
}

// ─── Cash movements (read) ───────────────────────────────────

export async function listCashMovements(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  let items = getStore().cash_movements.filter((m) => m.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (m) =>
        m.created_at.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.direction.toLowerCase().includes(q) ||
        (m.note ?? '').toLowerCase().includes(q) ||
        String(m.amount).includes(q)
    );
  }
  if (filters.type) {
    items = items.filter((m) => matchesFacet(filters.type, m.type));
  }
  if (filters.direction) {
    items = items.filter((m) => matchesFacet(filters.direction, m.direction));
  }
  items = items.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  return paginate(items, filters);
}

export async function listInventoryMovements(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  const store = getStore();
  let items = store.inventory_movements.filter((m) => m.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((m) => {
      const product = store.products.find((p) => p.id === m.product_id);
      return (
        m.type.toLowerCase().includes(q) ||
        m.created_at.toLowerCase().includes(q) ||
        (m.reason ?? '').toLowerCase().includes(q) ||
        (product?.name ?? '').toLowerCase().includes(q) ||
        (m.reference_type ?? '').toLowerCase().includes(q)
      );
    });
  }
  if (filters.type) {
    items = items.filter((m) => matchesFacet(filters.type, m.type));
  }
  items = items.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  const enriched = items.map((m) => ({
    ...m,
    product_name: store.products.find((p) => p.id === m.product_id)?.name,
    imei1: m.inventory_unit_id
      ? store.inventory_units.find((u) => u.id === m.inventory_unit_id)?.imei1
      : undefined
  }));
  return paginate(enriched, filters);
}

export async function listPayments(filters: ListFilters = {}) {
  await delay();
  const sid = shopId();
  const store = getStore();
  let items = store.payments.filter((p) => p.shop_id === sid);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((p) => {
      const customer = p.customer_id
        ? store.customers.find((c) => c.id === p.customer_id)
        : undefined;
      const sale = p.sale_id ? store.sales.find((s) => s.id === p.sale_id) : undefined;
      return (
        p.created_at.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        (customer?.name ?? '').toLowerCase().includes(q) ||
        (sale?.sale_no ?? '').toLowerCase().includes(q) ||
        String(p.amount).includes(q)
      );
    });
  }
  if (filters.status) {
    items = items.filter((p) => matchesFacet(filters.status, p.status));
  }
  if (filters.method) {
    items = items.filter((p) => matchesFacet(filters.method, p.method));
  }
  items = items.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  const enriched = items.map((p) => ({
    ...p,
    customer_name: p.customer_id
      ? store.customers.find((c) => c.id === p.customer_id)?.name
      : undefined,
    sale_no: p.sale_id ? store.sales.find((s) => s.id === p.sale_id)?.sale_no : undefined
  }));
  return paginate(enriched, filters);
}

export async function getSessionInfo() {
  await delay();

  if (typeof window === 'undefined') {
    const { auth } = await import('@/auth');
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
    const mapped = toDukaanSession(session);
    setRuntimeSession(mapped);
    return mapped;
  }

  const { getSession: getAuthSession } = await import('next-auth/react');
  const session = await getAuthSession();
  if (!session?.user) throw new Error('Unauthorized');
  const mapped = toDukaanSession(session);
  setRuntimeSession(mapped);
  return mapped;
}
