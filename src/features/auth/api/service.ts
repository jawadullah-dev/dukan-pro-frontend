import { apiRequest } from '@/lib/api/client';
import type { RegisterValues, AuthResponseData } from '@/types/auth';

export async function registerOwnerAccount(input: RegisterValues): Promise<AuthResponseData> {
  return apiRequest<AuthResponseData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
