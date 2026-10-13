import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';
import type {
  ExpenseDTO,
  ExpenseCategoryDTO,
  CreateExpenseInput,
  CreateExpenseResult,
  CancelExpenseInput,
  CancelExpenseResult,
  ExpenseQueryFilter,
  CreateExpenseCategoryInput,
  ExpenseCategoryQueryFilter,
  UpdateExpenseCategoryInput,
  ExpenseCategoryStatusResult
} from '@/types/expense';

import { appFetch } from '@/lib/api/app-fetch';

export async function listExpenses(
  filters: ExpenseQueryFilter = {},
  token?: string
): Promise<PaginatedResponse<ExpenseDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.status) params.set('status', filters.status);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<ExpenseDTO>>(`/expenses${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<ExpenseDTO>>(`/api/expenses${qs}`);
}

export async function getExpense(id: string, token?: string): Promise<ExpenseDTO> {
  if (token) {
    return apiRequest<ExpenseDTO>(`/expenses/${id}`, undefined, token);
  }
  return appFetch<ExpenseDTO>(`/api/expenses/${id}`);
}

export async function createExpense(input: CreateExpenseInput): Promise<CreateExpenseResult> {
  return appFetch<CreateExpenseResult>('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function cancelExpense(
  id: string,
  input: CancelExpenseInput
): Promise<CancelExpenseResult> {
  return appFetch<CancelExpenseResult>(`/api/expenses/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function listExpenseCategories(
  filters: ExpenseCategoryQueryFilter = {},
  token?: string
): Promise<PaginatedResponse<ExpenseCategoryDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<ExpenseCategoryDTO>>(
      `/expense-categories${qs}`,
      undefined,
      token
    );
  }

  return appFetch<PaginatedResponse<ExpenseCategoryDTO>>(`/api/expense-categories${qs}`);
}

export async function createExpenseCategory(
  input: CreateExpenseCategoryInput
): Promise<ExpenseCategoryStatusResult> {
  return appFetch<ExpenseCategoryStatusResult>('/api/expense-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getExpenseCategory(id: string, token?: string): Promise<ExpenseCategoryDTO> {
  if (token) {
    return apiRequest<ExpenseCategoryDTO>(`/expense-categories/${id}`, undefined, token);
  }
  return appFetch<ExpenseCategoryDTO>(`/api/expense-categories/${id}`);
}

export async function updateExpenseCategory(
  id: string,
  input: UpdateExpenseCategoryInput
): Promise<ExpenseCategoryStatusResult> {
  return appFetch<ExpenseCategoryStatusResult>(`/api/expense-categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function deleteExpenseCategory(id: string): Promise<ExpenseCategoryStatusResult> {
  return appFetch<ExpenseCategoryStatusResult>(`/api/expense-categories/${id}`, {
    method: 'DELETE'
  });
}
