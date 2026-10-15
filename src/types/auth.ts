import type { ReactNode } from 'react';
import type { AuthAccountRole } from '@/lib/auth/accounts';

export interface LoginValues {
  phone: string;
  password: string;
}

export interface BaseLoginFormProps {
  title: string;
  description: string;
  minPasswordLength?: number;
  onSubmit: (values: LoginValues) => Promise<string | null>;
  footer?: ReactNode;
}

export interface LoginResult {
  id: string;
  name: string;
  phone: string;
  role: AuthAccountRole;
  shopId: string | null;
  shopName: string | null;
  accessToken: string;
  subscriptionEndsAt: string | null;
}

export interface AuthUserSummary {
  id: string;
  name: string;
  phone: string;
}

export interface AuthShopSummary {
  name?: string | null;
  subscriptionEndsAt?: string | null;
}

export interface AuthResponseData {
  accessToken?: string;
  user?: AuthUserSummary;
  admin?: AuthUserSummary;
  shopId?: string | null;
  shop?: AuthShopSummary | null;
}

export interface AuthResponseBody {
  data?: AuthResponseData;
}

export interface SessionUserPayload {
  id: string;
  name?: string | null;
  role: AuthAccountRole;
  shopId: string | null;
  shopName: string | null;
}

export interface DukaanSessionSource {
  user: SessionUserPayload;
}

export interface AuthRoleHolder {
  role?: string;
}

export interface AuthRedirectSession {
  user?: AuthRoleHolder;
}
