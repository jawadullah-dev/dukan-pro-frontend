import type { ReactNode } from 'react';

export interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface RootLayoutProps {
  children: ReactNode;
}

export interface LocaleDashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface DashboardLayoutProps {
  children: ReactNode;
}

export interface AreaStatsErrorProps {
  error: Error;
  reset: () => void;
}

export interface BarStatsErrorProps {
  error: Error;
  reset: () => void;
}

export interface PieStatsErrorProps {
  error: Error;
  reset: () => void;
}

export interface SalesErrorProps {
  error: Error;
  reset: () => void;
}

export interface OverviewErrorProps {
  error: Error;
  reset: () => void;
}

export interface OverViewLayoutProps {
  sales: ReactNode;
  pie_stats: ReactNode;
  bar_stats: ReactNode;
  area_stats: ReactNode;
}

export interface PlatformLayoutProps {
  children: ReactNode;
}

export interface LocaleAppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export interface RootPageProps {
  searchParams: Promise<{ to?: string }>;
}

export interface IdPageProps {
  params: Promise<{ id: string }>;
}
