import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { getPurchase, listPurchases } from './service';

export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...purchaseKeys.lists(), filters] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const
};

export const purchasesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: purchaseKeys.list(filters),
    queryFn: () => listPurchases(filters)
  });

export const purchaseQueryOptions = (id: string) =>
  queryOptions({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => getPurchase(id)
  });
