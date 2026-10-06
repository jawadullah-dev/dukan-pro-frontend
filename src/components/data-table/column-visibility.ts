import type { Column, Table } from '@tanstack/react-table';
import type { ContainerMode } from './use-container-mode';

/** Whether a column should render in the current container mode. */
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

  // compact
  if (priority <= 2) return true;
  if (priority === 3 && wideCompact) return true;
  return false;
}

export function visibleColumnsForMode<TData>(
  table: Table<TData>,
  mode: ContainerMode,
  wideCompact: boolean
): Column<TData, unknown>[] {
  return table
    .getAllLeafColumns()
    .filter((column) => isColumnVisibleInMode(column, mode, wideCompact));
}

export function getMobileRole<TData>(column: Column<TData, unknown>) {
  return column.columnDef.meta?.mobile ?? 'hidden';
}
