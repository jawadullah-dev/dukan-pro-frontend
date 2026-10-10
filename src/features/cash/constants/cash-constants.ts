import { t } from '@/i18n';

export const CASH_DIRECTION_OPTIONS = [
  {
    get label() {
      return t('status.cashIn');
    },
    value: 'IN'
  },
  {
    get label() {
      return t('status.cashOut');
    },
    value: 'OUT'
  }
];

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
