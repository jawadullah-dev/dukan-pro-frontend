'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/data-table';
import { formatPkr } from '@/lib/dukaan/numbers';
import { formatIsoDate } from '@/lib/dates';
import { useT } from '@/i18n/use-t';
import type { ExpenseDetailSheetProps } from '@/types/expense';

export function ExpenseDetailSheet({
  expense,
  open,
  onOpenChange,
  onCancelClick
}: ExpenseDetailSheetProps) {
  const t = useT();
  if (!expense) return null;

  const isCancelled = expense.status === 'CANCELLED';

  const handleCancel = () => {
    onOpenChange(false);
    onCancelClick?.(expense);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col gap-6 sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <div className='flex items-center justify-between pe-6'>
            <SheetTitle className='text-lg font-semibold'>{expense.categoryName}</SheetTitle>
            <StatusBadge status={expense.status} />
          </div>
          <SheetDescription className='text-xs'>{t('expenses.detailTitle')}</SheetDescription>
        </SheetHeader>

        <div className='rounded-xl border border-border/70 bg-muted/40 p-4 text-center'>
          <span className='text-xs font-normal text-muted-foreground'>
            {t('expenses.expenseAmount')}
          </span>
          <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>
            {formatPkr(expense.amount)}
          </p>
          <span className='mt-1 inline-block text-xs text-muted-foreground'>
            {formatIsoDate(expense.expenseDate)}
          </span>
        </div>

        <div className='space-y-3 divide-y divide-border/60 text-sm'>
          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>{t('expenses.category')}</span>
            <span className='font-medium text-foreground'>{expense.categoryName}</span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>{t('expenses.expenseDate')}</span>
            <span className='font-medium text-foreground'>
              {formatIsoDate(expense.expenseDate)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>{t('expenses.status')}</span>
            <span>
              <StatusBadge status={expense.status} />
            </span>
          </div>

          {expense.description && (
            <div className='py-2'>
              <span className='text-muted-foreground block text-xs mb-1'>
                {t('expenses.description')}
              </span>
              <p className='rounded-md bg-muted/50 p-2 text-xs font-medium text-foreground whitespace-pre-wrap'>
                {expense.description}
              </p>
            </div>
          )}

          {isCancelled && (
            <div className='space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs'>
              <div className='flex items-center gap-1.5 font-semibold text-destructive'>
                <Icons.warning className='size-3.5' />
                <span>{t('expenses.cancelledTitle')}</span>
              </div>
              {expense.cancelReason && (
                <p className='text-muted-foreground'>
                  <span className='font-medium text-foreground'>{t('expenses.reasonLabel')} </span>
                  {expense.cancelReason}
                </p>
              )}
              {expense.cancelledAt && (
                <p className='text-muted-foreground text-[11px]'>
                  {t('expenses.cancelledAtLabel')} {new Date(expense.cancelledAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {!isCancelled && onCancelClick && (
          <div className='mt-auto pt-4'>
            <Button
              type='button'
              variant='outline'
              className='w-full text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={handleCancel}
            >
              <Icons.close className='me-2 size-4' />
              {t('expenses.cancelAction')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
