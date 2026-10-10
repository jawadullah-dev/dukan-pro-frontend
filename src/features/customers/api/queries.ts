import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { getCustomer, listCustomers } from './service';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const
};

export const customersQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: customerKeys.list(filters),
    queryFn: () => listCustomers(filters)
  });

export const customerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id)
  });
