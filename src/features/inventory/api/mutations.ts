import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { inventoryKeys } from './queries';
import { adjustStock } from './service';

export const adjustStockMutation = mutationOptions({
  mutationFn: (payload: Parameters<typeof adjustStock>[0]) => adjustStock(payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: inventoryKeys.all });
  }
});
