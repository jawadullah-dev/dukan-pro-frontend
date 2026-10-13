import { queryOptions } from '@tanstack/react-query';
import type { CashMovementQueryFilter } from '@/types/cash';
import type { PaymentsListFilters } from '@/features/payments/api/service';
import { listCashMovements } from './service';

export const cashKeys = {
  all: ['cash'] as const,
  movements: (filters?: CashMovementQueryFilter) =>
    [...cashKeys.all, 'movements', filters] as const,
  payments: (filters?: PaymentsListFilters) => [...cashKeys.all, 'payments', filters] as const
};

export const cashMovementsQueryOptions = (filters: CashMovementQueryFilter = {}, token?: string) =>
  queryOptions({
    queryKey: cashKeys.movements(filters),
    queryFn: () => listCashMovements(filters, token)
  });

export const cashQueryOptions = (filters: CashMovementQueryFilter = {}, token?: string) =>
  cashMovementsQueryOptions(filters, token);
