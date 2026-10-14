import type { PlatformShopStatus, SubscriptionPlan } from '@/types';
export type { PlatformShopStatus, SubscriptionPlan };

export interface PlatformShop {
  id: string;
  name: string;
  address: string;
  city: string;
  owner_name: string;
  owner_phone: string;
  status: PlatformShopStatus;
  trial_ends_at: string | null;
  next_due_at: string | null;
  created_at: string;
}

export interface PlatformSubscription {
  id: string;
  shop_id: string;
  shop_name: string;
  plan: SubscriptionPlan;
  status: PlatformShopStatus;
  next_due_at: string | null;
  amount_paisa: number;
}

export interface PlatformOverview {
  total_shops: number;
  active_shops: number;
  trial_shops: number;
  expired_shops: number;
  mrr_paisa: number;
}

export interface PlatformShopFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  status?: PlatformShopStatus | string;
}

export interface PlatformSubscriptionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PlatformShopStatus | string;
}

export interface Paginated<T> {
  items: T[];
  total_items: number;
  page: number;
  limit: number;
}
