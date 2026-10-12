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
import { formatPkr } from '@/lib/dukaan/numbers';
import type { ExpenseDTO } from '@/types/expense';
import { cancelExpenseMutation } from '../api/mutations';
import { expenseKeys } from '../api/queries';

interface CancelExpenseDialogProps {
  expense: ExpenseDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

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
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const cancel = useMutation({
    ...cancelExpenseMutation,
    onSuccess: () => {
      toast.success('Expense cancelled successfully');
      void qc.invalidateQueries({ queryKey: expenseKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel expense');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Cancellation reason is required');
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
          <DialogTitle>Cancel Expense</DialogTitle>
          <DialogDescription>
            Cancelling this expense will restore {formatPkr(expense.amount)} back to your cash
            drawer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          {/* Summary Box */}
          <div className='rounded-xl border border-border/70 bg-muted/30 p-3 text-xs space-y-1.5'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Category:</span>
              <span className='font-medium text-foreground'>{expense.categoryName}</span>
            </div>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Amount:</span>
              <span className='font-semibold text-foreground'>{formatPkr(expense.amount)}</span>
            </div>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Date:</span>
              <span className='font-medium text-foreground'>
                {expense.expenseDate ? expense.expenseDate.split('T')[0] : '—'}
              </span>
            </div>
            {expense.description && (
              <div className='flex items-center justify-between text-muted-foreground'>
                <span>Description:</span>
                <span className='font-medium text-foreground truncate max-w-[200px]'>
                  {expense.description}
                </span>
              </div>
            )}
            <div className='flex items-center justify-between border-t border-border/50 pt-1.5 text-muted-foreground'>
              <span>Cash Restored:</span>
              <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                +{formatPkr(expense.amount)}
              </span>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className='space-y-2'>
            <Label htmlFor='expense-cancel-reason' className='text-sm font-normal text-foreground'>
              Cancellation Reason <span className='text-destructive'>*</span>
            </Label>

            {/* Preset Reason Chips */}
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
              placeholder='Explain why this expense is being cancelled...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={cancel.isPending}
              className='text-sm font-normal text-foreground'
              required
            />
          </div>

          {/* Footer buttons: Keep and Confirm with icons and gap */}
          <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={cancel.isPending}
              className='gap-1.5'
            >
              <Icons.close className='size-4' />
              Keep
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
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
