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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { formatPkr } from '@/lib/dukaan/numbers';
import type { CustomerDTO } from '@/lib/api/types';
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

export type PaymentMethodOption = (typeof PAYMENT_METHOD_OPTIONS)[number]['value'];

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCustomerId?: string;
  onSuccess?: () => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  defaultCustomerId,
  onSuccess
}: RecordPaymentDialogProps) {
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
        `Payment of Rs ${amountStr} recorded for ${selectedCustomer?.name || 'customer'}`
      );
      void qc.invalidateQueries({ queryKey: paymentKeys.all });
      onOpenChange(false);
      setAmountStr('');
      setNotes('');
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record payment');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    const num = parseFloat(amountStr);
    if (!num || num <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    const paisaAmount = Math.round(num * 100);

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
          <DialogTitle>Record Customer Payment</DialogTitle>
          <DialogDescription>
            Record cash received from a customer against their outstanding Udhar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Customer select */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-medium'>
              Customer <span className='text-destructive'>*</span>
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

          {/* Selected Customer details preview */}
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
                  <span className='text-muted-foreground'>Opening Udhar: </span>
                  <span className='font-normal text-amber-600 dark:text-amber-400'>
                    {formatPkr(selectedCustomer.openingBalance)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Amount input */}
          <div className='space-y-1.5'>
            <Label htmlFor='payment-amount' className='text-xs font-medium text-foreground'>
              Amount Received (PKR) <span className='text-destructive'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm font-normal text-foreground'>
                Rs
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

          {/* Payment Date */}
          <div className='space-y-1.5'>
            <Label htmlFor='payment-date' className='text-xs font-medium text-foreground'>
              Payment Date <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='payment-date'
              type='date'
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              className='text-sm font-normal text-foreground'
            />
          </div>

          {/* Payment Method */}
          <div className='space-y-1.5'>
            <Label htmlFor='payment-method' className='text-xs font-medium text-foreground'>
              Payment Method
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
                  placeholder='Select payment method'
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

          {/* Notes */}
          <div className='space-y-1.5'>
            <Label htmlFor='payment-notes' className='text-xs font-medium text-foreground'>
              Notes (Optional)
            </Label>
            <Textarea
              id='payment-notes'
              placeholder='e.g., Paid for last week purchases, cash given at shop'
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
