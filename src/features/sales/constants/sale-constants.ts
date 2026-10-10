import { t } from '@/i18n';

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'CASH', value: 'CASH' },
  { label: 'BANK', value: 'BANK' },
  { label: 'MOBILE_WALLET', value: 'MOBILE_WALLET' }
];

export const SALE_STATUS_OPTIONS = [
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
