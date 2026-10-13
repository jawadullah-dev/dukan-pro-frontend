import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  ProductDTO,
  ProductListFilters,
  CreateProductInput,
  UpdateProductInput,
  ProductImageDTO
} from '@/lib/api/types';
import { appFetch } from '@/lib/api/app-fetch';

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

  return appFetch<PaginatedResponse<ProductDTO>>(`/api/products${qs}`);
}

export async function getProduct(id: string, token?: string): Promise<ProductDTO> {
  if (token) {
    return apiRequest<ProductDTO>(`/products/${id}`, undefined, token);
  }
  return appFetch<ProductDTO>(`/api/products/${id}`);
}

export async function createProduct(input: CreateProductInput): Promise<ProductDTO> {
  return appFetch<ProductDTO>('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<ProductDTO> {
  return appFetch<ProductDTO>(`/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function deleteProduct(id: string): Promise<unknown> {
  return appFetch<unknown>(`/api/products/${id}`, { method: 'DELETE' });
}

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
  return appFetch<{ items: ProductImageDTO[] }>(`/api/products/${productId}/images`);
}

export async function uploadProductImage(productId: string, file: File): Promise<ProductImageDTO> {
  const formData = new FormData();
  formData.append('image', file);
  return appFetch<ProductImageDTO>(`/api/products/${productId}/images`, {
    method: 'POST',
    body: formData
  });
}

export async function reorderProductImages(
  productId: string,
  items: { id: string; sortOrder: number }[]
): Promise<unknown> {
  return appFetch<unknown>(`/api/products/${productId}/images/order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
}

export async function deleteProductImage(productId: string, imageId: string): Promise<unknown> {
  return appFetch<unknown>(`/api/products/${productId}/images/${imageId}`, {
    method: 'DELETE'
  });
}
