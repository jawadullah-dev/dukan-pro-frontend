import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TablePageBodyProps {
  children: ReactNode;
  className?: string;
}

export function TablePageBody({ children, className }: TablePageBodyProps) {
  return <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>{children}</div>;
}
