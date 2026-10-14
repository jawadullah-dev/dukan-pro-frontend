'use client';

import type * as React from 'react';
import type { Column, ColumnDef, Table } from '@tanstack/react-table';
import { formatLabel, formatPkr } from '@/lib/dukaan/numbers';
import { StatusBadge } from './status-badge';
import { resolveMobileSlots } from './resolve-mobile-item';
import type {
  DetailConfig,
  DetailSection,
  MobileItemConfig,
  TranslateFn,
  ColumnLayoutMeta,
  ColumnSemanticType
} from './types';
import { env } from '@/config/env';

function metaOf<TData>(col: Column<TData, unknown>): ColumnLayoutMeta {
  const m = col.columnDef.meta ?? {};
  return {
    id: col.id,
    type: m.type as ColumnSemanticType | undefined,
    priority: m.priority,
    primary: m.primary,
    highlight: m.highlight,
    mobile: m.mobile,
    label: m.label
  };
}

function readValue<TData>(row: TData, columnDef: ColumnDef<TData, unknown>): unknown {
  if ('accessorKey' in columnDef && typeof columnDef.accessorKey === 'string') {
    return (row as Record<string, unknown>)[columnDef.accessorKey];
  }
  if ('accessorFn' in columnDef && typeof columnDef.accessorFn === 'function') {
    return columnDef.accessorFn(row, 0);
  }
  return undefined;
}

function formatByType(value: unknown, type?: ColumnSemanticType, t?: TranslateFn): React.ReactNode {
  if (value == null || value === '') return '—';
  switch (type) {
    case 'money':
      return formatPkr(Number(value));
    case 'boolean':
      return t
        ? value
          ? t('status.active')
          : t('status.inactive')
        : value
          ? 'Active'
          : 'Inactive';
    case 'status':
      return formatLabel(String(value));
    case 'number':
      return String(value);
    default:
      return String(value);
  }
}

function columnById<TData>(table: Table<TData>, id: string | null): Column<TData, unknown> | null {
  if (!id) return null;
  return table.getColumn(id) ?? null;
}

export function buildMobileItemFromTable<TData>(
  table: Table<TData>,
  t?: TranslateFn
): MobileItemConfig<TData> {
  const layouts = table.getAllColumns().map(metaOf);
  const slots = resolveMobileSlots(layouts);

  return {
    leading: slots.leading ?? 'icon',
    title: (row) => {
      const col = columnById(table, slots.titleColumnId);
      if (!col) return '—';
      return formatByType(readValue(row, col.columnDef), col.columnDef.meta?.type, t);
    },
    subtitle: slots.subtitleColumnId
      ? (row) => {
          const col = columnById(table, slots.subtitleColumnId);
          if (!col) return null;
          return formatByType(readValue(row, col.columnDef), col.columnDef.meta?.type, t);
        }
      : undefined,
    badge: slots.badgeColumnId
      ? (row) => {
          const col = columnById(table, slots.badgeColumnId);
          if (!col) return null;
          const raw = readValue(row, col.columnDef);
          if (raw == null || raw === '') return null;
          if (typeof raw === 'boolean') {
            return {
              label: t
                ? raw
                  ? t('status.active')
                  : t('status.inactive')
                : raw
                  ? 'Active'
                  : 'Inactive',
              status: raw ? 'ACTIVE' : 'INACTIVE',
              tone: raw ? ('success' as const) : ('neutral' as const)
            };
          }
          const label = formatLabel(String(raw));
          return { label, status: String(raw) };
        }
      : undefined,
    value: slots.valueColumnId
      ? (row) => {
          const col = columnById(table, slots.valueColumnId);
          if (!col) return null;
          return formatByType(
            readValue(row, col.columnDef),
            col.columnDef.meta?.type ?? 'money',
            t
          );
        }
      : undefined,
    valueLabel: slots.valueColumnId
      ? () => columnById(table, slots.valueColumnId)?.columnDef.meta?.label
      : undefined,
    meta: slots.metaColumnIds.map((id) => (row: TData) => {
      const col = columnById(table, id);
      if (!col) return null;
      return formatByType(readValue(row, col.columnDef), col.columnDef.meta?.type, t);
    }),
    ariaLabel: (row) => {
      const col = columnById(table, slots.titleColumnId);
      const title = col ? String(readValue(row, col.columnDef) ?? '') : '';
      return title || (t ? t('table.row') : 'Row');
    }
  };
}

export function buildDetailFromTable<TData>(
  table: Table<TData>,
  overrides?: Partial<DetailConfig<TData>>,
  t?: TranslateFn
): DetailConfig<TData> {
  const mobile = buildMobileItemFromTable(table, t);
  const columns = table
    .getAllColumns()
    .filter(
      (c) => c.id !== 'actions' && c.id !== 'select' && c.columnDef.meta?.mobile !== 'hidden'
    );

  return {
    mode: overrides?.mode ?? 'sheet',
    href: overrides?.href,
    title: overrides?.title ?? ((row) => String(mobile.title(row) ?? '—')),
    badge: overrides?.badge ?? mobile.badge,
    value: overrides?.value ?? mobile.value,
    sections:
      overrides?.sections ??
      ((row) => {
        const fields = columns.map((col) => {
          const type = col.columnDef.meta?.type;
          const raw = readValue(row, col.columnDef);
          let value: React.ReactNode = formatByType(raw, type, t);
          if (type === 'status' && raw != null) {
            value = <StatusBadge status={String(raw)} />;
          } else if (type === 'phone' && raw) {
            const phone = String(raw);
            value = (
              <a className='text-primary underline-offset-2 hover:underline' href={`tel:${phone}`}>
                {phone}
              </a>
            );
          } else if (type === 'boolean') {
            value = (
              <StatusBadge
                status={raw ? 'ACTIVE' : 'INACTIVE'}
                label={
                  t
                    ? raw
                      ? t('status.active')
                      : t('status.inactive')
                    : raw
                      ? 'Active'
                      : 'Inactive'
                }
                tone={raw ? 'success' : 'neutral'}
              />
            );
          }
          return {
            label: col.columnDef.meta?.label ?? formatLabel(col.id),
            value
          };
        });
        const section: DetailSection = { title: t ? t('table.details') : 'Details', fields };
        return [section];
      }),
    actions: overrides?.actions
  };
}
