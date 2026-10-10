import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listSuppliers(filters: ListFilters = {}) {
  return dukaan.listSuppliers(filters);
}

export async function createSupplier(data: Parameters<typeof dukaan.createSupplier>[0]) {
  return dukaan.createSupplier(data);
}
