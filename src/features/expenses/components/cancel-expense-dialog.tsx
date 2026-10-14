'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { formatPkr } from '@/lib/dukaan/numbers';
import { formatIsoDate } from '@/lib/dates';
import type { CancelExpenseDialogProps } from '@/types/expense';
import { cancelExpenseMutation } from '../api/mutations';
import { expenseKeys } from '../api/queries';

const PRESET_REASONS = [
  'Duplicate entry',
  'Entered wrong amount',
  'Wrong category selected',
  'Personal expense entered by mistake'
];

export function CancelExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSuccess
}: CancelExpenseDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const cancel = useMutation({
    ...cancelExpenseMutation,
    onSuccess: () => {
      toast.success(t('expenses.cancelSuccess'));
      void qc.invalidateQueries({ queryKey: expenseKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('expenses.cancelFailed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('expenses.cancelReasonRequired'));
      return;
    }

    cancel.mutate({
      id: expense.id,
      input: {
        cancelReason: reason.trim()
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('expenses.cancelTitle')}</DialogTitle>
          <DialogDescription>
            {t('expenses.cancelDescPart1')} {formatPkr(expense.amount)}{' '}
            {t('expenses.cancelDescPart2')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='rounded-xl border border-border/70 bg-muted/30 p-3 text-xs space-y-1.5'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>{t('expenses.categoryLabel')}</span>
              <span className='font-medium text-foreground'>{expense.categoryName}</span>
            </div>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>{t('expenses.amountLabel')}</span>
              <span className='font-semibold text-foreground'>{formatPkr(expense.amount)}</span>
            </div>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>{t('expenses.dateLabel')}</span>
              <span className='font-medium text-foreground'>
                {formatIsoDate(expense.expenseDate)}
              </span>
            </div>
            {expense.description && (
              <div className='flex items-center justify-between text-muted-foreground'>
                <span>{t('expenses.descriptionLabel')}</span>
                <span className='font-medium text-foreground truncate max-w-[200px]'>
                  {expense.description}
                </span>
              </div>
            )}
            <div className='flex items-center justify-between border-t border-border/50 pt-1.5 text-muted-foreground'>
              <span>{t('expenses.cashRestoredLabel')}</span>
              <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                +{formatPkr(expense.amount)}
              </span>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='expense-cancel-reason' className='text-sm font-normal text-foreground'>
              {t('expenses.cancelReason')} <span className='text-destructive'>*</span>
            </Label>

            <div className='flex flex-wrap gap-1.5'>
              {PRESET_REASONS.map((preset) => (
                <button
                  key={preset}
                  type='button'
                  onClick={() => setReason(preset)}
                  className='rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'
                >
                  + {preset}
                </button>
              ))}
            </div>

            <Textarea
              id='expense-cancel-reason'
              rows={3}
              placeholder={t('expenses.cancelReasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={cancel.isPending}
              className='text-sm font-normal text-foreground'
              required
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={cancel.isPending}
              className='gap-1.5'
            >
              <Icons.close className='size-4' />
              {t('expenses.keep')}
            </Button>
            <Button
              type='submit'
              variant='destructive'
              disabled={cancel.isPending}
              className='gap-1.5'
            >
              {cancel.isPending ? (
                <Icons.spinner className='size-4 animate-spin' />
              ) : (
                <Icons.check className='size-4' />
              )}
              {t('expenses.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
