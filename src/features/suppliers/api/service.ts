import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  SupplierDTO,
  CreateSupplierInput,
  UpdateSupplierInput
} from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

export interface SupplierListFilters {
  page?: number;
  pageSize?: number;
  limit?: number; // backwards-compatible alias
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'phone' | 'createdAt' | 'updatedAt' | 'openingBalance';
  sortOrder?: 'asc' | 'desc';
}

async function supplierFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, cache: 'no-store' });
  const body = (await res.json()) as T & { error?: string; message?: string | string[] };

  if (!res.ok) {
    const rawMessage = (body as { message?: string | string[] }).message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : (rawMessage ?? 'An error occurred');
    throw new ApiError(res.status, message);
  }

  return body;
}

export async function listSuppliers(
  filters: SupplierListFilters = {},
  token?: string
): Promise<PaginatedResponse<SupplierDTO>> {
  const params = new URLSearchParams();
  const effectivePageSize = filters.pageSize ?? filters.limit;

  if (filters.page) params.set('page', String(filters.page));
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (typeof filters.isActive === 'boolean') params.set('isActive', String(filters.isActive));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  // Server-side prefetch with token: call NestJS backend directly
  if (token) {
    return apiRequest<PaginatedResponse<SupplierDTO>>(`/suppliers${qs}`, undefined, token);
  }

  // Client-side: proxy through Next.js route handler
  return supplierFetch<PaginatedResponse<SupplierDTO>>(`/api/suppliers${qs}`);
}

export async function getSupplierById(id: string, token?: string): Promise<SupplierDTO> {
  if (token) {
    return apiRequest<SupplierDTO>(`/suppliers/${id}`, undefined, token);
  }
  return supplierFetch<SupplierDTO>(`/api/suppliers/${id}`);
}

export async function createSupplier(data: CreateSupplierInput): Promise<SupplierDTO> {
  return supplierFetch<SupplierDTO>('/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateSupplier(id: string, data: UpdateSupplierInput): Promise<SupplierDTO> {
  return supplierFetch<SupplierDTO>(`/api/suppliers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deactivateSupplier(id: string): Promise<SupplierDTO> {
  return updateSupplier(id, { isActive: false });
}

export async function reactivateSupplier(id: string): Promise<SupplierDTO> {
  return updateSupplier(id, { isActive: true });
}

export async function deleteSupplier(id: string): Promise<unknown> {
  return supplierFetch<unknown>(`/api/suppliers/${id}`, { method: 'DELETE' });
}
