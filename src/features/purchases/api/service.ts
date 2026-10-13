import { apiRequest } from '@/lib/api/client';
import type {
  CancelImpactDTO,
  CancelPurchaseInput,
  CreatePurchaseInput,
  CreatePurchaseResult,
  PaginatedResponse,
  PurchaseDTO
} from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

export interface PurchasesListFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  supplierId?: string;
  status?: 'ACTIVE' | 'CANCELLED';
  isOpeningStock?: boolean;
  from?: string;
  to?: string;
  sortBy?: 'purchaseDate' | 'purchaseNo' | 'totalAmount' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

const APP_URL =
  typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006').replace(/\/+$/, '');

async function purchasesFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function listPurchases(
  filters: PurchasesListFilters = {},
  token?: string
): Promise<PaginatedResponse<PurchaseDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.supplierId) params.set('supplierId', filters.supplierId);
  if (filters.status) params.set('status', filters.status);
  if (filters.isOpeningStock !== undefined) {
    params.set('isOpeningStock', String(filters.isOpeningStock));
  }
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  // Server-side prefetch with token: direct call to NestJS backend
  if (token) {
    return apiRequest<PaginatedResponse<PurchaseDTO>>(`/purchases${qs}`, undefined, token);
  }

  // Client-side call through Next.js Route Handler
  return purchasesFetch<PaginatedResponse<PurchaseDTO>>(`/api/purchases${qs}`);
}

export async function getPurchase(id: string, token?: string): Promise<PurchaseDTO> {
  if (token) {
    return apiRequest<PurchaseDTO>(`/purchases/${id}`, undefined, token);
  }
  return purchasesFetch<PurchaseDTO>(`/api/purchases/${id}`);
}

export async function createPurchase(input: CreatePurchaseInput): Promise<CreatePurchaseResult> {
  return purchasesFetch<CreatePurchaseResult>('/api/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getCancelImpact(id: string, token?: string): Promise<CancelImpactDTO> {
  if (token) {
    return apiRequest<CancelImpactDTO>(`/purchases/${id}/cancel-impact`, undefined, token);
  }
  return purchasesFetch<CancelImpactDTO>(`/api/purchases/${id}/cancel-impact`);
}

export async function cancelPurchase(
  id: string,
  input: CancelPurchaseInput
): Promise<{ success?: boolean; message?: string }> {
  return purchasesFetch<{ success?: boolean; message?: string }>(`/api/purchases/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
