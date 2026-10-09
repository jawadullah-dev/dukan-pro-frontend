import type { PlatformShopStatus, SubscriptionPlan } from '../api/types';
import { t } from '@/i18n';

export const PLATFORM_STATUS_OPTIONS: { label: string; value: PlatformShopStatus }[] = [
  {
    get label() {
      return t('status.active');
    },
    value: 'ACTIVE'
  },
  {
    get label() {
      return t('status.trial');
    },
    value: 'TRIAL'
  },
  {
    get label() {
      return t('status.expired');
    },
    value: 'EXPIRED'
  }
];

export const PLATFORM_PLAN_OPTIONS: { label: string; value: SubscriptionPlan }[] = [
  {
    get label() {
      return t('plan.trial');
    },
    value: 'TRIAL'
  },
  {
    get label() {
      return t('plan.monthly');
    },
    value: 'MONTHLY'
  },
  {
    get label() {
      return t('plan.yearly');
    },
    value: 'YEARLY'
  }
];

export const PLATFORM_CITY_OPTIONS = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Multan',
  'Faisalabad',
  'Quetta',
  'Hyderabad',
  'Timergara',
  'Sialkot',
  'Gujranwala',
  'Abbottabad',
  'Mardan',
  'Swat',
  'Bahawalpur'
].map((city) => ({ label: city, value: city }));
