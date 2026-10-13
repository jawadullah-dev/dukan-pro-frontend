import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, BrandDTO } from '@/lib/api/types';
import { appFetch } from '@/lib/api/app-fetch';

export interface BrandListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function listBrands(
  filters: BrandListFilters = {},
  token?: string
): Promise<PaginatedResponse<BrandDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<BrandDTO>>(`/brands${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<BrandDTO>>(`/api/brands${qs}`);
}

export async function createBrand(name: string): Promise<BrandDTO> {
  return appFetch<BrandDTO>('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function updateBrand(id: string, name: string): Promise<BrandDTO> {
  return appFetch<BrandDTO>(`/api/brands/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function deleteBrand(id: string): Promise<unknown> {
  return appFetch<unknown>(`/api/brands/${id}`, { method: 'DELETE' });
}
