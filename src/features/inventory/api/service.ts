import { apiRequest } from '@/lib/api/client';
import { appFetch } from '@/lib/api/app-fetch';
import type {
  CreateInventoryAdjustmentInput,
  CreateInventoryAdjustmentResult,
  InventoryAdjustmentDTO,
  InventoryItemDTO,
  PaginatedResponse
} from '@/lib/api/types';
import type { InventoryStockFilters, InventoryAdjustmentsFilters } from '@/types';

export async function listInventoryStock(
  filters: InventoryStockFilters = {},
  token?: string
): Promise<PaginatedResponse<InventoryItemDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectiveSize = filters.pageSize ?? filters.limit;
  if (effectiveSize) params.set('pageSize', String(effectiveSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.trackingType) params.set('trackingType', filters.trackingType);
  if (filters.lowStock !== undefined) params.set('lowStock', String(filters.lowStock));

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<InventoryItemDTO>>(
      `/reports/inventory${qs}`,
      undefined,
      token
    );
  }

  return appFetch<PaginatedResponse<InventoryItemDTO>>(`/api/inventory${qs}`);
}

export async function listInventoryAdjustments(
  filters: InventoryAdjustmentsFilters = {},
  token?: string
): Promise<PaginatedResponse<InventoryAdjustmentDTO>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  const effectiveSize = filters.pageSize ?? filters.limit;
  if (effectiveSize) params.set('pageSize', String(effectiveSize));
  if (filters.search) params.set('search', filters.search);
  if (filters.productId) params.set('productId', filters.productId);
  if (filters.type) params.set('type', filters.type);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const qs = params.toString() ? `?${params.toString()}` : '';

  if (token) {
    return apiRequest<PaginatedResponse<InventoryAdjustmentDTO>>(
      `/inventory/adjustments${qs}`,
      undefined,
      token
    );
  }

  return appFetch<PaginatedResponse<InventoryAdjustmentDTO>>(`/api/inventory/adjustments${qs}`);
}

export async function createInventoryAdjustment(
  input: CreateInventoryAdjustmentInput
): Promise<CreateInventoryAdjustmentResult> {
  return appFetch<CreateInventoryAdjustmentResult>('/api/inventory/adjustments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}
