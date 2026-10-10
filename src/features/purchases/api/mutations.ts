import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { purchaseKeys } from './queries';
import { cancelPurchase, createPurchase } from './service';

export const createPurchaseMutation = mutationOptions({
  mutationFn: (payload: Parameters<typeof createPurchase>[0]) => createPurchase(payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});

export const cancelPurchaseMutation = mutationOptions({
  mutationFn: ({
    id,
    reason,
    confirmOverdraft
  }: {
    id: string;
    reason: string;
    confirmOverdraft?: boolean;
  }) => cancelPurchase(id, reason, confirmOverdraft),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});
