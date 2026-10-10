import { t } from '@/i18n';

export const CUSTOMER_STATUS_OPTIONS = [
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
