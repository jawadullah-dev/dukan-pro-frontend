import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  SupplierDTO,
  CreateSupplierInput,
  UpdateSupplierInput
} from '@/lib/api/types';
import type { SupplierListFilters } from '@/types';
import { appFetch } from '@/lib/api/app-fetch';

import { buildQueryString } from '@/lib/api/query-params';

export async function listSuppliers(
  filters: SupplierListFilters = {},
  token?: string
): Promise<PaginatedResponse<SupplierDTO>> {
  const qs = buildQueryString({
    ...filters,
    pageSize: filters.pageSize ?? filters.limit
  } as Record<string, unknown>);

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
