import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { listCashMovements, listPayments } from './service';

export const cashKeys = {
  all: ['cash'] as const,
  movements: (filters?: ListFilters) => [...cashKeys.all, 'movements', filters] as const,
  payments: (filters?: ListFilters) => [...cashKeys.all, 'payments', filters] as const
};

export const cashQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: cashKeys.movements(filters),
    queryFn: () => listCashMovements(filters)
  });

export const cashMovementsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: cashKeys.movements(filters),
    queryFn: () => listCashMovements(filters)
  });

export const paymentsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: cashKeys.payments(filters),
    queryFn: () => listPayments(filters)
  });
