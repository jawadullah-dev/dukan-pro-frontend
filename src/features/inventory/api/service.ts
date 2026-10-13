import { apiRequest } from '@/lib/api/client';
import { ApiError } from '@/lib/api/types';
import type {
  CreateInventoryAdjustmentInput,
  CreateInventoryAdjustmentResult,
  InventoryAdjustmentDTO,
  InventoryItemDTO,
  PaginatedResponse
} from '@/lib/api/types';

export interface InventoryStockFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'inStock' | 'stockValue' | 'trackingType' | 'lowStock';
  sortOrder?: 'asc' | 'desc';
  trackingType?: 'QUANTITY' | 'SERIALIZED';
  lowStock?: boolean | string;
}

export interface InventoryAdjustmentsFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  productId?: string;
  type?: 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'quantityChange';
  sortOrder?: 'asc' | 'desc';
}

const APP_URL =
  typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006').replace(/\/+$/, '');

async function inventoryFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${APP_URL}${path}`;
  const res = await fetch(url, { ...init, cache: 'no-store' });
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

/**
 * Lists stock levels and items from /reports/inventory (point-in-time stock).
 */
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

  return inventoryFetch<PaginatedResponse<InventoryItemDTO>>(`/api/inventory${qs}`);
}

/**
 * Lists manual stock changes (ADJUSTMENT, DAMAGED, LOST).
 */
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

  return inventoryFetch<PaginatedResponse<InventoryAdjustmentDTO>>(
    `/api/inventory/adjustments${qs}`
  );
}

/**
 * Records a manual stock change (adjust count, damaged, lost).
 */
export async function createInventoryAdjustment(
  input: CreateInventoryAdjustmentInput
): Promise<CreateInventoryAdjustmentResult> {
  return inventoryFetch<CreateInventoryAdjustmentResult>('/api/inventory/adjustments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
}

// Backward-compatible aliases
export const listStock = listInventoryStock;
export const adjustStock = createInventoryAdjustment;
export const listInventoryMovements = listInventoryAdjustments;
