import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { customerKeys } from './queries';
import { createCustomer } from './service';

export const createCustomerMutation = mutationOptions({
  mutationFn: (data: Parameters<typeof createCustomer>[0]) => createCustomer(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: customerKeys.all });
  }
});
