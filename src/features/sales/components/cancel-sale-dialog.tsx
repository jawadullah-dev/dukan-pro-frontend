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
import type { SaleDTO } from '@/lib/api/types';
import { cancelImpactQueryOptions, saleKeys } from '../api/queries';
import { cancelSaleMutation } from '../api/mutations';

interface CancelSaleDialogProps {
  sale: SaleDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelSaleDialog({ sale, open, onOpenChange, onSuccess }: CancelSaleDialogProps) {
  const qc = useQueryClient();
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
        toast.warning(res.message || 'Overdraft confirmation required');
        return;
      }

      toast.success(`Sale ${sale.saleNo} cancelled successfully`);
      void qc.invalidateQueries({ queryKey: saleKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel sale');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Cancellation reason is required');
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
          <DialogTitle>Cancel Sale {sale.saleNo}</DialogTitle>
          <DialogDescription>
            Cancelling this sale will restore stock and reverse recorded cash payments.
          </DialogDescription>
        </DialogHeader>

        {impactLoading ? (
          <div className='flex items-center justify-center py-8 text-muted-foreground'>
            <Icons.spinner className='me-2 h-5 w-5 animate-spin' />
            Calculating cancellation impact...
          </div>
        ) : impact?.blocked ? (
          <div className='space-y-4 py-2'>
            <div className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
              <p className='font-semibold'>Cannot Cancel Sale</p>
              <p className='mt-1'>{impact.blockedReason || 'This sale cannot be cancelled.'}</p>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4 py-2'>
            <div className='space-y-2 rounded-lg border bg-muted/40 p-3 text-sm'>
              <p className='font-semibold text-foreground'>Preview Impact:</p>

              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-muted-foreground'>Cash Reversal: </span>
                  <span className='font-medium text-destructive'>
                    -{formatPkr(impact?.cashReversedAmount ?? 0)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Cash After: </span>
                  <span className='font-medium text-foreground'>
                    {formatPkr(impact?.cashAfter ?? 0)}
                  </span>
                </div>
                {impact?.customerUdharAfter !== null &&
                  impact?.customerUdharAfter !== undefined && (
                    <div className='col-span-2'>
                      <span className='text-muted-foreground'>Customer Udhar After: </span>
                      <span className='font-medium text-foreground'>
                        {formatPkr(impact.customerUdharAfter)}
                      </span>
                    </div>
                  )}
              </div>

              {impact?.stockItems && impact.stockItems.length > 0 && (
                <div className='pt-2'>
                  <p className='text-xs font-medium text-muted-foreground'>Stock Restorations:</p>
                  <ul className='mt-1 space-y-1 text-xs'>
                    {impact.stockItems.map((item, idx) => (
                      <li key={idx} className='flex items-center gap-1.5 text-foreground'>
                        <span className='text-emerald-600 dark:text-emerald-400'>
                          +{item.quantityChange}
                        </span>
                        <span>{item.productName}</span>
                        {item.imei && (
                          <span className='font-mono text-muted-foreground'>
                            (IMEI: {item.imei})
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
                    <p className='font-semibold'>Cash Overdraft Warning</p>
                    <p className='mt-0.5 text-xs'>
                      {overdraftPrompt?.message ||
                        'Reversing this payment will take your drawer cash below zero.'}
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
                    Confirm and proceed with cash overdraft
                  </Label>
                </div>
              </div>
            )}

            <div className='space-y-1.5'>
              <Label htmlFor='cancelReason'>
                Reason for cancellation <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='cancelReason'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='e.g., Wrong items recorded, customer changed mind'
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
                Cancel
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
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
