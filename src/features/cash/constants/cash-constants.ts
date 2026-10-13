export const CASH_TYPE_OPTIONS = [
  'OPENING_CASH',
  'CUSTOMER_PAYMENT',
  'SUPPLIER_PAYMENT',
  'EXPENSE',
  'REVERSAL',
  'OWNER_INVESTMENT',
  'OWNER_WITHDRAWAL',
  'REFUND',
  'RECONCILIATION_ADJUSTMENT'
].map((v) => ({ label: v.replaceAll('_', ' ').toLowerCase(), value: v }));
