import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { expenseKeys } from './queries';
import { createExpense, createExpenseCategory } from './service';

export const createExpenseMutation = mutationOptions({
  mutationFn: (payload: Parameters<typeof createExpense>[0]) => createExpense(payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: expenseKeys.all });
  }
});

export const createExpenseCategoryMutation = mutationOptions({
  mutationFn: (name: string) => createExpenseCategory(name),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: expenseKeys.all });
  }
});
