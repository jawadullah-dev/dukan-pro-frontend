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

import { buildQueryString } from '@/lib/api/query-params';

export async function listExpenses(
  filters: ExpenseQueryFilter = {},
  token?: string
): Promise<PaginatedResponse<ExpenseDTO>> {
  const qs = buildQueryString({
    ...filters,
    pageSize: filters.pageSize ?? filters.limit
  } as Record<string, unknown>);

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
  const qs = buildQueryString({
    ...filters,
    pageSize: filters.pageSize ?? filters.limit
  } as Record<string, unknown>);

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
