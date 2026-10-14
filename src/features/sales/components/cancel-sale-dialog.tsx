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
import { useT } from '@/i18n/use-t';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { CancelSaleDialogProps } from '@/types/sales';
import { cancelImpactQueryOptions, saleKeys } from '../api/queries';
import { cancelSaleMutation } from '../api/mutations';

export function CancelSaleDialog({ sale, open, onOpenChange, onSuccess }: CancelSaleDialogProps) {
  const qc = useQueryClient();
  const t = useT();
  const [reason, setReason] = useState('');
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [overdraftPrompt, setOverdraftPrompt] = useState<{
    shortfall?: number;
    message?: string;
  } | null>(null);

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...cancelImpactQueryOptions(sale.id),
    enabled: open && sale.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelSaleMutation,
    onSuccess: (res) => {
      if (res && 'confirmOverdraft' in res && res.confirmOverdraft) {
        setOverdraftPrompt({
          shortfall: res.shortfall,
          message: res.message
        });
        setConfirmOverdraft(true);
        toast.warning(res.message || t('sales.cancelDialog.overdraftRequired'));
        return;
      }

      toast.success(t('sales.cancelDialog.success', { saleNo: sale.saleNo }));
      void qc.invalidateQueries({ queryKey: saleKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('sales.cancelDialog.failed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('sales.cancelDialog.reasonRequired'));
      return;
    }

    cancel.mutate({
      id: sale.id,
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
          <DialogTitle>
            {t('sales.cancelDialog.title')} {sale.saleNo}
          </DialogTitle>
          <DialogDescription>{t('sales.cancelDialog.description')}</DialogDescription>
        </DialogHeader>

        {impactLoading ? (
          <div className='flex items-center justify-center py-8 text-muted-foreground'>
            <Icons.spinner className='me-2 h-5 w-5 animate-spin' />
            {t('sales.cancelDialog.calculatingImpact')}
          </div>
        ) : impact?.blocked ? (
          <div className='space-y-4 py-2'>
            <div className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
              <p className='font-semibold'>{t('sales.cancelDialog.cannotCancel')}</p>
              <p className='mt-1'>
                {impact.blockedReason || t('purchases.cancelDialog.defaultBlockedReason')}
              </p>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                {t('sales.cancelDialog.close')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4 py-2'>
            <div className='space-y-2 rounded-lg border bg-muted/40 p-3 text-sm'>
              <p className='font-semibold text-foreground'>
                {t('sales.cancelDialog.previewImpact')}
              </p>

              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('sales.cancelDialog.cashReversal')}{' '}
                  </span>
                  <span className='font-medium text-destructive'>
                    -{formatPkr(impact?.cashReversedAmount ?? 0)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('sales.cancelDialog.cashAfter')}{' '}
                  </span>
                  <span className='font-medium text-foreground'>
                    {formatPkr(impact?.cashAfter ?? 0)}
                  </span>
                </div>
                {impact?.customerUdharAfter !== null &&
                  impact?.customerUdharAfter !== undefined && (
                    <div className='col-span-2'>
                      <span className='text-muted-foreground'>
                        {t('sales.cancelDialog.customerUdharAfter')}{' '}
                      </span>
                      <span className='font-medium text-foreground'>
                        {formatPkr(impact.customerUdharAfter)}
                      </span>
                    </div>
                  )}
              </div>

              {impact?.stockItems && impact.stockItems.length > 0 && (
                <div className='pt-2'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    {t('sales.cancelDialog.stockRestorations')}
                  </p>
                  <ul className='mt-1 space-y-1 text-xs'>
                    {impact.stockItems.map((item, idx) => (
                      <li key={idx} className='flex items-center gap-1.5 text-foreground'>
                        <span className='text-emerald-600 dark:text-emerald-400'>
                          +{item.quantityChange}
                        </span>
                        <span>{item.productName}</span>
                        {item.imei && (
                          <span className='font-mono text-muted-foreground'>
                            {t('sales.cancelDialog.imei', { imei: item.imei })}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {(impact?.willCauseOverdraft || overdraftPrompt) && (
              <div className='space-y-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200'>
                <div className='flex items-start gap-2'>
                  <Icons.warning className='mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
                  <div>
                    <p className='font-semibold'>{t('sales.cancelDialog.overdraftWarning')}</p>
                    <p className='mt-0.5 text-xs'>
                      {overdraftPrompt?.message || t('dukaan.actions.cashBelowZeroWarning')}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-2 pt-1'>
                  <Checkbox
                    id='overdraft'
                    checked={confirmOverdraft}
                    onCheckedChange={(checked) => setConfirmOverdraft(Boolean(checked))}
                  />
                  <Label htmlFor='overdraft' className='text-xs font-normal cursor-pointer'>
                    {t('sales.cancelDialog.confirmOverdraft')}
                  </Label>
                </div>
              </div>
            )}

            <div className='space-y-1.5'>
              <Label htmlFor='cancelReason'>
                {t('sales.cancelDialog.reasonLabel')} <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='cancelReason'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('sales.cancelDialog.reasonPlaceholder')}
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
                {t('common.cancel')}
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={
                  cancel.isPending ||
                  ((impact?.willCauseOverdraft || !!overdraftPrompt) && !confirmOverdraft)
                }
                isLoading={cancel.isPending}
              >
                {t('sales.cancelDialog.confirm')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
