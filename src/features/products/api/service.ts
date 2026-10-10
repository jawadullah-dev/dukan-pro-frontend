import { dukaan } from '@/lib/dukaan';
import type { ListFilters, Product } from '@/lib/dukaan';

export async function listProducts(filters: ListFilters = {}) {
  return dukaan.listProducts(filters);
}

export async function createProduct(input: Parameters<typeof dukaan.createProduct>[0]) {
  return dukaan.createProduct(input);
}

export async function updateProduct(id: string, input: Parameters<typeof dukaan.updateProduct>[1]) {
  return dukaan.updateProduct(id, input);
}

export async function deleteProduct(id: string) {
  return dukaan.deleteProduct(id);
}
