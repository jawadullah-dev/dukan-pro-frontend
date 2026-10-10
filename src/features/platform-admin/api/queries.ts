import { queryOptions } from '@tanstack/react-query';
import type { PlatformShopFilters, PlatformSubscriptionFilters } from './types';
import * as platform from './service';

export const platformKeys = {
  all: ['platform'] as const,
  overview: () => [...platformKeys.all, 'overview'] as const,
  shops: (filters: PlatformShopFilters) => [...platformKeys.all, 'shops', filters] as const,
  subscriptions: (filters: PlatformSubscriptionFilters) =>
    [...platformKeys.all, 'subscriptions', filters] as const,
  cities: () => [...platformKeys.all, 'cities'] as const
};

export const platformOverviewQueryOptions = () =>
  queryOptions({
    queryKey: platformKeys.overview(),
    queryFn: () => platform.getPlatformOverview()
  });

export const platformShopsQueryOptions = (filters: PlatformShopFilters) =>
  queryOptions({
    queryKey: platformKeys.shops(filters),
    queryFn: () => platform.listPlatformShops(filters)
  });

export const platformSubscriptionsQueryOptions = (filters: PlatformSubscriptionFilters) =>
  queryOptions({
    queryKey: platformKeys.subscriptions(filters),
    queryFn: () => platform.listPlatformSubscriptions(filters)
  });

const platformCitiesQueryOptions = () =>
  queryOptions({
    queryKey: platformKeys.cities(),
    queryFn: () => platform.listPlatformCities()
  });
