import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { listBrands } from './service';

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...brandKeys.lists(), filters] as const
};

export const brandsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: brandKeys.list(filters),
    queryFn: () => listBrands(filters)
  });
