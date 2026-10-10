import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { listProducts } from './service';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...productKeys.lists(), filters] as const
};

export const productsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: productKeys.list(filters),
    queryFn: () => listProducts(filters)
  });
