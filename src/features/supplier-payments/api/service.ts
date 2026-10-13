import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, CancelImpactDTO } from '@/lib/api/types';
import type {
  SupplierPaymentDTO,
  SupplierPayableDTO,
  CreateSupplierPaymentInput,
  CreateSupplierPaymentResult,
  CancelSupplierPaymentInput,
  CancelSupplierPaymentResult,
  SupplierPaymentQueryFilter
} from '@/types/supplier-payment';

import { appFetch } from '@/lib/api/app-fetch';

export async function listSupplierPayments(
  filters: SupplierPaymentQueryFilter = {},
  token?: string
): Promise<PaginatedResponse<SupplierPaymentDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.supplierId) params.set('supplierId', filters.supplierId);
  if (filters.purchaseId) params.set('purchaseId', filters.purchaseId);
  if (filters.status) params.set('status', filters.status);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<SupplierPaymentDTO>>(
      `/supplier-payments${qs}`,
      undefined,
      token
    );
  }

  return appFetch<PaginatedResponse<SupplierPaymentDTO>>(`/api/supplier-payments${qs}`);
}

export async function getSupplierPayable(
  supplierId: string,
  token?: string
): Promise<SupplierPayableDTO> {
  if (token) {
    return apiRequest<SupplierPayableDTO>(
      `/supplier-payments/payable/${supplierId}`,
      undefined,
      token
    );
  }
  return appFetch<SupplierPayableDTO>(`/api/supplier-payments/payable/${supplierId}`);
}

export async function createSupplierPayment(
  input: CreateSupplierPaymentInput
): Promise<CreateSupplierPaymentResult> {
  return appFetch<CreateSupplierPaymentResult>('/api/supplier-payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function getSupplierPaymentCancelImpact(
  id: string,
  token?: string
): Promise<CancelImpactDTO> {
  if (token) {
    return apiRequest<CancelImpactDTO>(`/supplier-payments/${id}/cancel-impact`, undefined, token);
  }
  return appFetch<CancelImpactDTO>(`/api/supplier-payments/${id}/cancel-impact`);
}

export async function cancelSupplierPayment(
  id: string,
  input: CancelSupplierPaymentInput
): Promise<CancelSupplierPaymentResult> {
  return appFetch<CancelSupplierPaymentResult>(`/api/supplier-payments/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
