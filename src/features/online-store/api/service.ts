import { apiRequest } from '@/lib/api/client';

export async function getStoreSettings() {
  return apiRequest('/store/settings');
}

export async function updateStoreSettings(data: any) {
  return apiRequest('/store/settings', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function getProductImages(productId: string) {
  return apiRequest(`/products/${productId}/images`);
}

export async function uploadProductImage(productId: string, formData: FormData) {
  return apiRequest(`/products/${productId}/images`, {
    method: 'POST',
    body: formData
  });
}

export async function deleteProductImage(productId: string, imageId: string) {
  return apiRequest(`/products/${productId}/images/${imageId}`, {
    method: 'DELETE'
  });
}

export async function reorderProductImages(productId: string, imageIds: string[]) {
  return apiRequest(`/products/${productId}/images/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ imageIds })
  });
}

export async function getPublicStorefront(slug: string) {
  return apiRequest(`/storefront/${slug}`);
}

export async function getPublicStoreProducts(slug: string, query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/storefront/${slug}/products?${searchParams.toString()}`);
}
