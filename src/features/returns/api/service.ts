import { apiRequest } from '@/lib/api/client';

export async function listReturns(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/returns?${searchParams.toString()}`);
}

export async function getReturnPreview(saleId: string) {
  return apiRequest(`/returns/preview/${saleId}`);
}

export async function createReturn(data: any) {
  return apiRequest('/returns', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
