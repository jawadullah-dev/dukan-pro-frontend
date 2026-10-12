import { queryOptions } from '@tanstack/react-query';
import type { SupplierPaymentQueryFilter } from '@/types/supplier-payment';
import {
  getSupplierPayable,
  getSupplierPaymentCancelImpact,
  listSupplierPayments
} from './service';

export const supplierPaymentKeys = {
  all: ['supplierPayments'] as const,
  lists: () => [...supplierPaymentKeys.all, 'list'] as const,
  list: (filters?: SupplierPaymentQueryFilter) =>
    [...supplierPaymentKeys.lists(), filters] as const,
  payables: () => [...supplierPaymentKeys.all, 'payable'] as const,
  payable: (supplierId: string) => [...supplierPaymentKeys.payables(), supplierId] as const,
  cancelImpacts: () => [...supplierPaymentKeys.all, 'cancelImpact'] as const,
  cancelImpact: (id: string) => [...supplierPaymentKeys.cancelImpacts(), id] as const
};

export const supplierPaymentsQueryOptions = (
  filters: SupplierPaymentQueryFilter = {},
  token?: string
) =>
  queryOptions({
    queryKey: supplierPaymentKeys.list(filters),
    queryFn: () => listSupplierPayments(filters, token)
  });

export const supplierPayableQueryOptions = (supplierId: string, token?: string) =>
  queryOptions({
    queryKey: supplierPaymentKeys.payable(supplierId),
    queryFn: () => getSupplierPayable(supplierId, token),
    enabled: !!supplierId
  });

export const supplierPaymentCancelImpactQueryOptions = (id: string, token?: string) =>
  queryOptions({
    queryKey: supplierPaymentKeys.cancelImpact(id),
    queryFn: () => getSupplierPaymentCancelImpact(id, token),
    enabled: !!id
  });
