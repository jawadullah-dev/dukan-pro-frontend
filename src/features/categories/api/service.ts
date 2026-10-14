import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, CategoryDTO } from '@/lib/api/types';
import type { CategoryListFilters } from '@/types';
import { appFetch } from '@/lib/api/app-fetch';

import { buildQueryString } from '@/lib/api/query-params';

export async function listCategories(
  filters: CategoryListFilters = {},
  token?: string
): Promise<PaginatedResponse<CategoryDTO>> {
  const qs = buildQueryString(filters as Record<string, unknown>);

  if (token) {
    return apiRequest<PaginatedResponse<CategoryDTO>>(`/categories${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<CategoryDTO>>(`/api/categories${qs}`);
}

export async function createCategory(name: string): Promise<CategoryDTO> {
  return appFetch<CategoryDTO>('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function updateCategory(id: string, name: string): Promise<CategoryDTO> {
  return appFetch<CategoryDTO>(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function deleteCategory(id: string): Promise<unknown> {
  return appFetch<unknown>(`/api/categories/${id}`, { method: 'DELETE' });
}
