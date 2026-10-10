import { queryOptions } from '@tanstack/react-query';
import type { ListFilters } from '@/lib/dukaan';
import { listExpenseCategories, listExpenses } from './service';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters?: ListFilters) => [...expenseKeys.lists(), filters] as const,
  categories: (filters?: ListFilters) => [...expenseKeys.all, 'categories', filters] as const
};

export const expensesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: expenseKeys.list(filters),
    queryFn: () => listExpenses(filters)
  });

export const expenseCategoriesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: expenseKeys.categories(filters),
    queryFn: () => listExpenseCategories(filters)
  });
