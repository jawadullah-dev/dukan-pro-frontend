import type { LedgerEntry } from './types';
import { getStore } from './store';

export function getSaleOutstanding(saleId: string): number {
  const store = getStore();
  const sale = store.sales.find((s) => s.id === saleId);
  if (!sale || sale.status === 'CANCELLED') return 0;

  const paid = store.payments
    .filter((p) => p.sale_id === saleId && p.status === 'ACTIVE')
    .reduce((sum, p) => sum + p.amount, 0);

  return Math.max(0, sale.total_amount - paid);
}

export function getCustomerUdhar(shopId: string, customerId: string): number {
  const store = getStore();
  const customer = store.customers.find((c) => c.id === customerId && c.shop_id === shopId);
  if (!customer) return 0;

  const openingPaid = store.payments
    .filter(
      (p) =>
        p.customer_id === customerId && p.shop_id === shopId && !p.sale_id && p.status === 'ACTIVE'
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const openingLeft = Math.max(0, customer.opening_balance - openingPaid);

  const salesOutstanding = store.sales
    .filter((s) => s.shop_id === shopId && s.customer_id === customerId && s.status === 'ACTIVE')
    .reduce((sum, s) => sum + getSaleOutstanding(s.id), 0);

  return openingLeft + salesOutstanding;
}

export function getTotalCustomerUdhar(shopId: string): number {
  const store = getStore();
  return store.customers
    .filter((c) => c.shop_id === shopId && c.is_active)
    .reduce((sum, c) => sum + getCustomerUdhar(shopId, c.id), 0);
}

export function getPurchaseOutstanding(purchaseId: string): number {
  const store = getStore();
  const purchase = store.purchases.find((p) => p.id === purchaseId);
  if (!purchase || purchase.status === 'CANCELLED') return 0;

  const paid = store.supplier_payments
    .filter((p) => p.purchase_id === purchaseId && p.status === 'ACTIVE')
    .reduce((sum, p) => sum + p.amount, 0);

  return Math.max(0, purchase.total_amount - paid);
}

export function getSupplierPayable(shopId: string, supplierId: string): number {
  const store = getStore();
  const supplier = store.suppliers.find((s) => s.id === supplierId && s.shop_id === shopId);
  if (!supplier) return 0;

  const openingPaid = store.supplier_payments
    .filter(
      (p) =>
        p.supplier_id === supplierId &&
        p.shop_id === shopId &&
        !p.purchase_id &&
        p.status === 'ACTIVE'
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const openingLeft = Math.max(0, supplier.opening_balance - openingPaid);

  const purchasesOutstanding = store.purchases
    .filter(
      (p) =>
        p.shop_id === shopId &&
        p.supplier_id === supplierId &&
        p.status === 'ACTIVE' &&
        !p.is_opening_stock
    )
    .reduce((sum, p) => sum + getPurchaseOutstanding(p.id), 0);

  return openingLeft + purchasesOutstanding;
}

export function getTotalSupplierPayable(shopId: string): number {
  const store = getStore();
  return store.suppliers
    .filter((s) => s.shop_id === shopId && s.is_active)
    .reduce((sum, s) => sum + getSupplierPayable(shopId, s.id), 0);
}

export function buildCustomerLedger(shopId: string, customerId: string): LedgerEntry[] {
  const store = getStore();
  const customer = store.customers.find((c) => c.id === customerId);
  if (!customer) return [];

  type Raw = Omit<LedgerEntry, 'running_balance'>;
  const rows: Raw[] = [];

  if (customer.opening_balance > 0) {
    rows.push({
      id: `opening_${customerId}`,
      date: customer.created_at,
      type: 'OPENING',
      label: 'Opening balance',
      amount: customer.opening_balance,
      reference_id: customerId
    });
  }

  for (const sale of store.sales.filter(
    (s) => s.shop_id === shopId && s.customer_id === customerId
  )) {
    rows.push({
      id: sale.id,
      date: sale.created_at,
      type: sale.status === 'CANCELLED' ? 'CANCELLED_SALE' : 'SALE',
      label:
        sale.status === 'CANCELLED' ? `Cancelled sale ${sale.sale_no}` : `Sale ${sale.sale_no}`,
      amount: sale.status === 'CANCELLED' ? 0 : sale.total_amount,
      reference_id: sale.id
    });
  }

  for (const payment of store.payments.filter(
    (p) => p.shop_id === shopId && p.customer_id === customerId
  )) {
    rows.push({
      id: payment.id,
      date: payment.created_at,
      type: payment.status === 'CANCELLED' ? 'CANCELLED_PAYMENT' : 'PAYMENT',
      label: payment.status === 'CANCELLED' ? `Cancelled payment` : `Payment received`,
      amount: payment.status === 'CANCELLED' ? 0 : -payment.amount,
      reference_id: payment.id
    });
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  return rows.map((row) => {
    running += row.amount;
    return { ...row, running_balance: running };
  });
}
