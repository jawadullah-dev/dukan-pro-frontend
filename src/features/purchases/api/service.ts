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
): Promise<{ success?: boolean; message?: string }> {
  const input: CancelPurchaseInput =
    typeof inputOrReason === 'string' ? { reason: inputOrReason, confirmOverdraft } : inputOrReason;
  return appFetch<{ success?: boolean; message?: string }>(`/api/purchases/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
