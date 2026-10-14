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
import type { CancelPurchaseDialogProps } from '@/types';
import { purchaseCancelImpactQueryOptions, purchaseKeys } from '../api/queries';
import { cancelPurchaseMutation } from '../api/mutations';

export function CancelPurchaseDialog({
  purchase,
  open,
  onOpenChange,
  onSuccess
}: CancelPurchaseDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...purchaseCancelImpactQueryOptions(purchase.id),
    enabled: open && purchase.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelPurchaseMutation,
    onSuccess: () => {
      toast.success(t('purchases.cancelDialog.success', { purchaseNo: purchase.purchaseNo }));
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('purchases.cancelDialog.failed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('purchases.cancelDialog.reasonRequired'));
      return;
    }

    cancel.mutate({
      id: purchase.id,
      input: {
        cancelReason: reason.trim()
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {t('purchases.cancelDialog.title', { purchaseNo: purchase.purchaseNo })}
          </DialogTitle>
          <DialogDescription>{t('purchases.cancelDialog.description')}</DialogDescription>
        </DialogHeader>

        {impactLoading ? (
          <div className='flex items-center justify-center py-8 text-muted-foreground'>
            <Icons.spinner className='me-2 h-5 w-5 animate-spin' />
            {t('purchases.cancelDialog.calculatingImpact')}
          </div>
        ) : impact?.blocked ? (
          <div className='space-y-4 py-2'>
            <div className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
              <p className='font-semibold'>{t('purchases.cancelDialog.cannotCancel')}</p>
              <p className='mt-1'>
                {impact.blockedReason || t('purchases.cancelDialog.defaultBlockedReason')}
              </p>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                {t('purchases.cancelDialog.close')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4 py-2'>
            <div className='space-y-2 rounded-lg border bg-muted/40 p-3 text-sm'>
              <p className='font-semibold text-foreground'>
                {t('purchases.cancelDialog.previewImpact')}
              </p>

              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('purchases.cancelDialog.cashReturned')}{' '}
                  </span>
                  <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                    +{formatPkr(impact?.cashReversedAmount ?? 0)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('purchases.cancelDialog.cashDrawerAfter')}{' '}
                  </span>
                  <span className='font-medium text-foreground'>
                    {formatPkr(impact?.cashAfter ?? 0)}
                  </span>
                </div>
                {impact?.supplierPayableAfter !== null &&
                  impact?.supplierPayableAfter !== undefined && (
                    <div className='col-span-2'>
                      <span className='text-muted-foreground'>
                        {t('purchases.cancelDialog.supplierPayableAfter')}{' '}
                      </span>
                      <span className='font-medium text-foreground'>
                        {formatPkr(impact.supplierPayableAfter)}
                      </span>
                    </div>
                  )}
              </div>

              {impact?.stockItems && impact.stockItems.length > 0 && (
                <div className='pt-2'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    {t('purchases.cancelDialog.stockReductions')}
                  </p>
                  <ul className='mt-1 space-y-1 text-xs'>
                    {impact.stockItems.map((item, idx) => (
                      <li key={idx} className='flex items-center gap-1.5 text-foreground'>
                        <span className='text-destructive'>{item.quantityChange}</span>
                        <span>{item.productName}</span>
                        {item.imei && (
                          <span className='font-mono text-muted-foreground'>
                            {t('purchases.cancelDialog.imei', { imei: item.imei })}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='purchaseCancelReason'>
                {t('purchases.cancelDialog.reasonLabel')}{' '}
                <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='purchaseCancelReason'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('purchases.cancelDialog.reasonPlaceholder')}
                rows={3}
                required
              />
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                disabled={cancel.isPending}
                onClick={() => onOpenChange(false)}
              >
                {t('purchases.cancelDialog.cancel')}
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={cancel.isPending || !!impact?.blocked}
                isLoading={cancel.isPending}
              >
                {t('purchases.cancelDialog.confirm')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
