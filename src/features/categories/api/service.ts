import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listCategories(filters: ListFilters = {}) {
  return dukaan.listCategories(filters);
}

export async function createCategory(name: string) {
  return dukaan.createCategory(name);
}

export async function updateCategory(id: string, name: string) {
  return dukaan.updateCategory(id, { name });
}

export async function deleteCategory(id: string) {
  return dukaan.deleteCategory(id);
}
