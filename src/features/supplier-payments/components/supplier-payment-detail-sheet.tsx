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
import { formatIsoDate } from '@/lib/dates';
import { useT } from '@/i18n/use-t';
import type { SupplierPaymentDetailSheetProps } from '@/types/supplier-payment';

export function SupplierPaymentDetailSheet({
  payment,
  open,
  onOpenChange,
  onCancelClick
}: SupplierPaymentDetailSheetProps) {
  const t = useT();
  if (!payment) return null;

  const isCancelled = payment.status === 'CANCELLED';

  const handleCancelPayment = () => {
    onOpenChange(false);
    onCancelClick?.(payment);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col gap-6 sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <div className='flex items-center justify-between pe-6'>
            <SheetTitle className='text-lg font-semibold'>
              {payment.supplierName || t('supplierPayments.supplier')}
            </SheetTitle>
            <StatusBadge status={payment.status} />
          </div>
          <SheetDescription className='text-xs'>
            {t('supplierPayments.detailTitle')}
          </SheetDescription>
        </SheetHeader>

        <div className='rounded-xl border border-border/70 bg-muted/40 p-4 text-center'>
          <span className='text-xs font-normal text-muted-foreground'>
            {t('supplierPayments.paymentAmount')}
          </span>
          <p className='mt-1 text-2xl font-bold tracking-tight text-foreground'>
            {formatPkr(payment.amount)}
          </p>
          <span className='mt-1 inline-block text-xs text-muted-foreground'>
            {formatIsoDate(payment.paymentDate)}
          </span>
        </div>

        <div className='space-y-3 divide-y divide-border/60 text-sm'>
          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>{t('supplierPayments.supplier')}</span>
            <span className='font-medium text-foreground'>{payment.supplierName || '—'}</span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>{t('supplierPayments.appliedTo')}</span>
            <span className='font-medium text-foreground'>
              {payment.purchaseNo
                ? `Purchase #${payment.purchaseNo}`
                : t('supplierPayments.openingBalance')}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>{t('supplierPayments.paymentDateLabel')}</span>
            <span className='font-medium text-foreground'>
              {formatIsoDate(payment.paymentDate)}
            </span>
          </div>

          <div className='flex justify-between py-2'>
            <span className='text-muted-foreground'>{t('supplierPayments.status')}</span>
            <span>
              <StatusBadge status={payment.status} />
            </span>
          </div>

          {payment.notes && (
            <div className='py-2'>
              <span className='text-muted-foreground block text-xs mb-1'>
                {t('supplierPayments.notes')}
              </span>
              <p className='rounded-md bg-muted/50 p-2 text-xs font-medium text-foreground whitespace-pre-wrap'>
                {payment.notes}
              </p>
            </div>
          )}

          {isCancelled && (
            <div className='space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs'>
              <div className='flex items-center gap-1.5 font-semibold text-destructive'>
                <Icons.warning className='size-3.5' />
                <span>{t('supplierPayments.paymentCancelled')}</span>
              </div>
              {payment.cancelReason && (
                <p className='text-muted-foreground'>
                  <span className='font-medium text-foreground'>
                    {t('supplierPayments.reason')}{' '}
                  </span>
                  {payment.cancelReason}
                </p>
              )}
              {payment.cancelledAt && (
                <p className='text-muted-foreground text-[11px]'>
                  {t('supplierPayments.cancelledAt')}{' '}
                  {new Date(payment.cancelledAt).toLocaleString()}
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
              onClick={handleCancelPayment}
            >
              <Icons.close className='me-2 size-4' />
              {t('supplierPayments.cancelPayment')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
