import { t } from '@/i18n';

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
