import { apiRequest } from '@/lib/api/client';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  CancelImpactDTO,
  CancelPurchaseInput,
  CreatePurchaseInput,
  CreatePurchaseResult,
  PaginatedResponse,
  PurchaseDTO
} from '@/lib/api/types';

import type { PurchasesListFilters, CancelPurchaseResult } from '@/types';

import { buildQueryString } from '@/lib/api/query-params';

export async function listPurchases(
  filters: PurchasesListFilters = {},
  token?: string
): Promise<PaginatedResponse<PurchaseDTO>> {
  const qs = buildQueryString({
    ...filters,
    pageSize: filters.pageSize ?? filters.limit
  } as Record<string, unknown>);

  if (token) {
    return apiRequest<PaginatedResponse<PurchaseDTO>>(`/purchases${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<PurchaseDTO>>(`/api/purchases${qs}`);
}

export async function getPurchase(id: string, token?: string): Promise<PurchaseDTO> {
  if (token) {
    return apiRequest<PurchaseDTO>(`/purchases/${id}`, undefined, token);
  }
  return appFetch<PurchaseDTO>(`/api/purchases/${id}`);
}

export async function createPurchase(input: CreatePurchaseInput): Promise<CreatePurchaseResult> {
  return appFetch<CreatePurchaseResult>('/api/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getCancelImpact(id: string, token?: string): Promise<CancelImpactDTO> {
  if (token) {
    return apiRequest<CancelImpactDTO>(`/purchases/${id}/cancel-impact`, undefined, token);
  }
  return appFetch<CancelImpactDTO>(`/api/purchases/${id}/cancel-impact`);
}

export async function cancelPurchase(
  id: string,
  inputOrReason: CancelPurchaseInput | string,
  confirmOverdraft?: boolean
): Promise<CancelPurchaseResult> {
  const input: CancelPurchaseInput =
    typeof inputOrReason === 'string' ? { reason: inputOrReason, confirmOverdraft } : inputOrReason;
  return appFetch<CancelPurchaseResult>(`/api/purchases/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
