import type { ComponentType } from 'react';

export interface RowAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
}

export interface RowActionsMenuProps {
  actions: RowAction[];
}
