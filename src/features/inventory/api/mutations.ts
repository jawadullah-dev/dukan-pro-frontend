import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { inventoryKeys } from './queries';
import { createInventoryAdjustment } from './service';
import type { CreateInventoryAdjustmentInput } from '@/lib/api/types';

export const createAdjustmentMutation = mutationOptions({
  mutationFn: (payload: CreateInventoryAdjustmentInput) => createInventoryAdjustment(payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: inventoryKeys.all });
  }
});

// Backward-compatible export
export const adjustStockMutation = createAdjustmentMutation;
