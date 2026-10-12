import { queryOptions } from '@tanstack/react-query';
import type { CashMovementQueryFilter } from '@/types/cash';
import type { ListFilters } from '@/lib/dukaan';
import { listCashMovements, listPayments } from './service';

export const cashKeys = {
  all: ['cash'] as const,
  movements: (filters?: CashMovementQueryFilter) =>
    [...cashKeys.all, 'movements', filters] as const,
  payments: (filters?: ListFilters) => [...cashKeys.all, 'payments', filters] as const
};

export const cashMovementsQueryOptions = (filters: CashMovementQueryFilter = {}, token?: string) =>
  queryOptions({
    queryKey: cashKeys.movements(filters),
    queryFn: () => listCashMovements(filters, token)
  });

export const cashQueryOptions = (filters: CashMovementQueryFilter = {}, token?: string) =>
  cashMovementsQueryOptions(filters, token);

export const paymentsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: cashKeys.payments(filters),
    queryFn: () => listPayments(filters)
  });
