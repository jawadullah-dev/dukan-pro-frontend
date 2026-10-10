import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listSales(filters: ListFilters = {}) {
  return dukaan.listSales(filters);
}

export async function getSale(id: string) {
  return dukaan.getSale(id);
}

export async function createSale(payload: Parameters<typeof dukaan.createSale>[0]) {
  return dukaan.createSale(payload);
}

export async function cancelSale(id: string, reason: string, confirmOverdraft?: boolean) {
  return dukaan.cancelSale(id, reason, confirmOverdraft);
}
