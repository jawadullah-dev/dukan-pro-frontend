import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listCashMovements(filters: ListFilters = {}) {
  return dukaan.listCashMovements(filters);
}

export async function listPayments(filters: ListFilters = {}) {
  return dukaan.listPayments(filters);
}
