import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { CreateOwnerWithdrawalInput } from '@/types/cash';
import { cashKeys } from './queries';
import { createOwnerWithdrawal } from './service';

export const createOwnerWithdrawalMutation = mutationOptions({
  mutationFn: (input: CreateOwnerWithdrawalInput) => createOwnerWithdrawal(input),
  onSuccess: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: cashKeys.all });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  }
});
