import type * as React from 'react';
import type { Column, Row, Table, Table as TanstackTable } from '@tanstack/react-table';
import type { Icon } from '@/components/icons';

export type StatusTone = 'success' | 'warning' | 'neutral' | 'danger';

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
  tone?: StatusTone;
}

export type ContainerMode = 'list' | 'cards' | 'compact' | 'full';

export interface ContainerModeState {
  width: number | null;
  mode: ContainerMode;
  wideCompact: boolean;
  measured: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
}

export type ColumnSemanticType =
  | 'text'
  | 'id'
  | 'phone'
  | 'money'
  | 'number'
  | 'date'
  | 'status'
  | 'boolean'
  | 'image'
  | 'longtext';

export interface ColumnLayoutMeta {
  id: string;
  type?: ColumnSemanticType;
  priority?: 1 | 2 | 3 | 4;
  primary?: boolean;
  highlight?: boolean;
  mobile?: 'title' | 'subtitle' | 'badge' | 'value' | 'meta' | 'hidden';
  label?: string;
}

export interface ResolvedMobileSlots {
  titleColumnId: string | null;
  subtitleColumnId: string | null;
  badgeColumnId: string | null;
  valueColumnId: string | null;
  metaColumnIds: string[];
  leading: 'avatar' | 'icon' | 'thumbnail' | null;
  imageColumnId: string | null;
  detailOnlyColumnIds: string[];
}

export type TranslateFn = (key: string) => string;

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

export interface LedgerListConfig<TData> {
  getDateKey: (row: TData) => string;
}

export interface ResponsiveDataTableProps<TData> {
  table: TanstackTable<TData>;
  toolbarAction?: React.ReactNode;
  mobileItem?: MobileItemConfig<TData>;
  detail?: DetailConfig<TData> | Partial<DetailConfig<TData>>;
  quickFilters?: QuickFilterChip[];
  ledger?: LedgerListConfig<TData>;
  className?: string;
  isLoading?: boolean;
  rowCount?: number;
}

export interface CompactOrFullTableProps<TData> {
  table: TanstackTable<TData>;
  mode: 'compact' | 'full';
  wideCompact: boolean;
  isLoading?: boolean;
  skeletonRowCount?: number;
  onRowClick?: (row: Row<TData>) => void;
}

export interface DataTableFiltersSheetProps<TData> {
  table: Table<TData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSizeOptions?: number[];
}

export interface FilterBlockProps<TData> {
  column: Column<TData, unknown>;
}

export interface DataTablePaginationProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  variant?: 'compact' | 'full';
}

export interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
  mode: ContainerMode;
  children?: React.ReactNode;
}

export interface DataTableToolbarFilterProps<TData> {
  column: Column<TData, unknown>;
}

export interface GroupedLedgerListProps<TData> {
  table: Table<TData>;
  getDateKey: (row: TData) => string;
  mobileItem: MobileItemConfig<TData>;
  detail: DetailConfig<TData>;
  onNavigate?: (href: string) => void;
}

export interface LoadMoreProps<TData> {
  table: Table<TData>;
  step?: number;
}

export interface MobileListItemProps<TData> {
  row: TData;
  config: MobileItemConfig<TData>;
  onOpen: () => void;
  actionsSlot?: React.ReactNode;
}

export interface MobileListProps<TData> {
  table: Table<TData>;
  mobileItem: MobileItemConfig<TData>;
  detail: DetailConfig<TData>;
  preferNavigate?: boolean;
  isLoading?: boolean;
  skeletonRowCount?: number;
  onNavigate?: (href: string) => void;
}

export interface QuickFilterChipsProps<TData> {
  table: Table<TData>;
  chips: QuickFilterChip[];
  className?: string;
}

export interface RecordDetailProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presentation: 'sheet' | 'side';
  data: TData | null;
  detail: DetailConfig<TData>;
}
