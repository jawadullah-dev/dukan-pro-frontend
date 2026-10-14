import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { CancelPurchaseInput, CreatePurchaseInput } from '@/lib/api/types';
import type { CancelPurchaseMutationVariables } from '@/types';
import { purchaseKeys } from './queries';
import { cancelPurchase, createPurchase } from './service';

export const createPurchaseMutation = mutationOptions({
  mutationFn: (input: CreatePurchaseInput) => createPurchase(input),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});

export const cancelPurchaseMutation = mutationOptions({
  mutationFn: ({ id, input }: CancelPurchaseMutationVariables) => cancelPurchase(id, input),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: purchaseKeys.all });
  }
});
