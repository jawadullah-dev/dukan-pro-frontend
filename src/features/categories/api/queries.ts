import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { listCategories } from './service';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...categoryKeys.lists(), filters] as const
};

export const categoriesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: categoryKeys.list(filters),
    queryFn: () => listCategories(filters)
  });
