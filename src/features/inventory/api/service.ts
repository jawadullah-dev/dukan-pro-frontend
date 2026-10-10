import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listStock(filters: ListFilters = {}) {
  return dukaan.listStock(filters);
}

export async function adjustStock(payload: Parameters<typeof dukaan.adjustStock>[0]) {
  return dukaan.adjustStock(payload);
}

export async function listInventoryMovements(filters: ListFilters = {}) {
  return dukaan.listInventoryMovements(filters);
}
