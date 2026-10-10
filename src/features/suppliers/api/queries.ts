import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { listSuppliers } from './service';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...supplierKeys.lists(), filters] as const
};

export const suppliersQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: supplierKeys.list(filters),
    queryFn: () => listSuppliers(filters)
  });
