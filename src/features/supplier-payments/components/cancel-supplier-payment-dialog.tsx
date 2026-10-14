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
import { useT } from '@/i18n/use-t';
import type { CancelSupplierPaymentDialogProps } from '@/types/supplier-payment';
import { supplierPaymentCancelImpactQueryOptions, supplierPaymentKeys } from '../api/queries';
import { cancelSupplierPaymentMutation } from '../api/mutations';

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
  const t = useT();
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...supplierPaymentCancelImpactQueryOptions(payment.id),
    enabled: open && payment.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelSupplierPaymentMutation,
    onSuccess: () => {
      toast.success(t('supplierPayments.cancelSuccess'));
      void qc.invalidateQueries({ queryKey: supplierPaymentKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('supplierPayments.cancelFailed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('supplierPayments.reasonRequired'));
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
          <DialogTitle>{t('supplierPayments.cancelTitle')}</DialogTitle>
          <DialogDescription>
            {t('supplierPayments.cancelDesc', { amount: formatPkr(payment.amount) })}
          </DialogDescription>
        </DialogHeader>

        {impact?.blocked ? (
          <div className='space-y-4 pt-2'>
            <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive dark:bg-destructive/15'>
              <Icons.close className='size-4 shrink-0 mt-0.5' />
              <div>
                <p className='font-semibold'>{t('supplierPayments.cancellationBlocked')}</p>
                <p className='mt-0.5 text-muted-foreground'>
                  {impact.blockedReason || t('supplierPayments.defaultBlockedReason')}
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
                {t('common.close')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
            <div className='rounded-xl border border-border/70 bg-muted/30 p-3 text-xs space-y-2'>
              <div className='flex items-center justify-between text-muted-foreground'>
                <span>{t('supplierPayments.supplierLabel')}</span>
                <span className='font-medium text-foreground'>{payment.supplierName || '—'}</span>
              </div>
              <div className='flex items-center justify-between text-muted-foreground'>
                <span>{t('supplierPayments.paymentAmountLabel')}</span>
                <span className='font-semibold text-foreground'>{formatPkr(payment.amount)}</span>
              </div>
              {payment.purchaseNo && (
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span>{t('supplierPayments.purchaseBillLabel')}</span>
                  <span className='font-medium text-foreground'>{payment.purchaseNo}</span>
                </div>
              )}
              {impactLoading ? (
                <div className='flex items-center justify-center gap-2 py-2 text-muted-foreground'>
                  <Icons.spinner className='size-3.5 animate-spin text-primary' />
                  <span>{t('supplierPayments.calculatingImpact')}</span>
                </div>
              ) : impact ? (
                <>
                  <div className='flex items-center justify-between border-t border-border/50 pt-1.5 text-muted-foreground'>
                    <span>{t('supplierPayments.cashRestoredInflow')}</span>
                    <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                      +{formatPkr(impact.cashReversedAmount)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-muted-foreground'>
                    <span>{t('supplierPayments.projectedDrawerCash')}</span>
                    <span className='font-medium text-foreground'>
                      {formatPkr(impact.cashAfter)}
                    </span>
                  </div>
                  {impact.supplierPayableAfter !== null &&
                    impact.supplierPayableAfter !== undefined && (
                      <div className='flex items-center justify-between text-muted-foreground'>
                        <span>{t('supplierPayments.payableAfterCancel')}</span>
                        <span className='font-semibold text-foreground'>
                          {formatPkr(impact.supplierPayableAfter)}
                        </span>
                      </div>
                    )}
                </>
              ) : null}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='supplier-cancel-reason'
                  className='text-sm font-normal text-foreground'
                >
                  {t('supplierPayments.cancelReason')} <span className='text-destructive'>*</span>
                </Label>
              </div>

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
                placeholder={t('supplierPayments.cancelReasonPlaceholder')}
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
                {t('supplierPayments.keep')}
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
                {t('supplierPayments.confirm')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
