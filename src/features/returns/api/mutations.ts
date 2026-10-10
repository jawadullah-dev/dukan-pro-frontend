import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { returnKeys } from './queries';
import { createReturn } from './service';

export const createReturnMutation = mutationOptions({
  mutationFn: (data: any) => createReturn(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: returnKeys.all });
  }
});
