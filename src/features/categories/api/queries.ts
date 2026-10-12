import { queryOptions } from '@tanstack/react-query';
import type { CategoryListFilters } from './service';
import { listCategories } from './service';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: CategoryListFilters) => [...categoryKeys.lists(), filters] as const
};

export const categoriesQueryOptions = (filters: CategoryListFilters = {}, token?: string) =>
  queryOptions({
    queryKey: categoryKeys.list(filters),
    queryFn: () => listCategories(filters, token)
  });
