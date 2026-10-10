import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { saleKeys } from './queries';
import { cancelSale, createSale } from './service';

export const createSaleMutation = mutationOptions({
  mutationFn: (payload: Parameters<typeof createSale>[0]) => createSale(payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const cancelSaleMutation = mutationOptions({
  mutationFn: ({
    id,
    reason,
    confirmOverdraft
  }: {
    id: string;
    reason: string;
    confirmOverdraft?: boolean;
  }) => cancelSale(id, reason, confirmOverdraft),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});
