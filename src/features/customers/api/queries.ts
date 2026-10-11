import { queryOptions } from '@tanstack/react-query';
import type { CustomerListFilters } from './service';
import { getCustomer, listCustomers } from './service';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: CustomerListFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const
};

export const customersQueryOptions = (filters: CustomerListFilters = {}, token?: string) =>
  queryOptions({
    queryKey: customerKeys.list(filters),
    queryFn: () => listCustomers(filters, token)
  });

export const customerQueryOptions = (id: string, token?: string) =>
  queryOptions({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id, token)
  });
