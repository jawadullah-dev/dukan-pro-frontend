import { apiRequest } from '@/lib/api/client';

export async function listReconciliations(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/cash-reconciliations?${searchParams.toString()}`);
}

export async function createReconciliation(data: { countedCash: number; reason?: string }) {
  return apiRequest('/cash-reconciliations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
