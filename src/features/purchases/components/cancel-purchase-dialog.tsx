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
import type { PurchaseDTO } from '@/lib/api/types';
import { purchaseCancelImpactQueryOptions, purchaseKeys } from '../api/queries';
import { cancelPurchaseMutation } from '../api/mutations';

interface CancelPurchaseDialogProps {
  purchase: PurchaseDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelPurchaseDialog({
  purchase,
  open,
  onOpenChange,
  onSuccess
}: CancelPurchaseDialogProps) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...purchaseCancelImpactQueryOptions(purchase.id),
    enabled: open && purchase.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelPurchaseMutation,
    onSuccess: () => {
      toast.success(`Purchase ${purchase.purchaseNo} cancelled successfully`);
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to cancel purchase');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Cancellation reason is required');
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
          <DialogTitle>Cancel Purchase {purchase.purchaseNo}</DialogTitle>
          <DialogDescription>
            Cancelling this purchase will remove received stock from inventory and reverse supplier
            payments.
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
              <p className='font-semibold'>Cannot Cancel Purchase</p>
              <p className='mt-1'>{impact.blockedReason || 'This purchase cannot be cancelled.'}</p>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4 py-2'>
            {/* Impact summary */}
            <div className='space-y-2 rounded-lg border bg-muted/40 p-3 text-sm'>
              <p className='font-semibold text-foreground'>Preview Impact:</p>

              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-muted-foreground'>Cash Returned to Drawer: </span>
                  <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                    +{formatPkr(impact?.cashReversedAmount ?? 0)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>Cash Drawer After: </span>
                  <span className='font-medium text-foreground'>
                    {formatPkr(impact?.cashAfter ?? 0)}
                  </span>
                </div>
                {impact?.supplierPayableAfter !== null &&
                  impact?.supplierPayableAfter !== undefined && (
                    <div className='col-span-2'>
                      <span className='text-muted-foreground'>Supplier Payable After: </span>
                      <span className='font-medium text-foreground'>
                        {formatPkr(impact.supplierPayableAfter)}
                      </span>
                    </div>
                  )}
              </div>

              {impact?.stockItems && impact.stockItems.length > 0 && (
                <div className='pt-2'>
                  <p className='text-xs font-medium text-muted-foreground'>Stock Reductions:</p>
                  <ul className='mt-1 space-y-1 text-xs'>
                    {impact.stockItems.map((item, idx) => (
                      <li key={idx} className='flex items-center gap-1.5 text-foreground'>
                        <span className='text-destructive'>{item.quantityChange}</span>
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

            <div className='space-y-1.5'>
              <Label htmlFor='purchaseCancelReason'>
                Reason for cancellation <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='purchaseCancelReason'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='e.g., Wrong supplier selected, incorrect bill entered'
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
                disabled={cancel.isPending || !!impact?.blocked}
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
