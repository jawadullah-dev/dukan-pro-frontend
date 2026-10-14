import type { Shop, SessionRole, MockSession } from './types';
import { getStore } from './store';
import { DEMO_SHOP_ID } from '@/lib/auth/accounts';
import { AppError } from '@/lib/errors';
export type { SessionRole, MockSession };

let runtimeSession: MockSession | null = null;

export function setRuntimeSession(session: MockSession | null): void {
  runtimeSession = session;
}

export function getSession(): MockSession {
  if (runtimeSession) return runtimeSession;

  const store = getStore();
  const shop = store.shops.find((s) => s.id === DEMO_SHOP_ID) ?? store.shops[0];
  const user =
    store.users.find((u) => u.shop_id === shop?.id && u.role === 'OWNER') ?? store.users[0];

  if (!shop || !user) {
    return {
      user_id: '01a135d4-b50e-75c9-90c6-84b83fca609c',
      shop_id: '01a135d4-b352-74fd-951f-616058efb005',
      role: 'OWNER',
      user_name: 'Shop Owner',
      shop_name: 'Dukan Pro Mobile Shop'
    };
  }

  return {
    user_id: user.id,
    shop_id: shop.id,
    role: user.role,
    user_name: user.name,
    shop_name: shop.name
  };
}

export function canCancelRecords(role: SessionRole = getSession().role): boolean {
  return role === 'OWNER' || role === 'SUPER_ADMIN';
}

export function getCurrentShop(): Shop {
  const session = getSession();
  const { shop_id } = session;
  const store = getStore();
  let shop = store.shops.find((s) => s.id === shop_id);
  if (!shop) {
    const newShop: Shop = {
      id: shop_id,
      name: session.shop_name || 'Dukan Pro Mobile Shop',
      phone: '03115514151',
      address: 'Main Market, Pakistan',
      status: 'ACTIVE',
      subscription_ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      next_sale_no: 1,
      next_purchase_no: 1,
      created_at: new Date().toISOString()
    };
    store.shops.push(newShop);
    shop = newShop;
  }
  return shop;
}

export function assertShopActive(): void {
  const shop = getCurrentShop();
  if (shop.status !== 'ACTIVE') {
    throw new AppError('Subscription expired. Please renew to continue.');
  }
}
