import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { productKeys } from './queries';
import { createProduct, updateProduct, deleteProduct } from './service';

export const createProductMutation = mutationOptions({
  mutationFn: (input: Parameters<typeof createProduct>[0]) => createProduct(input),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: productKeys.all });
  }
});

export const updateProductMutation = mutationOptions({
  mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateProduct>[1] }) =>
    updateProduct(id, input),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: productKeys.all });
  }
});

export const deleteProductMutation = mutationOptions({
  mutationFn: (id: string) => deleteProduct(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: productKeys.all });
  }
});
