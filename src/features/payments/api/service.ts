import { apiRequest } from '@/lib/api/client';
import type {
  PaginatedResponse,
  PaymentDTO,
  CreatePaymentInput,
  CancelPaymentInput,
  CancelImpactDTO
} from '@/lib/api/types';
import { ApiError } from '@/lib/api/types';

export interface PaymentsListFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  saleId?: string;
  receiptGroupId?: string;
  status?: 'ACTIVE' | 'CANCELLED';
  from?: string;
  to?: string;
  sortBy?: 'paymentDate' | 'amount' | 'createdAt' | 'updatedAt' | 'customerName' | 'method';
  sortOrder?: 'asc' | 'desc';
}

async function paymentsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, cache: 'no-store' });
  const body = (await res.json()) as T & { error?: string; message?: string | string[] };

  if (!res.ok) {
    const rawMessage =
      (body as { message?: string | string[] }).message ?? (body as { error?: string }).error;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : (rawMessage ?? 'An error occurred');
    throw new ApiError(res.status, message);
  }

  return body;
}

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

  // Server-side prefetch with token: direct call to NestJS backend
  if (token) {
    return apiRequest<PaginatedResponse<PaymentDTO>>(`/payments${qs}`, undefined, token);
  }

  // Client-side call via Next.js proxy route
  return paymentsFetch<PaginatedResponse<PaymentDTO>>(`/api/payments${qs}`);
}

export async function getPayment(id: string, token?: string): Promise<PaymentDTO> {
  if (token) {
    return apiRequest<PaymentDTO>(`/payments/${id}`, undefined, token);
  }
  return paymentsFetch<PaymentDTO>(`/api/payments/${id}`);
}

export async function createPayment(input: CreatePaymentInput): Promise<any> {
  return paymentsFetch<any>('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getPaymentCancelImpact(id: string, token?: string): Promise<CancelImpactDTO> {
  if (token) {
    return apiRequest<CancelImpactDTO>(`/payments/${id}/cancel-impact`, undefined, token);
  }
  return paymentsFetch<CancelImpactDTO>(`/api/payments/${id}/cancel-impact`);
}

export async function cancelPayment(
  id: string,
  input: CancelPaymentInput
): Promise<{ success: boolean; confirmOverdraft?: boolean; shortfall?: number; message?: string }> {
  return paymentsFetch<{
    success: boolean;
    confirmOverdraft?: boolean;
    shortfall?: number;
    message?: string;
  }>(`/api/payments/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
