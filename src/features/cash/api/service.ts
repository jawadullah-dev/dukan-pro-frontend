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

import { buildQueryString } from '@/lib/api/query-params';

export async function listCashMovements(
  filters: CashMovementQueryFilter = {},
  token?: string
): Promise<PaginatedResponse<CashMovementDTO>> {
  const qs = buildQueryString({
    ...filters,
    pageSize: filters.pageSize ?? filters.limit
  } as Record<string, unknown>);

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
