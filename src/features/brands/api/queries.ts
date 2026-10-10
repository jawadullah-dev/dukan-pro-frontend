import { queryOptions } from '@tanstack/react-query';
import type { BrandListFilters } from './service';
import { listBrands } from './service';

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters?: BrandListFilters) => [...brandKeys.lists(), filters] as const
};

export const brandsQueryOptions = (filters: BrandListFilters = {}, token?: string) =>
  queryOptions({
    queryKey: brandKeys.list(filters),
    queryFn: () => listBrands(filters, token)
  });
