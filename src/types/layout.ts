import type * as React from 'react';
import type { SessionRole } from '@/lib/dukaan/session';
import type { InfobarContent } from '@/components/ui/infobar';

export interface BreadcrumbItem {
  title: string;
  link: string;
}

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

export type AppearanceDensity = 'comfortable' | 'compact';
export type AppearanceRadius = 'sharp' | 'medium' | 'round';
export type AppearanceAccent = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
export type AppearanceDigits = 'western' | 'eastern';

export interface AppearanceState {
  density: AppearanceDensity;
  radius: AppearanceRadius;
  accent: AppearanceAccent;
  digits: AppearanceDigits;
  setDensity: (density: AppearanceDensity) => void;
  setRadius: (radius: AppearanceRadius) => void;
  setAccent: (accent: AppearanceAccent) => void;
  setDigits: (digits: AppearanceDigits) => void;
  resetAll: () => void;
}
