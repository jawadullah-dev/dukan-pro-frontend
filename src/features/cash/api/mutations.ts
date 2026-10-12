import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type {
  CreateOpeningCashInput,
  CreateOwnerInvestmentInput,
  CreateOwnerWithdrawalInput
} from '@/types/cash';
import { cashKeys } from './queries';
import { createOpeningCash, createOwnerInvestment, createOwnerWithdrawal } from './service';

export const createOpeningCashMutation = mutationOptions({
  mutationFn: (input: CreateOpeningCashInput) => createOpeningCash(input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: cashKeys.all });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  }
});

export const createOwnerInvestmentMutation = mutationOptions({
  mutationFn: (input: CreateOwnerInvestmentInput) => createOwnerInvestment(input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: cashKeys.all });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  }
});

export const createOwnerWithdrawalMutation = mutationOptions({
  mutationFn: (input: CreateOwnerWithdrawalInput) => createOwnerWithdrawal(input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: cashKeys.all });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  }
});
