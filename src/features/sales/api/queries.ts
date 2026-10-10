import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { getSale, listSales } from './service';

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const
};

export const salesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: saleKeys.list(filters),
    queryFn: () => listSales(filters)
  });

export const saleQueryOptions = (id: string) =>
  queryOptions({
    queryKey: saleKeys.detail(id),
    queryFn: () => getSale(id)
  });
