import { queryOptions } from '@tanstack/react-query';
import type { ExpenseQueryFilter, ExpenseCategoryQueryFilter } from '@/types/expense';
import { getExpense, getExpenseCategory, listExpenseCategories, listExpenses } from './service';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters?: ExpenseQueryFilter) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  categories: (filters?: ExpenseCategoryQueryFilter) =>
    [...expenseKeys.all, 'categories', filters] as const,
  category: (id: string) => [...expenseKeys.all, 'category', id] as const
};

export const expensesQueryOptions = (filters: ExpenseQueryFilter = {}, token?: string) =>
  queryOptions({
    queryKey: expenseKeys.list(filters),
    queryFn: () => listExpenses(filters, token)
  });

export const expenseQueryOptions = (id: string, token?: string) =>
  queryOptions({
    queryKey: expenseKeys.detail(id),
    queryFn: () => getExpense(id, token),
    enabled: !!id
  });

export const expenseCategoriesQueryOptions = (
  filters: ExpenseCategoryQueryFilter = {},
  token?: string
) =>
  queryOptions({
    queryKey: expenseKeys.categories(filters),
    queryFn: () => listExpenseCategories(filters, token)
  });

export const expenseCategoryQueryOptions = (id: string, token?: string) =>
  queryOptions({
    queryKey: expenseKeys.category(id),
    queryFn: () => getExpenseCategory(id, token),
    enabled: !!id
  });
