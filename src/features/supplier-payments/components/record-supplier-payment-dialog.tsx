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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { formatPkr, toPaisa, fromPaisa } from '@/lib/dukaan/numbers';
import { useT } from '@/i18n/use-t';
import type {
  SupplierDTO,
  UnpaidPurchaseDTO,
  RecordSupplierPaymentDialogProps
} from '@/types/supplier-payment';
import { createSupplierPaymentMutation } from '../api/mutations';
import { supplierPaymentKeys, supplierPayableQueryOptions } from '../api/queries';
import { SupplierSelectCombobox } from './supplier-select';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function RecordSupplierPaymentDialog({
  open,
  onOpenChange,
  defaultSupplierId,
  onSuccess
}: RecordSupplierPaymentDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [supplierId, setSupplierId] = useState(defaultSupplierId ?? '');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDTO | null>(null);
  const [targetType, setTargetType] = useState<'opening' | 'purchase'>('opening');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>('');
  const [amountStr, setAmountStr] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [overdraftPrompt, setOverdraftPrompt] = useState<{
    shortfall: number;
    message: string;
  } | null>(null);

  const { data: payableData, isLoading: payableLoading } = useQuery({
    ...supplierPayableQueryOptions(supplierId),
    enabled: open && !!supplierId
  });

  const unpaidPurchases = payableData?.unpaidPurchases ?? [];
  const openingRemaining = payableData?.openingRemaining ?? 0;
  const totalPayable = payableData?.payable ?? 0;

  const activePurchase: UnpaidPurchaseDTO | undefined = unpaidPurchases.find(
    (p) => p.id === selectedPurchaseId
  );

  const maxRemainingPaisa =
    targetType === 'opening' ? openingRemaining : (activePurchase?.remaining ?? 0);

  const maxRemainingRupees = fromPaisa(maxRemainingPaisa);

  const resetForm = () => {
    setSupplierId('');
    setSelectedSupplier(null);
    setTargetType('opening');
    setSelectedPurchaseId('');
    setAmountStr('');
    setNotes('');
    setConfirmOverdraft(false);
    setOverdraftPrompt(null);
  };

  const recordMutation = useMutation({
    ...createSupplierPaymentMutation,
    onSuccess: (res) => {
      if (res && res.confirmOverdraft) {
        setOverdraftPrompt({
          shortfall: res.shortfall,
          message: res.message
        });
        setConfirmOverdraft(true);
        toast.warning(res.message || t('supplierPayments.overdraftWarning'));
        return;
      }

      toast.success(
        t('supplierPayments.recordSuccess', {
          amount: amountStr,
          supplier:
            selectedSupplier?.name || payableData?.supplierName || t('supplierPayments.supplier')
        })
      );
      void qc.invalidateQueries({ queryKey: supplierPaymentKeys.all });
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('supplierPayments.recordFailed'));
    }
  });

  const handleSupplierSelect = (supplier: SupplierDTO | null) => {
    setSelectedSupplier(supplier);
    setSupplierId(supplier?.id ?? '');
    setTargetType('opening');
    setSelectedPurchaseId('');
    setAmountStr('');
    setOverdraftPrompt(null);
    setConfirmOverdraft(false);
  };

  const handlePayFull = () => {
    if (maxRemainingRupees > 0) {
      setAmountStr(String(maxRemainingRupees));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error(t('supplierPayments.supplierRequired'));
      return;
    }

    const num = parseFloat(amountStr);
    if (!num || num <= 0) {
      toast.error(t('common.invalidAmount'));
      return;
    }

    const paisaAmount = toPaisa(num);

    if (maxRemainingPaisa > 0 && paisaAmount > maxRemainingPaisa) {
      toast.error(t('supplierPayments.amountExceedsDebt'));
      return;
    }

    if (targetType === 'purchase' && !selectedPurchaseId) {
      toast.error(t('supplierPayments.selectPurchaseBill'));
      return;
    }

    if (overdraftPrompt && !confirmOverdraft) {
      toast.error(t('supplierPayments.confirmOverdraftBeforeSaving'));
      return;
    }

    recordMutation.mutate({
      supplierId,
      purchaseId: targetType === 'purchase' ? selectedPurchaseId : null,
      amount: paisaAmount,
      paymentDate,
      confirmOverdraft: confirmOverdraft || !!overdraftPrompt,
      notes: notes.trim() ? notes.trim() : undefined
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className='max-h-[92vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('supplierPayments.addPaymentTitle')}</DialogTitle>
          <DialogDescription>{t('supplierPayments.addPaymentDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5'>
            <Label className='text-sm font-normal text-foreground'>
              {t('supplierPayments.supplier')} <span className='text-destructive'>*</span>
            </Label>
            <SupplierSelectCombobox
              value={supplierId}
              selectedSupplier={selectedSupplier}
              onSelectSupplier={handleSupplierSelect}
              placeholder={t('supplierPayments.searchSupplierPlaceholder')}
              disabled={recordMutation.isPending}
            />
          </div>

          {supplierId && (
            <div className='rounded-xl border border-border/70 bg-muted/40 p-3.5 text-sm'>
              {payableLoading ? (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Icons.spinner className='size-4 animate-spin text-primary' />
                  <span>{t('supplierPayments.loadingPayable')}</span>
                </div>
              ) : payableData ? (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='font-normal text-muted-foreground'>
                      {t('supplierPayments.totalPayable')}
                    </span>
                    <span className='font-semibold text-foreground'>{formatPkr(totalPayable)}</span>
                  </div>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-muted-foreground'>
                      {t('supplierPayments.openingBalanceRemaining')}
                    </span>
                    <span className='font-medium text-foreground'>
                      {formatPkr(openingRemaining)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-muted-foreground'>
                      {t('supplierPayments.unpaidPurchases')}
                    </span>
                    <span className='font-medium text-foreground'>
                      {unpaidPurchases.length} {t('supplierPayments.billsCount')}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {supplierId && payableData && (
            <div className='space-y-2'>
              <Label className='text-sm font-normal text-foreground'>
                {t('supplierPayments.paymentTarget')}
              </Label>
              <RadioGroup
                value={targetType}
                onValueChange={(val) => {
                  setTargetType(val as 'opening' | 'purchase');
                  setAmountStr('');
                }}
                className='grid grid-cols-2 gap-2'
              >
                <div
                  onClick={() => setTargetType('opening')}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm transition-all ${
                    targetType === 'opening'
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-border/70 bg-card hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='opening' id='target-opening' />
                    <Label htmlFor='target-opening' className='cursor-pointer text-xs font-medium'>
                      {t('supplierPayments.openingBalance')}
                    </Label>
                  </div>
                  <span className='text-xs font-semibold text-muted-foreground'>
                    {formatPkr(openingRemaining)}
                  </span>
                </div>

                <div
                  onClick={() => {
                    if (unpaidPurchases.length > 0) {
                      setTargetType('purchase');
                      if (!selectedPurchaseId && unpaidPurchases[0]) {
                        setSelectedPurchaseId(unpaidPurchases[0].id);
                      }
                    }
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm transition-all ${
                    targetType === 'purchase'
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-border/70 bg-card hover:bg-muted/30 text-foreground'
                  } ${unpaidPurchases.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem
                      value='purchase'
                      id='target-purchase'
                      disabled={unpaidPurchases.length === 0}
                    />
                    <Label htmlFor='target-purchase' className='cursor-pointer text-xs font-medium'>
                      {t('supplierPayments.specificBill')}
                    </Label>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {unpaidPurchases.length} {t('supplierPayments.billsCount')}
                  </span>
                </div>
              </RadioGroup>

              {targetType === 'purchase' && (
                <div className='mt-2 space-y-1.5'>
                  <Label className='text-xs font-normal text-muted-foreground'>
                    {t('supplierPayments.selectBillInvoice')}
                  </Label>
                  {unpaidPurchases.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      {t('supplierPayments.noUnpaidBills')}
                    </p>
                  ) : (
                    <div className='max-h-36 space-y-1.5 overflow-y-auto rounded-lg border border-border/70 p-1.5'>
                      {unpaidPurchases.map((purchase) => {
                        const isChosen = selectedPurchaseId === purchase.id;
                        return (
                          <div
                            key={purchase.id}
                            onClick={() => {
                              setSelectedPurchaseId(purchase.id);
                              setAmountStr('');
                            }}
                            className={`flex cursor-pointer items-center justify-between rounded-md p-2 text-xs transition-colors ${
                              isChosen
                                ? 'bg-primary/10 font-semibold text-primary'
                                : 'hover:bg-muted/50 text-foreground'
                            }`}
                          >
                            <div className='flex flex-col'>
                              <span className='font-medium text-foreground'>
                                {purchase.purchaseNo}
                                {purchase.supplierInvoiceRef && (
                                  <span className='text-muted-foreground ms-1'>
                                    {t('supplierPayments.inv', {
                                      inv: purchase.supplierInvoiceRef
                                    })}
                                  </span>
                                )}
                              </span>
                              <span className='text-[10px] text-muted-foreground'>
                                {t('supplierPayments.date')} {purchase.purchaseDate}{' '}
                                {t('supplierPayments.total')} {formatPkr(purchase.totalAmount)}
                              </span>
                            </div>
                            <div className='text-end'>
                              <span className='font-semibold text-foreground'>
                                {formatPkr(purchase.remaining)}
                              </span>
                              <div className='text-[10px] text-muted-foreground'>
                                {t('supplierPayments.remaining')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor='supplier-payment-amount'
                className='text-sm font-normal text-foreground'
              >
                {t('supplierPayments.amountPkr')} <span className='text-destructive'>*</span>
              </Label>
              {maxRemainingRupees > 0 && (
                <button
                  type='button'
                  onClick={handlePayFull}
                  className='text-xs font-medium text-primary hover:underline'
                >
                  {t('supplierPayments.payFull', { amount: formatPkr(maxRemainingPaisa) })}
                </button>
              )}
            </div>
            <div className='relative'>
              <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                {t('common.currency')}
              </span>
              <Input
                id='supplier-payment-amount'
                type='number'
                min='1'
                step='any'
                placeholder='0.00'
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={recordMutation.isPending}
                className='h-10 ps-9 text-sm font-normal text-foreground'
                required
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='supplier-payment-date' className='text-sm font-normal text-foreground'>
              {t('supplierPayments.paymentDateLabel')} <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='supplier-payment-date'
              type='date'
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={recordMutation.isPending}
              className='h-10 text-sm font-normal text-foreground cursor-pointer'
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='supplier-payment-notes' className='text-sm font-normal text-foreground'>
              {t('supplierPayments.notes')}{' '}
              <span className='text-xs text-muted-foreground'>({t('common.optional')})</span>
            </Label>
            <Textarea
              id='supplier-payment-notes'
              rows={2}
              placeholder={t('supplierPayments.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={recordMutation.isPending}
              className='resize-none text-sm font-normal text-foreground'
            />
          </div>

          {overdraftPrompt && (
            <div className='rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2.5 text-xs text-amber-900 dark:text-amber-200'>
              <div className='flex items-start gap-2'>
                <Icons.warning className='size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
                <div className='flex-1'>
                  <p className='font-semibold'>{t('supplierPayments.shortfallWarningTitle')}</p>
                  <p className='mt-0.5 text-muted-foreground'>
                    {overdraftPrompt.message ||
                      t('supplierPayments.shortfallWarningDesc', {
                        shortfall: formatPkr(overdraftPrompt.shortfall)
                      })}
                  </p>
                </div>
              </div>
              <label className='flex cursor-pointer items-center gap-2 pt-1 font-medium'>
                <Checkbox
                  checked={confirmOverdraft}
                  onCheckedChange={(c) => setConfirmOverdraft(Boolean(c))}
                />
                <span>{t('supplierPayments.confirmOverdraft')}</span>
              </label>
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
            <DialogCancelButton
              onClick={() => onOpenChange(false)}
              disabled={recordMutation.isPending}
            />
            <DialogPrimaryButton
              mode='save'
              loading={recordMutation.isPending}
              disabled={recordMutation.isPending || (!!overdraftPrompt && !confirmOverdraft)}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
