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
import { useT } from '@/i18n/use-t';
import type { CancelPaymentDialogProps } from '@/types/payment';
import { paymentCancelImpactQueryOptions, paymentKeys } from '../api/queries';
import { cancelPaymentMutation } from '../api/mutations';

const PRESET_REASONS = [
  { key: 'payments.presetDuplicate' },
  { key: 'payments.presetWrongAmount' },
  { key: 'payments.presetCustomerRequested' }
] as const;

export function CancelPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess
}: CancelPaymentDialogProps) {
  const t = useT();
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
        toast.warning(res.message || t('payments.overdraftConfirmationRequired'));
        return;
      }

      toast.success(t('payments.cancelSuccess'));
      void qc.invalidateQueries({ queryKey: paymentKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('payments.cancelFailed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('payments.reasonRequired'));
      return;
    }

    if ((impact?.willCauseOverdraft || !!overdraftPrompt) && !confirmOverdraft) {
      toast.error(t('payments.confirmOverdraftRequired'));
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
          <DialogTitle>{t('payments.cancelTitle')}</DialogTitle>
          <DialogDescription>
            {t('payments.cancelDesc', {
              amount: formatPkr(payment.amount),
              customer: payment.customerName || t('payments.defaultCustomer')
            })}
          </DialogDescription>
        </DialogHeader>

        {impactLoading ? (
          <div className='flex items-center justify-center py-8 text-muted-foreground'>
            <Icons.spinner className='me-2 h-5 w-5 animate-spin' />
            {t('payments.calculatingImpact')}
          </div>
        ) : payment.status === 'CANCELLED' || impact?.blocked ? (
          <div className='space-y-4 py-2'>
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive space-y-2'>
              <div className='flex items-center font-semibold gap-2'>
                <Icons.warning className='h-4 w-4' />
                {t('payments.cancellationBlocked')}
              </div>
              <p>{impact?.blockedReason || t('payments.defaultBlockedReason')}</p>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                {t('common.close')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {impact && (
              <div className='rounded-lg border bg-muted/40 p-3 text-xs space-y-2'>
                <p className='font-semibold text-foreground text-sm'>
                  {t('payments.drawerImpactPreview')}
                </p>
                <div className='grid grid-cols-2 gap-2 pt-1 border-t'>
                  <span className='text-muted-foreground'>{t('payments.currentDrawerCash')}</span>
                  <span className='text-end font-medium'>{formatPkr(impact.currentCash)}</span>

                  <span className='text-muted-foreground'>{t('payments.cashReturnedOut')}</span>
                  <span className='text-end font-medium text-destructive'>
                    -{formatPkr(impact.cashReversedAmount)}
                  </span>

                  <span className='text-muted-foreground'>{t('payments.drawerCashAfter')}</span>
                  <span
                    className={`text-end font-semibold ${
                      impact.cashAfter < 0 ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {formatPkr(impact.cashAfter)}
                  </span>

                  {impact.customerUdharAfter != null && (
                    <>
                      <span className='text-muted-foreground'>
                        {t('payments.customerUdharAfter')}
                      </span>
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
                      <p className='font-semibold'>{t('payments.drawerOverdraftWarning')}</p>
                      <p className='text-muted-foreground mt-0.5'>
                        {t('payments.drawerOverdraftDesc', { amount: formatPkr(impact.cashAfter) })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className='space-y-1.5'>
              <Label htmlFor='cancel-reason' className='text-xs font-medium text-foreground'>
                {t('payments.reasonForCancellation')} <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='cancel-reason'
                placeholder={t('payments.cancelReasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className='text-sm font-normal text-foreground'
                required
              />
              <div className='flex flex-wrap gap-1.5 pt-1'>
                {PRESET_REASONS.map((preset) => (
                  <button
                    key={preset.key}
                    type='button'
                    onClick={() => setReason(t(preset.key))}
                    className='rounded-md border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                  >
                    + {t(preset.key)}
                  </button>
                ))}
              </div>
            </div>

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
                  {t('payments.confirmNegativeDrawer')}
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
                {t('payments.keep')}
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={cancel.isPending}
                isLoading={cancel.isPending}
              >
                {t('payments.confirm')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
