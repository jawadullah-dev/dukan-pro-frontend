import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export async function listExpenses(filters: ListFilters = {}) {
  return dukaan.listExpenses(filters);
}

export async function createExpense(payload: Parameters<typeof dukaan.createExpense>[0]) {
  return dukaan.createExpense(payload);
}

export async function listExpenseCategories(filters: ListFilters = {}) {
  return dukaan.listExpenseCategories(filters);
}

export async function createExpenseCategory(name: string) {
  return dukaan.createExpenseCategory(name);
}
