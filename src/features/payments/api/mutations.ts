import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { CreatePaymentInput, CancelPaymentInput } from '@/lib/api/types';
import { paymentKeys } from './queries';
import { cancelPayment, createPayment } from './service';
import { customerKeys } from '@/features/customers/api/queries';

export const createPaymentMutation = mutationOptions({
  mutationFn: (input: CreatePaymentInput) => createPayment(input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: paymentKeys.all });
    qc.invalidateQueries({ queryKey: customerKeys.all });
    qc.invalidateQueries({ queryKey: ['cash'] });
    qc.invalidateQueries({ queryKey: ['sales'] });
  }
});

export const cancelPaymentMutation = mutationOptions({
  mutationFn: ({ id, input }: { id: string; input: CancelPaymentInput }) =>
    cancelPayment(id, input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: paymentKeys.all });
    qc.invalidateQueries({ queryKey: customerKeys.all });
    qc.invalidateQueries({ queryKey: ['cash'] });
    qc.invalidateQueries({ queryKey: ['sales'] });
  }
});
