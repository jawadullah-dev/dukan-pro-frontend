import type { PlatformShopStatus } from '@/features/platform-admin/api/types';
import type { Icons } from '@/components/icons';
import type { SubscriptionPlan } from '@/features/platform-admin/api/types';

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
