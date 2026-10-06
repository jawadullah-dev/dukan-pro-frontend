'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatLabel } from '@/lib/dukaan/numbers';

export type StatusTone = 'success' | 'warning' | 'neutral' | 'danger';

/** Map domain status strings to a semantic tone (not brand/primary red). */
export function statusTone(status: string): StatusTone {
  const key = status.trim().toUpperCase().replace(/\s+/g, '_');

  if (
    [
      'ACTIVE',
      'PAID',
      'COMPLETED',
      'SUCCESS',
      'APPROVED',
      'RECEIVED',
      'SETTLED',
      'IN_STOCK',
      'INSTOCK'
    ].includes(key)
  ) {
    return 'success';
  }
  if (
    ['PENDING', 'PARTIAL', 'TRIAL', 'PROCESSING', 'DUE', 'LOW', 'LOW_STOCK', 'CREDIT'].includes(key)
  ) {
    return 'warning';
  }
  if (
    [
      'CANCELLED',
      'CANCELED',
      'VOID',
      'OVERDUE',
      'EXPIRED',
      'FAILED',
      'REJECTED',
      'INACTIVE',
      'SUSPENDED',
      'OUT_OF_STOCK',
      'OUTOFSTOCK',
      'DAMAGED'
    ].includes(key)
  ) {
    return 'danger';
  }
  return 'neutral';
}

const toneClass: Record<StatusTone, string> = {
  success: 'border-transparent bg-[var(--status-success-bg)] text-[var(--status-success)]',
  warning: 'border-transparent bg-[var(--status-warning-bg)] text-[var(--status-warning)]',
  neutral: 'border-border bg-muted text-muted-foreground',
  danger: 'border-transparent bg-destructive/15 text-destructive'
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
  tone?: StatusTone;
}

/** Semantic status chip — active/paid = green, cancelled = red, draft = muted. */
export function StatusBadge({ status, label, className, tone }: StatusBadgeProps) {
  const resolved = tone ?? statusTone(status);
  return (
    <Badge variant='outline' className={cn(toneClass[resolved], className)}>
      {label ?? formatLabel(status)}
    </Badge>
  );
}
