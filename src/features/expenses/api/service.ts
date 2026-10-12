import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
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

async function expensesFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, cache: 'no-store' });
  const body = (await res.json()) as T & { error?: string; message?: string | string[] };

  if (!res.ok) {
    const rawMessage = body.message ?? body.error;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : (rawMessage ?? 'An error occurred');
    throw new ApiError(res.status, message);
  }

  return body;
}

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

  return expensesFetch<PaginatedResponse<ExpenseDTO>>(`/api/expenses${qs}`);
}

export async function getExpense(id: string, token?: string): Promise<ExpenseDTO> {
  if (token) {
    return apiRequest<ExpenseDTO>(`/expenses/${id}`, undefined, token);
  }
  return expensesFetch<ExpenseDTO>(`/api/expenses/${id}`);
}

export async function createExpense(input: CreateExpenseInput): Promise<CreateExpenseResult> {
  return expensesFetch<CreateExpenseResult>('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function cancelExpense(
  id: string,
  input: CancelExpenseInput
): Promise<CancelExpenseResult> {
  return expensesFetch<CancelExpenseResult>(`/api/expenses/${id}/cancel`, {
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

  return expensesFetch<PaginatedResponse<ExpenseCategoryDTO>>(`/api/expense-categories${qs}`);
}

export async function createExpenseCategory(
  input: CreateExpenseCategoryInput
): Promise<ExpenseCategoryStatusResult> {
  return expensesFetch<ExpenseCategoryStatusResult>('/api/expense-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getExpenseCategory(id: string, token?: string): Promise<ExpenseCategoryDTO> {
  if (token) {
    return apiRequest<ExpenseCategoryDTO>(`/expense-categories/${id}`, undefined, token);
  }
  return expensesFetch<ExpenseCategoryDTO>(`/api/expense-categories/${id}`);
}

export async function updateExpenseCategory(
  id: string,
  input: UpdateExpenseCategoryInput
): Promise<ExpenseCategoryStatusResult> {
  return expensesFetch<ExpenseCategoryStatusResult>(`/api/expense-categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function deleteExpenseCategory(id: string): Promise<ExpenseCategoryStatusResult> {
  return expensesFetch<ExpenseCategoryStatusResult>(`/api/expense-categories/${id}`, {
    method: 'DELETE'
  });
}
