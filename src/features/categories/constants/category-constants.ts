import { t } from '@/i18n';

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
