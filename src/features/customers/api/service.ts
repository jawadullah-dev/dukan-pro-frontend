import { apiRequest } from '@/lib/api/client';
import type { PaginatedResponse, CustomerDTO } from '@/lib/api/types';
import type {
  CustomerListFilters,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerMutationResult
} from '@/types';
import { appFetch } from '@/lib/api/app-fetch';

export async function listCustomers(
  filters: CustomerListFilters = {},
  token?: string
): Promise<PaginatedResponse<CustomerDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectivePageSize = filters.pageSize ?? filters.limit;
  if (effectivePageSize) params.set('pageSize', String(effectivePageSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<CustomerDTO>>(`/customers${qs}`, undefined, token);
  }

  return appFetch<PaginatedResponse<CustomerDTO>>(`/api/customers${qs}`);
}

export async function getCustomer(id: string, token?: string): Promise<CustomerDTO> {
  if (token) {
    return apiRequest<CustomerDTO>(`/customers/${id}`, undefined, token);
  }
  return appFetch<CustomerDTO>(`/api/customers/${id}`);
}

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerDTO> {
  return appFetch<CustomerDTO>('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<CustomerMutationResult> {
  return appFetch<CustomerMutationResult>(`/api/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

export async function deactivateCustomer(id: string): Promise<CustomerMutationResult> {
  return updateCustomer(id, { isActive: false });
}

export async function reactivateCustomer(id: string): Promise<CustomerMutationResult> {
  return updateCustomer(id, { isActive: true });
}
