import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, CategoryDTO } from '@/lib/api/types';
import type { CategoryListFilters } from '@/types';
import { appFetch } from '@/lib/api/app-fetch';

export async function listCategories(
  filters: CategoryListFilters = {},
  token?: string
): Promise<PaginatedResponse<CategoryDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString() ? `?${params.toString()}` : '';

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
