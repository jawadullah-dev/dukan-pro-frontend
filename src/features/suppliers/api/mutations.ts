import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { supplierKeys } from './queries';
import { createSupplier, updateSupplier, deleteSupplier } from './service';
import type { CreateSupplierInput, UpdateSupplierInput } from '@/lib/api/types';

export const createSupplierMutation = mutationOptions({
  mutationFn: (data: CreateSupplierInput) => createSupplier(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});

export const updateSupplierMutation = mutationOptions({
  mutationFn: ({ id, data }: { id: string; data: UpdateSupplierInput }) => updateSupplier(id, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});

export const deleteSupplierMutation = mutationOptions({
  mutationFn: (id: string) => deleteSupplier(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});
