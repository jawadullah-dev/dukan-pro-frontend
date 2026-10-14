import { queryOptions } from '@tanstack/react-query';
import type { PurchasesListFilters } from '@/types';
import { getCancelImpact, getPurchase, listPurchases } from './service';

export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (filters?: PurchasesListFilters) => [...purchaseKeys.lists(), filters] as const,
  details: () => [...purchaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseKeys.details(), id] as const,
  cancelImpacts: () => [...purchaseKeys.all, 'cancelImpact'] as const,
  cancelImpact: (id: string) => [...purchaseKeys.cancelImpacts(), id] as const
};

export const purchasesQueryOptions = (filters: PurchasesListFilters = {}, token?: string) =>
  queryOptions({
    queryKey: purchaseKeys.list(filters),
    queryFn: () => listPurchases(filters, token)
  });

export const purchaseQueryOptions = (id: string, token?: string) =>
  queryOptions({
    queryKey: purchaseKeys.detail(id),
    queryFn: () => getPurchase(id, token)
  });

export const purchaseCancelImpactQueryOptions = (id: string, token?: string) =>
  queryOptions({
    queryKey: purchaseKeys.cancelImpact(id),
    queryFn: () => getCancelImpact(id, token),
    enabled: !!id
  });
