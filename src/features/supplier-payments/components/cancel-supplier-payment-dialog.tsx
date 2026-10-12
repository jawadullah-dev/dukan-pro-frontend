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
import { Icons } from '@/components/icons';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { SupplierPaymentDTO } from '@/types/supplier-payment';
import { supplierPaymentCancelImpactQueryOptions, supplierPaymentKeys } from '../api/queries';
import { cancelSupplierPaymentMutation } from '../api/mutations';

interface CancelSupplierPaymentDialogProps {
  payment: SupplierPaymentDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PRESET_REASONS = [
  'Duplicate payment entry',
  'Paid wrong supplier',
  'Incorrect amount entered',
  'Payment cancelled with supplier agreement'
];

export function CancelSupplierPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess
}: CancelSupplierPaymentDialogProps) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...supplierPaymentCancelImpactQueryOptions(payment.id),
    enabled: open && payment.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelSupplierPaymentMutation,
    onSuccess: () => {
      toast.success('Supplier payment cancelled successfully');
      void qc.invalidateQueries({ queryKey: supplierPaymentKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel supplier payment');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Cancellation reason is required');
      return;
    }

    cancel.mutate({
      id: payment.id,
      input: {
        cancelReason: reason.trim()
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Cancel Supplier Payment</DialogTitle>
          <DialogDescription>
            Cancelling this payment will restore {formatPkr(payment.amount)} to the cash drawer and
            reinstate the supplier payable debt.
          </DialogDescription>
        </DialogHeader>

        {impact?.blocked ? (
          <div className='space-y-4 pt-2'>
            <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive dark:bg-destructive/15'>
              <Icons.close className='size-4 shrink-0 mt-0.5' />
              <div>
                <p className='font-semibold'>Cancellation Blocked</p>
                <p className='mt-0.5 text-muted-foreground'>
                  {impact.blockedReason ||
                    'This supplier payment is already cancelled and cannot be cancelled again.'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='w-full sm:w-auto'
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
            {/* Impact Preview */}
            <div className='rounded-xl border border-border/70 bg-muted/30 p-3 text-xs space-y-2'>
              <div className='flex items-center justify-between text-muted-foreground'>
                <span>Supplier:</span>
                <span className='font-medium text-foreground'>{payment.supplierName || '—'}</span>
              </div>
              <div className='flex items-center justify-between text-muted-foreground'>
                <span>Payment Amount:</span>
                <span className='font-semibold text-foreground'>{formatPkr(payment.amount)}</span>
              </div>
              {payment.purchaseNo && (
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span>Purchase Bill:</span>
                  <span className='font-medium text-foreground'>{payment.purchaseNo}</span>
                </div>
              )}
              {impactLoading ? (
                <div className='flex items-center justify-center gap-2 py-2 text-muted-foreground'>
                  <Icons.spinner className='size-3.5 animate-spin text-primary' />
                  <span>Calculating impact...</span>
                </div>
              ) : impact ? (
                <>
                  <div className='flex items-center justify-between border-t border-border/50 pt-1.5 text-muted-foreground'>
                    <span>Cash Restored (Inflow):</span>
                    <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                      +{formatPkr(impact.cashReversedAmount)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-muted-foreground'>
                    <span>Projected Drawer Cash:</span>
                    <span className='font-medium text-foreground'>
                      {formatPkr(impact.cashAfter)}
                    </span>
                  </div>
                  {impact.supplierPayableAfter !== null &&
                    impact.supplierPayableAfter !== undefined && (
                      <div className='flex items-center justify-between text-muted-foreground'>
                        <span>Supplier Payable After Cancel:</span>
                        <span className='font-semibold text-foreground'>
                          {formatPkr(impact.supplierPayableAfter)}
                        </span>
                      </div>
                    )}
                </>
              ) : null}
            </div>

            {/* Cancellation Reason */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='supplier-cancel-reason'
                  className='text-sm font-normal text-foreground'
                >
                  Cancellation Reason <span className='text-destructive'>*</span>
                </Label>
              </div>

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
                id='supplier-cancel-reason'
                rows={3}
                placeholder='Explain why this payment is being cancelled...'
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
        )}
      </DialogContent>
    </Dialog>
  );
}
