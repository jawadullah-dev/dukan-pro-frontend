import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type {
  CreateSupplierPaymentInput,
  CancelSupplierPaymentMutationVariables
} from '@/types/supplier-payment';
import { supplierPaymentKeys } from './queries';
import { cancelSupplierPayment, createSupplierPayment } from './service';
import { supplierKeys } from '@/features/suppliers/api/queries';

function invalidateSupplierPaymentDependencies() {
  const qc = getQueryClient();
  qc.invalidateQueries({ queryKey: supplierPaymentKeys.all });
  qc.invalidateQueries({ queryKey: supplierKeys.all });
  qc.invalidateQueries({ queryKey: ['cash'] });
  qc.invalidateQueries({ queryKey: ['purchases'] });
}

export const createSupplierPaymentMutation = mutationOptions({
  mutationFn: (input: CreateSupplierPaymentInput) => createSupplierPayment(input),
  onSuccess: () => {
    invalidateSupplierPaymentDependencies();
  }
});

export const cancelSupplierPaymentMutation = mutationOptions({
  mutationFn: ({ id, input }: CancelSupplierPaymentMutationVariables) =>
    cancelSupplierPayment(id, input),
  onSuccess: () => {
    invalidateSupplierPaymentDependencies();
  }
});
