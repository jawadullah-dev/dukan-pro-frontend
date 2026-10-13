import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';
import type {
  CashMovementDTO,
  CashMovementQueryFilter,
  CreateOpeningCashInput,
  CreateOwnerInvestmentInput,
  CreateOwnerWithdrawalInput,
  CreateOwnerWithdrawalResult,
  CashStatusResult
} from '@/types/cash';
import { appFetch } from '@/lib/api/app-fetch';

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

  return appFetch<PaginatedResponse<CashMovementDTO>>(`/api/cash/movements${qs}`);
}

export async function createOpeningCash(input: CreateOpeningCashInput): Promise<CashStatusResult> {
  return appFetch<CashStatusResult>('/api/cash/opening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function createOwnerInvestment(
  input: CreateOwnerInvestmentInput
): Promise<CashStatusResult> {
  return appFetch<CashStatusResult>('/api/cash/investments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function createOwnerWithdrawal(
  input: CreateOwnerWithdrawalInput
): Promise<CreateOwnerWithdrawalResult> {
  return appFetch<CreateOwnerWithdrawalResult>('/api/cash/withdrawals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
