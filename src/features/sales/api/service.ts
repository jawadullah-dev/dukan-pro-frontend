import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  SaleDTO,
  CreateSaleInput,
  CancelSaleInput,
  CancelImpactDTO,
  ReturnPreviewInput,
  ReturnPreviewDTO,
  CreateReturnInput
} from '@/lib/api/types';

import type { SalesListFilters, CancelSaleResult, CreateReturnResult } from '@/types';

import { appFetch } from '@/lib/api/app-fetch';

import { buildQueryString } from '@/lib/api/query-params';

export async function listSales(
  filters: SalesListFilters = {},
  token?: string
): Promise<PaginatedResponse<SaleDTO>> {
  const qs = buildQueryString({
    ...filters,
    pageSize: filters.pageSize ?? filters.limit
  } as Record<string, unknown>);

  if (token) {
    return apiRequest<PaginatedResponse<SaleDTO>>(`/sales${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<SaleDTO>>(`/api/sales${qs}`);
}

export async function getSale(id: string, token?: string): Promise<SaleDTO> {
  if (token) {
    return apiRequest<SaleDTO>(`/sales/${id}`, undefined, token);
  }
  return appFetch<SaleDTO>(`/api/sales/${id}`);
}

export async function createSale(input: CreateSaleInput): Promise<SaleDTO> {
  return appFetch<SaleDTO>('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getCancelImpact(id: string, token?: string): Promise<CancelImpactDTO> {
  if (token) {
    return apiRequest<CancelImpactDTO>(`/sales/${id}/cancel-impact`, undefined, token);
  }
  return appFetch<CancelImpactDTO>(`/api/sales/${id}/cancel-impact`);
}

export async function cancelSale(id: string, input: CancelSaleInput): Promise<CancelSaleResult> {
  return appFetch<CancelSaleResult>(`/api/sales/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function previewReturn(
  id: string,
  input: ReturnPreviewInput
): Promise<ReturnPreviewDTO> {
  return appFetch<ReturnPreviewDTO>(`/api/sales/${id}/returns/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function createReturn(
  id: string,
  input: CreateReturnInput
): Promise<CreateReturnResult> {
  return appFetch<CreateReturnResult>(`/api/sales/${id}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
