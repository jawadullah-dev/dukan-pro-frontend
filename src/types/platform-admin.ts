import type { Icons } from '@/components/icons';

export type PlatformShopStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED';

export type SubscriptionPlan = 'TRIAL' | 'MONTHLY' | 'YEARLY';

export interface ShopStatusConfig {
  labelKey: string;
  className: string;
  icon: keyof typeof Icons;
}

export interface ShopStatusBadgeProps {
  status: PlatformShopStatus;
}

export interface PlatformStatusOption {
  label: string;
  value: PlatformShopStatus;
}

export interface PlatformPlanOption {
  label: string;
  value: SubscriptionPlan;
}
