import type * as React from 'react';
import type { StatusTone } from './status-badge';
import type { Icon } from '@/components/icons';

export interface MobileBadge {
  label: string;
  tone?: StatusTone;

  status?: string;
}

export interface MobileItemConfig<TData> {
  leading?: 'avatar' | 'icon' | 'thumbnail';
  leadingIcon?: Icon;
  title: (row: TData) => React.ReactNode;
  subtitle?: (row: TData) => React.ReactNode;
  badge?: (row: TData) => MobileBadge | null | undefined;
  value?: (row: TData) => React.ReactNode;
  valueClassName?: (row: TData) => string | undefined;
  valueLabel?: string | ((row: TData) => string | undefined);
  meta?: Array<(row: TData) => React.ReactNode>;
  ariaLabel?: (row: TData) => string;
}

export interface DetailField<TData = unknown> {
  label: string | ((row: TData) => string);
  value: React.ReactNode | ((row: TData) => React.ReactNode);
}

export interface DetailSection {
  title?: string;
  fields: DetailField[];
}

export interface DetailAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

export interface DetailConfig<TData> {
  mode: 'sheet' | 'page';
  href?: (row: TData) => string;
  title: (row: TData) => string;
  badge?: (row: TData) => MobileBadge | null | undefined;
  value?: (row: TData) => React.ReactNode;
  sections: (row: TData) => DetailSection[];
  actions?: (row: TData) => DetailAction[];
}

export interface QuickFilterChip {
  id: string;
  label: string;

  value?: string | string[] | null;
  columnId?: string;
}
