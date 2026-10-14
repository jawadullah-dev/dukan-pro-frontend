import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  PaymentDTO,
  CreatePaymentInput,
  CancelPaymentInput,
  CancelImpactDTO
} from '@/lib/api/types';
import type { PaymentsListFilters, CancelPaymentResult } from '@/types';
import { appFetch } from '@/lib/api/app-fetch';

export async function listPayments(
  filters: PaymentsListFilters = {},
  token?: string
): Promise<PaginatedResponse<PaymentDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.customerId) params.set('customerId', filters.customerId);
  if (filters.saleId) params.set('saleId', filters.saleId);
  if (filters.receiptGroupId) params.set('receiptGroupId', filters.receiptGroupId);
  if (filters.status) params.set('status', filters.status);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<PaymentDTO>>(`/payments${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<PaymentDTO>>(`/api/payments${qs}`);
}

export async function getPayment(id: string, token?: string): Promise<PaymentDTO> {
  if (token) {
    return apiRequest<PaymentDTO>(`/payments/${id}`, undefined, token);
  }
  return appFetch<PaymentDTO>(`/api/payments/${id}`);
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentDTO> {
  return appFetch<PaymentDTO>('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getPaymentCancelImpact(id: string, token?: string): Promise<CancelImpactDTO> {
  if (token) {
    return apiRequest<CancelImpactDTO>(`/payments/${id}/cancel-impact`, undefined, token);
  }
  return appFetch<CancelImpactDTO>(`/api/payments/${id}/cancel-impact`);
}

export async function cancelPayment(
  id: string,
  input: CancelPaymentInput
): Promise<CancelPaymentResult> {
  return appFetch<CancelPaymentResult>(`/api/payments/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
