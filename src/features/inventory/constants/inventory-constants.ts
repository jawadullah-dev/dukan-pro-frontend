import { t } from '@/i18n';

export const MOVEMENT_TYPE_OPTIONS = [
  'PURCHASE',
  'SALE',
  'ADJUSTMENT',
  'DAMAGED',
  'LOST',
  'SALE_CANCEL',
  'PURCHASE_CANCEL',
  'CUSTOMER_RETURN'
].map((v) => ({ label: v.replaceAll('_', ' ').toLowerCase(), value: v }));
