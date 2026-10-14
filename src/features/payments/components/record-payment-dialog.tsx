'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { formatPkr } from '@/lib/dukaan/numbers';
import { toPaisa } from '@/lib/money';
import { useT } from '@/i18n/use-t';
import { Icons } from '@/components/icons';
import type { CustomerDTO } from '@/lib/api/types';
import type { PaymentMethodOption, RecordPaymentDialogProps } from '@/types/payment';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { createPaymentMutation } from '../api/mutations';
import { paymentKeys } from '../api/queries';
import { CustomerSelectCombobox } from './customer-select';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'JAZZCASH', label: 'JazzCash' },
  { value: 'EASYPAISA', label: 'EasyPaisa' },
  { value: 'BANK', label: 'Bank Transfer' }
] as const;

export function RecordPaymentDialog({
  open,
  onOpenChange,
  defaultCustomerId,
  onSuccess
}: RecordPaymentDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? '');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>('CASH');
  const [notes, setNotes] = useState('');

  const recordMutation = useMutation({
    ...createPaymentMutation,
    onSuccess: () => {
      toast.success(
        t('payments.recordSuccess', {
          amount: amountStr,
          customer: selectedCustomer?.name || t('payments.customer')
        })
      );
      void qc.invalidateQueries({ queryKey: paymentKeys.all });
      onOpenChange(false);
      setAmountStr('');
      setNotes('');
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('payments.recordFailed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error(t('payments.selectCustomer'));
      return;
    }
    const num = parseFloat(amountStr);
    if (!num || num <= 0) {
      toast.error(t('payments.validAmount'));
      return;
    }

    const paisaAmount = toPaisa(num);

    recordMutation.mutate({
      clientRequestId: crypto.randomUUID(),
      customerId,
      amount: paisaAmount,
      paymentDate,
      method: paymentMethod,
      notes: notes.trim() || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('payments.recordPaymentTitle')}</DialogTitle>
          <DialogDescription>{t('payments.recordPaymentDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium'>
              {t('payments.customer')} <span className='text-destructive'>*</span>
            </Label>
            <CustomerSelectCombobox
              value={customerId}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={(cust) => {
                setCustomerId(cust ? cust.id : '');
                setSelectedCustomer(cust);
              }}
            />
          </div>

          {selectedCustomer && (
            <div className='rounded-lg border bg-muted/30 p-2.5 text-xs flex justify-between items-center'>
              <div className='flex items-center gap-1.5'>
                <span className='font-normal text-foreground'>{selectedCustomer.name}</span>
                {selectedCustomer.phone && (
                  <span className='text-muted-foreground'>({selectedCustomer.phone})</span>
                )}
              </div>
              {selectedCustomer.openingBalance > 0 && (
                <div className='text-end'>
                  <span className='text-muted-foreground'>{t('payments.openingUdhar')} </span>
                  <span className='font-normal text-amber-600 dark:text-amber-400'>
                    {formatPkr(selectedCustomer.openingBalance)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className='space-y-1.5'>
            <Label htmlFor='payment-amount' className='text-xs font-medium text-foreground'>
              {t('payments.amountReceivedPkr')} <span className='text-destructive'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm font-normal text-foreground'>
                {t('common.currency')}
              </span>
              <Input
                id='payment-amount'
                type='number'
                min='1'
                step='any'
                placeholder='0'
                className='ps-9 text-sm font-normal text-foreground'
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='payment-date' className='text-xs font-medium text-foreground'>
              {t('payments.paymentDate')} <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='payment-date'
              type='date'
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className='text-sm font-normal text-foreground cursor-pointer'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='payment-method' className='text-xs font-medium text-foreground'>
              {t('payments.paymentMethod')}
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(val) => {
                if (val) setPaymentMethod(val as PaymentMethodOption);
              }}
              items={PAYMENT_METHOD_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label
              }))}
            >
              <SelectTrigger
                id='payment-method'
                className='w-full text-sm font-normal text-foreground h-9 justify-between'
              >
                <SelectValue
                  placeholder={t('payments.selectPaymentMethod')}
                  className='text-sm font-normal text-foreground'
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className='text-sm font-normal text-foreground'
                    >
                      <div className='flex items-center gap-2'>
                        {opt.value === 'CASH' && (
                          <Icons.cash className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                        )}
                        {opt.value === 'JAZZCASH' && (
                          <Icons.wallet className='h-3.5 w-3.5 text-amber-500' />
                        )}
                        {opt.value === 'EASYPAISA' && (
                          <Icons.wallet className='h-3.5 w-3.5 text-emerald-500' />
                        )}
                        {opt.value === 'BANK' && (
                          <Icons.creditCard className='h-3.5 w-3.5 text-blue-500' />
                        )}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='payment-notes' className='text-xs font-medium text-foreground'>
              {t('payments.notesOptional')}
            </Label>
            <Textarea
              id='payment-notes'
              placeholder={t('payments.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className='text-sm font-normal text-foreground'
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
            <DialogCancelButton
              onClick={() => onOpenChange(false)}
              disabled={recordMutation.isPending}
            />
            <DialogPrimaryButton
              mode='save'
              disabled={recordMutation.isPending || !customerId || !amountStr}
              loading={recordMutation.isPending}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
