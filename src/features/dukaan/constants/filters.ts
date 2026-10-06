import { formatLabel } from '@/lib/dukaan/numbers';
import { t } from '@/i18n';

function optionsFrom(values: readonly string[]) {
  return values.map((value) => ({ label: formatLabel(value), value }));
}

export function getRecordStatusOptions() {
  return [
    { label: t('status.active'), value: 'ACTIVE' },
    { label: t('status.cancelled'), value: 'CANCELLED' }
  ];
}

export function getTrackingTypeOptions() {
  return [
    { label: t('status.serialized'), value: 'SERIALIZED' },
    { label: t('status.quantity'), value: 'QUANTITY' }
  ];
}

export function getActiveStatusOptions() {
  return [
    { label: t('status.active'), value: 'true' },
    { label: t('status.inactive'), value: 'false' }
  ];
}

export function getLowStockOptions() {
  return [
    { label: t('status.lowStock'), value: 'true' },
    { label: t('status.stockOk'), value: 'false' }
  ];
}

export function getCashDirectionOptions() {
  return [
    { label: t('status.cashIn'), value: 'IN' },
    { label: t('status.cashOut'), value: 'OUT' }
  ];
}

/** Live-translated options — read `.label` at render time. */
export const RECORD_STATUS_OPTIONS = [
  {
    get label() {
      return t('status.active');
    },
    value: 'ACTIVE'
  },
  {
    get label() {
      return t('status.cancelled');
    },
    value: 'CANCELLED'
  }
];

export const TRACKING_TYPE_OPTIONS = [
  {
    get label() {
      return t('status.serialized');
    },
    value: 'SERIALIZED'
  },
  {
    get label() {
      return t('status.quantity');
    },
    value: 'QUANTITY'
  }
];

export const ACTIVE_STATUS_OPTIONS = [
  {
    get label() {
      return t('status.active');
    },
    value: 'true'
  },
  {
    get label() {
      return t('status.inactive');
    },
    value: 'false'
  }
];

export const LOW_STOCK_OPTIONS = [
  {
    get label() {
      return t('status.lowStock');
    },
    value: 'true'
  },
  {
    get label() {
      return t('status.stockOk');
    },
    value: 'false'
  }
];

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
