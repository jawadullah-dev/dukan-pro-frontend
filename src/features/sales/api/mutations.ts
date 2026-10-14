import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type {
  CreateSaleInput,
  CancelSaleInput,
  ReturnPreviewInput,
  CreateReturnInput
} from '@/lib/api/types';
import { saleKeys } from './queries';
import { cancelSale, createReturn, createSale, previewReturn } from './service';

import type {
  CancelSaleMutationVariables,
  PreviewReturnMutationVariables,
  CreateReturnMutationVariables
} from '@/types';

export const createSaleMutation = mutationOptions({
  mutationFn: (input: CreateSaleInput) => createSale(input),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const cancelSaleMutation = mutationOptions({
  mutationFn: ({ id, input }: CancelSaleMutationVariables) => cancelSale(id, input),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});

export const previewReturnMutation = mutationOptions({
  mutationFn: ({ id, input }: PreviewReturnMutationVariables) => previewReturn(id, input)
});

export const createReturnMutation = mutationOptions({
  mutationFn: ({ id, input }: CreateReturnMutationVariables) => createReturn(id, input),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: saleKeys.all });
  }
});
