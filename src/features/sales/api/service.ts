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
import { ApiError } from '@/lib/api/types';

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

const APP_URL =
  typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006').replace(/\/+$/, '');

async function salesFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${APP_URL}${path}`;
  const res = await fetch(url, { ...init, cache: 'no-store' });
  const body = (await res.json()) as T & { error?: string; message?: string | string[] };

  if (!res.ok) {
    const rawMessage =
      (body as { message?: string | string[] }).message ?? (body as { error?: string }).error;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : (rawMessage ?? 'An error occurred');
    throw new ApiError(res.status, message);
  }

  return body;
}

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

  // Server-side prefetch with token: direct call to NestJS backend
  if (token) {
    return apiRequest<PaginatedResponse<SaleDTO>>(`/sales${qs}`, undefined, token);
  }

  // Client-side call through Next.js Route Handler
  return salesFetch<PaginatedResponse<SaleDTO>>(`/api/sales${qs}`);
}

export async function getSale(id: string, token?: string): Promise<SaleDTO> {
  if (token) {
    return apiRequest<SaleDTO>(`/sales/${id}`, undefined, token);
  }
  return salesFetch<SaleDTO>(`/api/sales/${id}`);
}

export async function createSale(input: CreateSaleInput): Promise<SaleDTO> {
  return salesFetch<SaleDTO>('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getCancelImpact(id: string, token?: string): Promise<CancelImpactDTO> {
  if (token) {
    return apiRequest<CancelImpactDTO>(`/sales/${id}/cancel-impact`, undefined, token);
  }
  return salesFetch<CancelImpactDTO>(`/api/sales/${id}/cancel-impact`);
}

export async function cancelSale(
  id: string,
  input: CancelSaleInput
): Promise<{ confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleDTO> {
  return salesFetch<{ confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleDTO>(
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
  return salesFetch<ReturnPreviewDTO>(`/api/sales/${id}/returns/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function createReturn(
  id: string,
  input: CreateReturnInput
): Promise<{ confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleReturnDTO> {
  return salesFetch<
    { confirmOverdraft?: boolean; shortfall?: number; message?: string } | SaleReturnDTO
  >(`/api/sales/${id}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
