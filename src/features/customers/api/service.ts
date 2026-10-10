import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listCustomers(filters: ListFilters = {}) {
  return dukaan.listCustomers(filters);
}

export async function getCustomer(id: string) {
  return dukaan.getCustomer(id);
}

export async function createCustomer(data: Parameters<typeof dukaan.createCustomer>[0]) {
  return dukaan.createCustomer(data);
}
