import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';
import type {
  CashMovementDTO,
  CashMovementQueryFilter,
  CreateOpeningCashInput,
  CreateOwnerInvestmentInput,
  CreateOwnerWithdrawalInput,
  CreateOwnerWithdrawalResult,
  CashStatusResult
} from '@/types/cash';
import { dukaan, type ListFilters } from '@/lib/dukaan';

async function cashFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function listCashMovements(
  filters: CashMovementQueryFilter = {},
  token?: string
): Promise<PaginatedResponse<CashMovementDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.type) params.set('type', filters.type);
  if (filters.direction) params.set('direction', filters.direction);
  if (filters.search) params.set('search', filters.search);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<CashMovementDTO>>(`/cash/movements${qs}`, undefined, token);
  }

  return cashFetch<PaginatedResponse<CashMovementDTO>>(`/api/cash/movements${qs}`);
}

export async function createOpeningCash(input: CreateOpeningCashInput): Promise<CashStatusResult> {
  return cashFetch<CashStatusResult>('/api/cash/opening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function createOwnerInvestment(
  input: CreateOwnerInvestmentInput
): Promise<CashStatusResult> {
  return cashFetch<CashStatusResult>('/api/cash/investments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function createOwnerWithdrawal(
  input: CreateOwnerWithdrawalInput
): Promise<CreateOwnerWithdrawalResult> {
  return cashFetch<CreateOwnerWithdrawalResult>('/api/cash/withdrawals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function listPayments(filters: ListFilters = {}) {
  return dukaan.listPayments(filters);
}
