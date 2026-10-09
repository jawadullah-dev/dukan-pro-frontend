import type { Shop, User } from './types';
import { getStore } from './store';
import { DEMO_SHOP_ID } from '@/lib/auth/accounts';
import { AppError } from '@/lib/errors';

export type SessionRole = 'OWNER' | 'ADMIN' | 'SUPER_ADMIN';

export interface MockSession {
  user_id: string;
  shop_id: string;
  role: SessionRole;
  user_name: string;
  shop_name: string;
}

let runtimeSession: MockSession | null = null;

export function setRuntimeSession(session: MockSession | null): void {
  runtimeSession = session;
}

function getRuntimeSession(): MockSession | null {
  return runtimeSession;
}

export function getSession(): MockSession {
  if (runtimeSession) return runtimeSession;

  const store = getStore();
  const shop = store.shops.find((s) => s.id === DEMO_SHOP_ID) ?? store.shops[0];
  const user =
    store.users.find((u) => u.shop_id === shop?.id && u.role === 'OWNER') ?? store.users[0];

  if (!shop || !user) {
    throw new AppError('Shop or user not found');
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
  const { shop_id } = getSession();
  const shop = getStore().shops.find((s) => s.id === shop_id);
  if (!shop) throw new AppError('Shop not found');
  return shop;
}

function getCurrentUser(): User {
  const { user_id, role } = getSession();
  if (role === 'SUPER_ADMIN') {
    const owner = getStore().users.find(
      (u) => u.shop_id === getSession().shop_id && u.role === 'OWNER'
    );
    if (!owner) throw new AppError('Shop owner not found');
    return owner;
  }
  const user = getStore().users.find((u) => u.id === user_id);
  if (!user) throw new AppError('User not found');
  return user;
}

export function assertShopActive(): void {
  const shop = getCurrentShop();
  if (shop.status !== 'ACTIVE') {
    throw new AppError('Subscription expired. Please renew to continue.');
  }
}
