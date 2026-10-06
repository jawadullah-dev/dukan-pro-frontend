'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

/**
 * Phone FAB above bottom nav + safe area. Hidden from `sm` up
 * (toolbar button used instead).
 */
export function FloatingActionButton({ label, onClick, className }: FloatingActionButtonProps) {
  return (
    <Button
      type='button'
      size='icon'
      aria-label={label}
      onClick={onClick}
      className={cn(
        'fixed end-4 z-30 size-14 rounded-full shadow-lg',
        'bottom-[calc(3.75rem+env(safe-area-inset-bottom))]',
        'sm:hidden',
        className
      )}
    >
      <Icons.add className='size-6' />
    </Button>
  );
}
