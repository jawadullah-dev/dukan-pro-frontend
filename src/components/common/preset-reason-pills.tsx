'use client';

import { cn } from '@/lib/utils';
import type { PresetReasonPillsProps } from '@/types';

export function PresetReasonPills({ reasons, onSelect, className }: PresetReasonPillsProps) {
  const handleSelect = (reason: string) => {
    onSelect(reason);
  };

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {reasons.map((reason) => (
        <button
          key={reason}
          type='button'
          onClick={() => handleSelect(reason)}
          className='rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
        >
          + {reason}
        </button>
      ))}
    </div>
  );
}
