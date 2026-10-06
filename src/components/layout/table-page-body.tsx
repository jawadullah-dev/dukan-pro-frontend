import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Flex fill wrapper for list/table screens so ResponsiveDataTable can
 * claim remaining height and scroll only the rows on phone.
 */
export function TablePageBody({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>{children}</div>;
}
