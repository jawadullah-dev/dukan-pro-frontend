'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/data-table';
import { Icons } from '@/components/icons';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { PaymentDTO } from '@/lib/api/types';

interface PaymentDetailSheetProps {
  payment: PaymentDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelClick?: (payment: PaymentDTO) => void;
}

export function PaymentDetailSheet({
  payment,
  open,
  onOpenChange,
  onCancelClick
}: PaymentDetailSheetProps) {
  if (!payment) return null;

  const isCancelled = payment.status === 'CANCELLED';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-md'>
        <SheetHeader className='border-b pb-4'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='text-base font-semibold'>Payment Details</SheetTitle>
            <StatusBadge status={payment.status} label={isCancelled ? 'Cancelled' : 'Active'} />
          </div>
          <SheetDescription className='text-xs'>
            Payment recorded on {payment.paymentDate ? payment.paymentDate.split('T')[0] : '—'}
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-4 py-4 text-xs'>
          {/* Main Amount Card */}
          <div className='rounded-lg border bg-muted/40 p-4 text-center'>
            <span className='text-muted-foreground'>Amount Received</span>
            <p className='text-2xl font-bold text-foreground mt-1'>{formatPkr(payment.amount)}</p>
          </div>

          {/* Details Grid */}
          <div className='rounded-lg border divide-y'>
            <div className='flex justify-between p-3'>
              <span className='text-muted-foreground'>Customer</span>
              <span className='font-medium text-foreground'>
                {payment.customerName || 'Walk-in'}
              </span>
            </div>

            <div className='flex justify-between p-3'>
              <span className='text-muted-foreground'>Applied To</span>
              <span className='font-medium text-foreground'>
                {payment.saleNo ? `Sale #${payment.saleNo}` : 'Old Udhar / Opening Balance'}
              </span>
            </div>

            <div className='flex justify-between p-3'>
              <span className='text-muted-foreground'>Payment Date</span>
              <span className='font-medium text-foreground'>
                {payment.paymentDate ? payment.paymentDate.split('T')[0] : '—'}
              </span>
            </div>

            <div className='flex justify-between p-3'>
              <span className='text-muted-foreground'>Method</span>
              <span className='font-medium text-foreground'>{payment.method || 'Cash'}</span>
            </div>

            {payment.receiptGroupId && (
              <div className='flex justify-between p-3'>
                <span className='text-muted-foreground'>Receipt Group</span>
                <span className='font-mono text-muted-foreground'>
                  {payment.receiptGroupId.slice(0, 12)}…
                </span>
              </div>
            )}

            {payment.notes && (
              <div className='p-3 space-y-1'>
                <span className='text-muted-foreground block'>Notes</span>
                <p className='font-medium text-foreground whitespace-pre-wrap'>{payment.notes}</p>
              </div>
            )}
          </div>

          {/* Cancelled Info */}
          {isCancelled && (
            <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 space-y-1.5'>
              <div className='flex items-center gap-1.5 text-destructive font-semibold'>
                <Icons.trash className='h-4 w-4' />
                Cancelled Payment
              </div>
              {payment.cancelReason && (
                <p className='text-destructive'>Reason: {payment.cancelReason}</p>
              )}
              {payment.cancelledAt && (
                <p className='text-muted-foreground text-[11px]'>
                  Cancelled on: {payment.cancelledAt.split('T')[0]}
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          {!isCancelled && onCancelClick && (
            <div className='pt-2'>
              <Button
                variant='destructive'
                className='w-full'
                onClick={() => {
                  onOpenChange(false);
                  onCancelClick(payment);
                }}
              >
                <Icons.trash className='me-2 h-4 w-4' />
                Cancel Payment
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
