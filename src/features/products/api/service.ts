/**
 * Products feature — service layer.
 *
 * Calls Next.js Route Handlers at /api/products (and nested routes),
 * which server-side proxy to NestJS backend using session Bearer token.
 * For SSR prefetching, listProducts also accepts an optional server token.
 */
import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  ProductDTO,
  ProductListFilters,
  CreateProductInput,
  UpdateProductInput,
  ProductImageDTO
} from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

async function productFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let url = path;
  if (typeof window === 'undefined' && path.startsWith('/api/')) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3006';
    url = `${baseUrl}${path}`;
  }
  const res = await fetch(url, { ...init, cache: 'no-store' });
  const body = (await res.json()) as T & { error?: string; message?: string | string[]; data?: T };

  if (!res.ok) {
    const rawMessage = (body as { message?: string | string[] }).message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : (rawMessage ?? 'An error occurred');
    throw new ApiError(res.status, message);
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

export async function listProducts(
  filters: ProductListFilters = {},
  token?: string
): Promise<PaginatedResponse<ProductDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId) params.set('categoryId', String(filters.categoryId));
  if (filters.brandId) params.set('brandId', String(filters.brandId));
  if (filters.trackingType) params.set('trackingType', String(filters.trackingType));
  if (filters.isActive) params.set('isActive', String(filters.isActive));

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<ProductDTO>>(`/products${qs}`, undefined, token);
  }

  return productFetch<PaginatedResponse<ProductDTO>>(`/api/products${qs}`);
}

export async function getProduct(id: string, token?: string): Promise<ProductDTO> {
  if (token) {
    return apiRequest<ProductDTO>(`/products/${id}`, undefined, token);
  }
  return productFetch<ProductDTO>(`/api/products/${id}`);
}

export async function createProduct(input: CreateProductInput): Promise<ProductDTO> {
  return productFetch<ProductDTO>('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<ProductDTO> {
  return productFetch<ProductDTO>(`/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function deleteProduct(id: string): Promise<unknown> {
  return productFetch<unknown>(`/api/products/${id}`, { method: 'DELETE' });
}

export async function bulkPublish(ids: string[], isPublished: boolean): Promise<unknown> {
  return productFetch<unknown>('/api/products/publish', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, isPublished })
  });
}

// Images
export async function listProductImages(
  productId: string,
  token?: string
): Promise<{ items: ProductImageDTO[] }> {
  if (token) {
    return apiRequest<{ items: ProductImageDTO[] }>(
      `/products/${productId}/images`,
      undefined,
      token
    );
  }
  return productFetch<{ items: ProductImageDTO[] }>(`/api/products/${productId}/images`);
}

export async function uploadProductImage(productId: string, file: File): Promise<ProductImageDTO> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`/api/products/${productId}/images`, {
    method: 'POST',
    body: formData,
    cache: 'no-store'
  });
  const body = (await res.json()) as ProductImageDTO & { message?: string | string[] };
  if (!res.ok) {
    const rawMessage = (body as { message?: string | string[] }).message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : (rawMessage ?? 'An error occurred');
    throw new ApiError(res.status, message);
  }
  return body as ProductImageDTO;
}

export async function reorderProductImages(
  productId: string,
  items: { id: string; sortOrder: number }[]
): Promise<unknown> {
  return productFetch<unknown>(`/api/products/${productId}/images/order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
}

export async function deleteProductImage(productId: string, imageId: string): Promise<unknown> {
  return productFetch<unknown>(`/api/products/${productId}/images/${imageId}`, {
    method: 'DELETE'
  });
}
