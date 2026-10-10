import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listPurchases(filters: ListFilters = {}) {
  return dukaan.listPurchases(filters);
}

export async function getPurchase(id: string) {
  return dukaan.getPurchase(id);
}

export async function createPurchase(payload: Parameters<typeof dukaan.createPurchase>[0]) {
  return dukaan.createPurchase(payload);
}

export async function cancelPurchase(id: string, reason: string, confirmOverdraft?: boolean) {
  return dukaan.cancelPurchase(id, reason, confirmOverdraft);
}
