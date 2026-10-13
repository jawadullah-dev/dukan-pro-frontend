import { queryOptions } from '@tanstack/react-query';
import type { PaymentsListFilters } from './service';
import { getPayment, getPaymentCancelImpact, listPayments } from './service';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: PaymentsListFilters) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  cancelImpacts: () => [...paymentKeys.all, 'cancelImpact'] as const,
  cancelImpact: (id: string) => [...paymentKeys.cancelImpacts(), id] as const
};

export const paymentsQueryOptions = (filters: PaymentsListFilters = {}, token?: string) =>
  queryOptions({
    queryKey: paymentKeys.list(filters),
    queryFn: () => listPayments(filters, token)
  });

export const paymentCancelImpactQueryOptions = (id: string, token?: string) =>
  queryOptions({
    queryKey: paymentKeys.cancelImpact(id),
    queryFn: () => getPaymentCancelImpact(id, token),
    enabled: !!id
  });
