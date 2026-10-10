import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listBrands(filters: ListFilters = {}) {
  return dukaan.listBrands(filters);
}

export async function createBrand(name: string) {
  return dukaan.createBrand(name);
}

export async function updateBrand(id: string, name: string) {
  return dukaan.updateBrand(id, { name });
}

export async function deleteBrand(id: string) {
  return dukaan.deleteBrand(id);
}
