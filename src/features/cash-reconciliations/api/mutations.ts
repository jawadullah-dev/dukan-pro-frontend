import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { reconciliationKeys } from './queries';
import { createReconciliation } from './service';

export const createReconciliationMutation = mutationOptions({
  mutationFn: (data: { countedCash: number; reason?: string }) => createReconciliation(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: reconciliationKeys.all });
  }
});
