import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

function Input({ className, type, onClick, ...props }: React.ComponentProps<'input'>) {
  const isDateOrTime = type === 'date' || type === 'time' || type === 'datetime-local';

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (isDateOrTime) {
      try {
        e.currentTarget.showPicker?.();
      } catch {
        // Ignored if already open or unsupported
      }
    }
    onClick?.(e);
  };

  return (
    <InputPrimitive
      type={type}
      data-slot='input'
      // Password managers / form fillers inject attrs (e.g. fdprocessedid) before hydrate.
      suppressHydrationWarning
      onClick={handleClick}
      className={cn(
        'h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-0 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-0 sm:h-8 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50',
        isDateOrTime &&
          'cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80 hover:[&::-webkit-calendar-picker-indicator]:opacity-100',
        className
      )}
      {...props}
    />
  );
}

export { Input };
