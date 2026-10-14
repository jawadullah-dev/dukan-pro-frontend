import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { CreatePaymentInput } from '@/lib/api/types';
import type { CancelPaymentMutationVariables } from '@/types';
import { paymentKeys } from './queries';
import { cancelPayment, createPayment } from './service';
import { customerKeys } from '@/features/customers/api/queries';

function invalidatePaymentDependencies() {
  const qc = getQueryClient();
  qc.invalidateQueries({ queryKey: paymentKeys.all });
  qc.invalidateQueries({ queryKey: customerKeys.all });
  qc.invalidateQueries({ queryKey: ['cash'] });
  qc.invalidateQueries({ queryKey: ['sales'] });
}

export const createPaymentMutation = mutationOptions({
  mutationFn: (input: CreatePaymentInput) => createPayment(input),
  onSuccess: () => {
    invalidatePaymentDependencies();
  }
});

export const cancelPaymentMutation = mutationOptions({
  mutationFn: ({ id, input }: CancelPaymentMutationVariables) => cancelPayment(id, input),
  onSuccess: () => {
    invalidatePaymentDependencies();
  }
});
