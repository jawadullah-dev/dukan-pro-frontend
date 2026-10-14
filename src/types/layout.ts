import type * as React from 'react';
import type { SessionRole } from '@/lib/dukaan/session';
import type { InfobarContent } from '@/components/ui/infobar';

export interface AppSidebarProps {
  role: SessionRole;
}

export interface AuthSessionBridgeProps {
  children: React.ReactNode;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface MobileBottomNavProps {
  role: SessionRole;
}

export interface PageContainerProps {
  children: React.ReactNode;
  isLoading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
  fill?: boolean;
}

export interface ProvidersProps {
  activeThemeValue: string;
  children: React.ReactNode;
}

export interface QueryProviderProps {
  children: React.ReactNode;
}

export interface TablePageBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ProfileAvatarProps {
  className?: string;
}

export interface AccountMenuItemsProps {
  userName: string;
  shopName: string;
}

export interface ShellProps {
  children: React.ReactNode;
}
