import type { PlatformShopStatus, SubscriptionPlan } from '../api/types';

export const PLATFORM_STATUS_OPTIONS: { label: string; value: PlatformShopStatus }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Trial', value: 'TRIAL' },
  { label: 'Expired', value: 'EXPIRED' }
];

export const PLATFORM_PLAN_OPTIONS: { label: string; value: SubscriptionPlan }[] = [
  { label: 'Trial', value: 'TRIAL' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Yearly', value: 'YEARLY' }
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
