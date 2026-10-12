import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, CategoryDTO } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

export interface CategoryListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

async function categoryFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function listCategories(
  filters: CategoryListFilters = {},
  token?: string
): Promise<PaginatedResponse<CategoryDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString() ? `?${params.toString()}` : '';

  // Server-side prefetch with token -> direct NestJS
  if (token) {
    return apiRequest<PaginatedResponse<CategoryDTO>>(`/categories${qs}`, undefined, token);
  }

  // Client-side -> Route Handler proxy
  return categoryFetch<PaginatedResponse<CategoryDTO>>(`/api/categories${qs}`);
}

export async function createCategory(name: string): Promise<CategoryDTO> {
  return categoryFetch<CategoryDTO>('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function updateCategory(id: string, name: string): Promise<CategoryDTO> {
  return categoryFetch<CategoryDTO>(`/api/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function deleteCategory(id: string): Promise<unknown> {
  return categoryFetch<unknown>(`/api/categories/${id}`, { method: 'DELETE' });
}
