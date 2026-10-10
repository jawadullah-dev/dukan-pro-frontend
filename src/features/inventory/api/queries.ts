import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { listInventoryMovements, listStock } from './service';

export const inventoryKeys = {
  all: ['inventory'] as const,
  stock: (filters?: ListFilters) => [...inventoryKeys.all, 'stock', filters] as const,
  movements: (filters?: ListFilters) => [...inventoryKeys.all, 'movements', filters] as const
};

export const stockQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: inventoryKeys.stock(filters),
    queryFn: () => listStock(filters)
  });

export const inventoryMovementsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: inventoryKeys.movements(filters),
    queryFn: () => listInventoryMovements(filters)
  });
