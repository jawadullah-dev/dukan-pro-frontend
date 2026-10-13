'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/data-table';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { SupplierPaymentDTO } from '@/types/supplier-payment';

interface SupplierPaymentDetailSheetProps {
  payment: SupplierPaymentDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelClick?: (payment: SupplierPaymentDTO) => void;
}

export function SupplierPaymentDetailSheet({
  payment,
  open,
  onOpenChange,
  onCancelClick
}: SupplierPaymentDetailSheetProps) {
  if (!payment) return null;

  const isCancelled = payment.status === 'CANCELLED';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col gap-6 sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <div className='flex items-center justify-between pe-6'>
            <SheetTitle className='text-lg font-semibold'>
              {payment.supplierName || 'Supplier Payment'}
            </SheetTitle>
            <StatusBadge status={payment.status} />
          </div>
          <SheetDescription className='text-xs'>
            Recorded payment transaction details
          </SheetDescription>
        </SheetHeader>

        <div className='rounded-xl border border-border/70 bg-muted/40 p-4 text-center'>
          <span className='text-xs font-normal text-muted-foreground'>Payment Amount</span>
          <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>
            {formatPkr(payment.amount)}
          </p>
          <span className='mt-1 inline-block text-xs text-muted-foreground'>
            {payment.paymentDate ? payment.paymentDate.split('T')[0] : '—'}
          </span>
        </div>

        <div className='space-y-3 divide-y divide-border/60 text-sm'>
          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>Supplier</span>
            <span className='font-medium text-foreground'>{payment.supplierName || '—'}</span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>Applied To</span>
            <span className='font-medium text-foreground'>
              {payment.purchaseNo ? `Purchase #${payment.purchaseNo}` : 'Opening Balance'}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>Payment Date</span>
            <span className='font-medium text-foreground'>
              {payment.paymentDate ? payment.paymentDate.split('T')[0] : '—'}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>Status</span>
            <span>
              <StatusBadge status={payment.status} />
            </span>
          </div>

          {payment.notes && (
            <div className='py-2'>
              <span className='text-muted-foreground block text-xs mb-1'>Notes</span>
              <p className='rounded-md bg-muted/50 p-2 text-xs font-medium text-foreground whitespace-pre-wrap'>
                {payment.notes}
              </p>
            </div>
          )}

          {isCancelled && (
            <div className='space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs'>
              <div className='flex items-center gap-1.5 font-semibold text-destructive'>
                <Icons.warning className='size-3.5' />
                <span>Payment Cancelled</span>
              </div>
              {payment.cancelReason && (
                <p className='text-muted-foreground'>
                  <span className='font-medium text-foreground'>Reason: </span>
                  {payment.cancelReason}
                </p>
              )}
              {payment.cancelledAt && (
                <p className='text-muted-foreground text-[11px]'>
                  Cancelled at: {new Date(payment.cancelledAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {!isCancelled && onCancelClick && (
          <div className='mt-auto pt-4'>
            <Button
              type='button'
              variant='outline'
              className='w-full text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => {
                onOpenChange(false);
                onCancelClick(payment);
              }}
            >
              <Icons.close className='me-2 size-4' />
              Cancel Payment
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
