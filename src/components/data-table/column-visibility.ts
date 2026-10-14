import type { Column } from '@tanstack/react-table';
import type { ContainerMode } from './types';

export function isColumnVisibleInMode<TData>(
  column: Column<TData, unknown>,
  mode: ContainerMode,
  wideCompact: boolean
): boolean {
  if (column.id === 'actions') return true;
  if (!column.getIsVisible()) return false;

  const priority = column.columnDef.meta?.priority ?? 4;

  if (mode === 'full') return true;
  if (mode === 'list' || mode === 'cards') return false;

  if (priority <= 2) return true;
  if (priority === 3 && wideCompact) return true;
  return false;
}
