import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { categoryKeys } from './queries';
import { createCategory, updateCategory, deleteCategory } from './service';

export const createCategoryMutation = mutationOptions({
  mutationFn: (name: string) => createCategory(name),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});

export const updateCategoryMutation = mutationOptions({
  mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});

export const deleteCategoryMutation = mutationOptions({
  mutationFn: (id: string) => deleteCategory(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  }
});
