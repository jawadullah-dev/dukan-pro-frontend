'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { PaymentDTO } from '@/lib/api/types';
import { paymentCancelImpactQueryOptions, paymentKeys } from '../api/queries';
import { cancelPaymentMutation } from '../api/mutations';

interface CancelPaymentDialogProps {
  payment: PaymentDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess
}: CancelPaymentDialogProps) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [overdraftPrompt, setOverdraftPrompt] = useState<{
    shortfall?: number;
    message?: string;
  } | null>(null);

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...paymentCancelImpactQueryOptions(payment.id),
    enabled: open && payment.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelPaymentMutation,
    onSuccess: (res) => {
      if (res && 'confirmOverdraft' in res && res.confirmOverdraft) {
        setOverdraftPrompt({
          shortfall: res.shortfall,
          message: res.message
        });
        setConfirmOverdraft(true);
        toast.warning(res.message || 'Overdraft confirmation required');
        return;
      }

      toast.success('Payment cancelled successfully');
      void qc.invalidateQueries({ queryKey: paymentKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel payment');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Cancellation reason is required');
      return;
    }

    if ((impact?.willCauseOverdraft || !!overdraftPrompt) && !confirmOverdraft) {
      toast.error('Please check the box confirming the negative drawer balance refund');
      return;
    }

    cancel.mutate({
      id: payment.id,
      input: {
        cancelReason: reason.trim(),
        confirmOverdraft: confirmOverdraft || !!overdraftPrompt
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Cancel Payment</DialogTitle>
          <DialogDescription>
            Cancelling this payment will refund {formatPkr(payment.amount)} to{' '}
            {payment.customerName || 'the customer'} and deduct the cash from the drawer.
          </DialogDescription>
        </DialogHeader>

        {impactLoading ? (
          <div className='flex items-center justify-center py-8 text-muted-foreground'>
            <Icons.spinner className='me-2 h-5 w-5 animate-spin' />
            Calculating cancellation impact...
          </div>
        ) : payment.status === 'CANCELLED' || impact?.blocked ? (
          <div className='space-y-4 py-2'>
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive space-y-2'>
              <div className='flex items-center font-semibold gap-2'>
                <Icons.warning className='h-4 w-4' />
                Cancellation Blocked
              </div>
              <p>
                {impact?.blockedReason ||
                  'This payment is already in CANCELLED status and cannot be edited or cancelled again.'}
              </p>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Impact preview */}
            {impact && (
              <div className='rounded-lg border bg-muted/40 p-3 text-xs space-y-2'>
                <p className='font-semibold text-foreground text-sm'>Drawer Impact Preview</p>
                <div className='grid grid-cols-2 gap-2 pt-1 border-t'>
                  <span className='text-muted-foreground'>Current Drawer Cash:</span>
                  <span className='text-end font-medium'>{formatPkr(impact.currentCash)}</span>

                  <span className='text-muted-foreground'>Cash Returned (OUT):</span>
                  <span className='text-end font-medium text-destructive'>
                    -{formatPkr(impact.cashReversedAmount)}
                  </span>

                  <span className='text-muted-foreground'>Drawer Cash After:</span>
                  <span
                    className={`text-end font-semibold ${
                      impact.cashAfter < 0 ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {formatPkr(impact.cashAfter)}
                  </span>

                  {impact.customerUdharAfter != null && (
                    <>
                      <span className='text-muted-foreground'>Customer Udhar After:</span>
                      <span className='text-end font-medium text-amber-600 dark:text-amber-400'>
                        {formatPkr(impact.customerUdharAfter)}
                      </span>
                    </>
                  )}
                </div>

                {impact.willCauseOverdraft && (
                  <div className='mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2'>
                    <Icons.warning className='h-4 w-4 shrink-0 mt-0.5' />
                    <div>
                      <p className='font-semibold'>Cash Drawer Overdraft Warning</p>
                      <p className='text-muted-foreground mt-0.5'>
                        Cancelling this payment will cause the cash drawer to go negative (
                        {formatPkr(impact.cashAfter)}).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reason field */}
            <div className='space-y-1.5'>
              <Label htmlFor='cancel-reason' className='text-xs font-medium text-foreground'>
                Reason for Cancellation <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='cancel-reason'
                placeholder='e.g., Customer paid the wrong bill, duplicate entry'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className='text-sm font-normal text-foreground'
                required
              />
              <div className='flex flex-wrap gap-1.5 pt-1'>
                {['Duplicate entry', 'Wrong amount entered', 'Customer requested'].map((preset) => (
                  <button
                    key={preset}
                    type='button'
                    onClick={() => setReason(preset)}
                    className='rounded-md border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Overdraft confirmation checkbox */}
            {(impact?.willCauseOverdraft || overdraftPrompt) && (
              <div
                onClick={() => setConfirmOverdraft((prev) => !prev)}
                className='flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 cursor-pointer select-none transition-colors hover:bg-destructive/15'
              >
                <Checkbox
                  id='confirm-overdraft'
                  checked={confirmOverdraft}
                  onCheckedChange={(c) => setConfirmOverdraft(Boolean(c))}
                  onClick={(e) => e.stopPropagation()}
                  className='size-4.5 rounded border-2 border-destructive/70 bg-background shadow-xs mt-0.5 shrink-0 data-checked:bg-destructive data-checked:border-destructive data-checked:text-destructive-foreground'
                />
                <Label
                  htmlFor='confirm-overdraft'
                  onClick={(e) => e.stopPropagation()}
                  className='text-xs cursor-pointer leading-normal text-foreground font-normal'
                >
                  I understand the drawer will go into negative balance and confirm this refund.
                </Label>
              </div>
            )}

            <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={cancel.isPending}
              >
                Keep
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={cancel.isPending}
                isLoading={cancel.isPending}
              >
                Confirm
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
