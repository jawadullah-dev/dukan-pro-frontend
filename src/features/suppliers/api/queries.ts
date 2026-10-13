import { queryOptions } from '@tanstack/react-query';
import { listSuppliers } from './service';
import type { SupplierListFilters } from './service';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filters?: SupplierListFilters) => [...supplierKeys.lists(), filters] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const
};

export const suppliersQueryOptions = (filters: SupplierListFilters = {}, token?: string) =>
  queryOptions({
    queryKey: supplierKeys.list(filters),
    queryFn: () => listSuppliers(filters, token)
  });
