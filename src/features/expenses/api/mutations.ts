import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type {
  CreateExpenseInput,
  CancelExpenseInput,
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput
} from '@/types/expense';
import { expenseKeys } from './queries';
import {
  cancelExpense,
  createExpense,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory
} from './service';

export const createExpenseMutation = mutationOptions({
  mutationFn: (input: CreateExpenseInput) => createExpense(input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: expenseKeys.all });
    qc.invalidateQueries({ queryKey: ['cash'] });
  }
});

export interface CancelExpenseMutationVariables {
  id: string;
  input: CancelExpenseInput;
}

export interface UpdateExpenseCategoryMutationVariables {
  id: string;
  input: UpdateExpenseCategoryInput;
}

export const cancelExpenseMutation = mutationOptions({
  mutationFn: ({ id, input }: CancelExpenseMutationVariables) => cancelExpense(id, input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: expenseKeys.all });
    qc.invalidateQueries({ queryKey: ['cash'] });
  }
});

export const createExpenseCategoryMutation = mutationOptions({
  mutationFn: (input: CreateExpenseCategoryInput) => createExpenseCategory(input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: expenseKeys.all });
  }
});

export const updateExpenseCategoryMutation = mutationOptions({
  mutationFn: ({ id, input }: UpdateExpenseCategoryMutationVariables) =>
    updateExpenseCategory(id, input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: expenseKeys.all });
  }
});

export const deleteExpenseCategoryMutation = mutationOptions({
  mutationFn: (id: string) => deleteExpenseCategory(id),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: expenseKeys.all });
  }
});
