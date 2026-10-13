import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  SaleDTO,
  CreateSaleInput,
  CancelSaleInput,
  CancelImpactDTO,
  ReturnPreviewInput,
  ReturnPreviewDTO,
  CreateReturnInput,
  SaleReturnDTO
} from '@/lib/api/types';

export interface SalesListFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: 'ACTIVE' | 'CANCELLED';
  from?: string;
  to?: string;
  sortBy?: 'saleDate' | 'saleNo' | 'totalAmount' | 'paid' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

import { appFetch } from '@/lib/api/app-fetch';

export async function listSales(
  filters: SalesListFilters = {},
  token?: string
): Promise<PaginatedResponse<SaleDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.customerId) params.set('customerId', filters.customerId);
  if (filters.status) params.set('status', filters.status);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

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

export async function cancelSale(
  id: string,
  input: CancelSaleInput
): Promise<{ confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleDTO> {
  return appFetch<{ confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleDTO>(
    `/api/sales/${id}/cancel`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    }
  );
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
): Promise<{ confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleReturnDTO> {
  return appFetch<
    { confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleReturnDTO
  >(`/api/sales/${id}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
