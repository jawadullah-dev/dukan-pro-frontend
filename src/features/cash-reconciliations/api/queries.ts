import { queryOptions } from '@tanstack/react-query';
import { listReconciliations } from './service';

export const reconciliationKeys = {
  all: ['cash-reconciliations'] as const,
  lists: () => [...reconciliationKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...reconciliationKeys.lists(), filters] as const
};

export const reconciliationsQueryOptions = (filters: Record<string, any> = {}) =>
  queryOptions({
    queryKey: reconciliationKeys.list(filters),
    queryFn: () => listReconciliations(filters)
  });
