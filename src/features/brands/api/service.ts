/**
 * Brands feature — service layer.
 *
 * All functions call the Next.js Route Handlers at /api/brands (and /api/brands/[id]),
 * which server-side proxy to the NestJS backend using the session Bearer token.
 * The backend JWT is never exposed to the browser.
 *
 * For SSR prefetching, listBrands also accepts an optional server token to fetch
 * directly from the NestJS backend via apiRequest without an HTTP self-hop.
 *
 * Response shape from the route handler (envelope already unwrapped):
 *   GET  /api/brands         → PaginatedResponse<BrandDTO>
 *   POST /api/brands         → BrandDTO
 *   PATCH /api/brands/[id]   → BrandDTO
 *   DELETE /api/brands/[id]  → { status: true, message: string }
 */
import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, BrandDTO } from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

export interface BrandListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

async function brandFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function listBrands(
  filters: BrandListFilters = {},
  token?: string
): Promise<PaginatedResponse<BrandDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.search) params.set('search', filters.search);
  const qs = params.toString() ? `?${params.toString()}` : '';

  // Server-side prefetch with explicit token: call NestJS directly
  if (token) {
    return apiRequest<PaginatedResponse<BrandDTO>>(`/brands${qs}`, undefined, token);
  }

  // Client-side: proxy through Next.js Route Handler (secure, token-less from browser)
  return brandFetch<PaginatedResponse<BrandDTO>>(`/api/brands${qs}`);
}

export async function createBrand(name: string): Promise<BrandDTO> {
  return brandFetch<BrandDTO>('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function updateBrand(id: string, name: string): Promise<BrandDTO> {
  return brandFetch<BrandDTO>(`/api/brands/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
}

export async function deleteBrand(id: string): Promise<unknown> {
  return brandFetch<unknown>(`/api/brands/${id}`, { method: 'DELETE' });
}
