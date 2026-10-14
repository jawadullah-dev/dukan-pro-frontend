import { DEMO_SHOP_ID, DEMO_SHOP_NAME } from '@/lib/auth/accounts';
import type { MockSession } from '@/lib/dukaan/session';

import type { DukaanSessionSource } from '@/types/auth';

export function toDukaanSession(session: DukaanSessionSource): MockSession {
  const isPlatform = session.user.role === 'SUPER_ADMIN';
  return {
    user_id: session.user.id,
    shop_id: session.user.shopId ?? DEMO_SHOP_ID,
    role: session.user.role,
    user_name: session.user.name ?? 'User',
    shop_name: isPlatform ? 'Dukaan Pro Platform' : (session.user.shopName ?? DEMO_SHOP_NAME)
  };
}
