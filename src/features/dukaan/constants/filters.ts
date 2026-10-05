import { formatLabel } from '@/lib/dukaan/numbers';

function optionsFrom(values: readonly string[]) {
  return values.map((value) => ({ label: formatLabel(value), value }));
}

export const RECORD_STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Cancelled', value: 'CANCELLED' }
] as const;

export const TRACKING_TYPE_OPTIONS = [
  { label: 'Serialized', value: 'SERIALIZED' },
  { label: 'Quantity', value: 'QUANTITY' }
] as const;

export const ACTIVE_STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' }
] as const;

export const LOW_STOCK_OPTIONS = [
  { label: 'Low stock', value: 'true' },
  { label: 'OK', value: 'false' }
] as const;

export const CASH_DIRECTION_OPTIONS = [
  { label: 'In', value: 'IN' },
  { label: 'Out', value: 'OUT' }
] as const;

export const CASH_TYPE_OPTIONS = optionsFrom([
  'OPENING_CASH',
  'CUSTOMER_PAYMENT',
  'SUPPLIER_PAYMENT',
  'EXPENSE',
  'REVERSAL',
  'OWNER_INVESTMENT',
  'OWNER_WITHDRAWAL',
  'REFUND',
  'RECONCILIATION_ADJUSTMENT'
] as const);

export const MOVEMENT_TYPE_OPTIONS = optionsFrom([
  'PURCHASE',
  'SALE',
  'ADJUSTMENT',
  'DAMAGED',
  'LOST',
  'SALE_CANCEL',
  'PURCHASE_CANCEL',
  'CUSTOMER_RETURN'
] as const);

export const PAYMENT_METHOD_OPTIONS = optionsFrom(['CASH', 'BANK', 'MOBILE_WALLET'] as const);
