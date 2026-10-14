'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { OverdraftAlertProps } from '@/types';

export function OverdraftAlert({
  checked,
  onCheckedChange,
  title,
  description,
  confirmLabel,
  variant = 'compact',
  id = 'confirm-overdraft',
  className
}: OverdraftAlertProps) {
  const handleToggle = () => {
    onCheckedChange(!checked);
  };

  const handleCheckboxChange = (value: boolean | 'indeterminate') => {
    onCheckedChange(Boolean(value));
  };

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-2 text-amber-900 dark:text-amber-200',
          className
        )}
      >
        <div className='flex items-start gap-2'>
          <Icons.warning className='h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5' />
          <div className='flex-1'>
            {title && <p className='font-semibold'>{title}</p>}
            {description && <p className='mt-0.5 text-muted-foreground'>{description}</p>}
          </div>
        </div>
        {confirmLabel && (
          <label className='flex cursor-pointer items-center gap-2 pt-1 font-medium'>
            <Checkbox checked={checked} onCheckedChange={handleCheckboxChange} />
            <span>{confirmLabel}</span>
          </label>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleToggle}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 cursor-pointer select-none transition-colors hover:bg-destructive/15',
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className='size-4.5 rounded border-2 border-destructive/70 bg-background shadow-xs mt-0.5 shrink-0 data-checked:bg-destructive data-checked:border-destructive data-checked:text-destructive-foreground'
      />
      <Label
        htmlFor={id}
        onClick={(e) => e.stopPropagation()}
        className='text-xs cursor-pointer leading-normal text-foreground font-normal'
      >
        {title && <span className='font-medium text-destructive block'>{title}</span>}
        {description}
      </Label>
    </div>
  );
}
