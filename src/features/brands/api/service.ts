import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, BrandDTO } from '@/lib/api/types';
import type { BrandListFilters } from '@/types';
import { appFetch } from '@/lib/api/app-fetch';

import { buildQueryString } from '@/lib/api/query-params';

export async function listBrands(
  filters: BrandListFilters = {},
  token?: string
): Promise<PaginatedResponse<BrandDTO>> {
  const qs = buildQueryString(filters as Record<string, unknown>);

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
