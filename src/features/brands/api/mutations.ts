import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { brandKeys } from './queries';
import { createBrand, updateBrand, deleteBrand } from './service';

export const createBrandMutation = mutationOptions({
  mutationFn: (name: string) => createBrand(name),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});

export const updateBrandMutation = mutationOptions({
  mutationFn: ({ id, name }: { id: string; name: string }) => updateBrand(id, name),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});

export const deleteBrandMutation = mutationOptions({
  mutationFn: (id: string) => deleteBrand(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: brandKeys.all });
  }
});
