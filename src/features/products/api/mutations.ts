import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createProduct, updateProduct, deleteProduct } from './service';
import { productKeys } from './queries';
import type { ProductMutationPayload, UpdateProductVariables } from './types';

export const createProductMutation = mutationOptions({
  mutationFn: (data: ProductMutationPayload) => createProduct(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: productKeys.all });
  }
});

export const updateProductMutation = mutationOptions({
  mutationFn: ({ id, values }: UpdateProductVariables) => updateProduct(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: productKeys.all });
  }
});

export const deleteProductMutation = mutationOptions({
  mutationFn: (id: number) => deleteProduct(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: productKeys.all });
  }
});
