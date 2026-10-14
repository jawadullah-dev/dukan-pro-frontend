import { queryOptions } from '@tanstack/react-query';
import { listInventoryAdjustments, listInventoryStock } from './service';
import type { InventoryAdjustmentsFilters, InventoryStockFilters } from '@/types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  stock: (filters?: InventoryStockFilters) => [...inventoryKeys.all, 'stock', filters] as const,
  adjustments: (filters?: InventoryAdjustmentsFilters) =>
    [...inventoryKeys.all, 'adjustments', filters] as const,
  movements: (filters?: InventoryAdjustmentsFilters) =>
    [...inventoryKeys.all, 'movements', filters] as const
};

export const inventoryStockQueryOptions = (filters: InventoryStockFilters = {}, token?: string) =>
  queryOptions({
    queryKey: inventoryKeys.stock(filters),
    queryFn: () => listInventoryStock(filters, token)
  });

export const inventoryAdjustmentsQueryOptions = (
  filters: InventoryAdjustmentsFilters = {},
  token?: string
) =>
  queryOptions({
    queryKey: inventoryKeys.adjustments(filters),
    queryFn: () => listInventoryAdjustments(filters, token)
  });
