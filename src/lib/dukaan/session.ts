import type { Shop, User } from './types';
import { getStore } from './store';

export interface MockSession {
  user_id: string;
  shop_id: string;
  role: 'OWNER' | 'ADMIN';
  user_name: string;
  shop_name: string;
}

/** Fixed demo session — shop_id always comes from here, never the browser. */
export function getSession(): MockSession {
  const store = getStore();
  const shop = store.shops[0];
  const user = store.users.find((u) => u.shop_id === shop.id && u.role === 'OWNER')!;

  return {
    user_id: user.id,
    shop_id: shop.id,
    role: user.role,
    user_name: user.name,
    shop_name: shop.name
  };
}

export function getCurrentShop(): Shop {
  const { shop_id } = getSession();
  const shop = getStore().shops.find((s) => s.id === shop_id);
  if (!shop) throw new Error('Shop not found');
  return shop;
}

export function getCurrentUser(): User {
  const { user_id } = getSession();
  const user = getStore().users.find((u) => u.id === user_id);
  if (!user) throw new Error('User not found');
  return user;
}

export function assertShopActive(): void {
  const shop = getCurrentShop();
  if (shop.status !== 'ACTIVE') {
    throw new Error('Subscription expired. Please renew to continue.');
  }
}
