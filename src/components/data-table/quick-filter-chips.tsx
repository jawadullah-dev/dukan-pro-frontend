'use client';

import type { Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { QuickFilterChip } from './types';

interface QuickFilterChipsProps<TData> {
  table: Table<TData>;
  chips: QuickFilterChip[];
  className?: string;
}

/** Horizontally scrollable status chips under search (phones). */
export function QuickFilterChips<TData>({ table, chips, className }: QuickFilterChipsProps<TData>) {
  if (chips.length === 0) return null;

  const activeId = resolveActiveChip(table, chips);
  const t = useTranslations();

  return (
    <div
      className={cn('no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1', className)}
      role='group'
      aria-label={t('table.filters')}
    >
      {chips.map((chip) => {
        const selected = chip.id === activeId;
        return (
          <button
            key={chip.id}
            type='button'
            className={cn(
              'h-9 shrink-0 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            )}
            aria-pressed={selected}
            onClick={() => applyChip(table, chips, chip)}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

function resolveActiveChip<TData>(table: Table<TData>, chips: QuickFilterChip[]): string {
  for (const chip of chips) {
    if (chip.id === 'all' || chip.value == null) continue;
    if (!chip.columnId) continue;
    const current = table.getColumn(chip.columnId)?.getFilterValue();
    if (Array.isArray(chip.value) && Array.isArray(current)) {
      if (chip.value.length === current.length && chip.value.every((v) => current.includes(v))) {
        return chip.id;
      }
    } else if (current === chip.value || (Array.isArray(current) && current[0] === chip.value)) {
      return chip.id;
    }
  }
  return chips.find((c) => c.id === 'all')?.id ?? chips[0]?.id ?? 'all';
}

function applyChip<TData>(table: Table<TData>, chips: QuickFilterChip[], chip: QuickFilterChip) {
  const columnIds = new Set(chips.map((c) => c.columnId).filter((id): id is string => Boolean(id)));

  if (chip.id === 'all' || chip.value == null) {
    for (const id of columnIds) {
      table.getColumn(id)?.setFilterValue(undefined);
    }
    return;
  }

  if (!chip.columnId) return;
  for (const id of columnIds) {
    if (id !== chip.columnId) {
      table.getColumn(id)?.setFilterValue(undefined);
    }
  }
  table.getColumn(chip.columnId)?.setFilterValue(chip.value);
}
