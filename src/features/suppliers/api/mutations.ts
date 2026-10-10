import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { supplierKeys } from './queries';
import { createSupplier } from './service';

export const createSupplierMutation = mutationOptions({
  mutationFn: (data: Parameters<typeof createSupplier>[0]) => createSupplier(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: supplierKeys.all });
  }
});
