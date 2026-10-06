import { DEMO_SHOP_ID, DEMO_SHOP_NAME, type AuthAccountRole } from '@/lib/auth/accounts';
import type { MockSession } from '@/lib/dukaan/session';

export function toDukaanSession(session: {
  user: {
    id: string;
    name?: string | null;
    role: AuthAccountRole;
    shopId: string | null;
    shopName: string | null;
  };
}): MockSession {
  const isPlatform = session.user.role === 'SUPER_ADMIN';
  return {
    user_id: session.user.id,
    shop_id: session.user.shopId ?? DEMO_SHOP_ID,
    role: session.user.role,
    user_name: session.user.name ?? 'User',
    shop_name: isPlatform ? 'Dukaan Pro Platform' : (session.user.shopName ?? DEMO_SHOP_NAME)
  };
}
