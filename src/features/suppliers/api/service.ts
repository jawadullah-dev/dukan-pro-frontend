import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  SupplierDTO,
  CreateSupplierInput,
  UpdateSupplierInput
} from '@/lib/api/types';
import { appFetch } from '@/lib/api/app-fetch';

export interface SupplierListFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'phone' | 'createdAt' | 'updatedAt' | 'openingBalance';
  sortOrder?: 'asc' | 'desc';
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

  if (token) {
    return apiRequest<PaginatedResponse<SupplierDTO>>(`/suppliers${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<SupplierDTO>>(`/api/suppliers${qs}`);
}

export async function createSupplier(data: CreateSupplierInput): Promise<SupplierDTO> {
  return appFetch<SupplierDTO>('/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateSupplier(id: string, data: UpdateSupplierInput): Promise<SupplierDTO> {
  return appFetch<SupplierDTO>(`/api/suppliers/${id}`, {
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
