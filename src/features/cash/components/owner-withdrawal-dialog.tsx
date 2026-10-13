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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { formatPkr, toPaisa } from '@/lib/dukaan/numbers';
import { createOwnerWithdrawalMutation } from '../api/mutations';
import { cashKeys } from '../api/queries';
import type { CashOverdraftPrompt, CreateOwnerWithdrawalResult } from '@/types/cash';

import { useT } from '@/i18n/use-t';

export interface OwnerWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerWithdrawalDialog({ open, onOpenChange }: OwnerWithdrawalDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [overdraftPrompt, setOverdraftPrompt] = useState<CashOverdraftPrompt | null>(null);
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);

  const withdrawalMutation = useMutation({
    ...createOwnerWithdrawalMutation,
    onSuccess: async (data: CreateOwnerWithdrawalResult) => {
      if ('confirmOverdraft' in data && data.confirmOverdraft) {
        setOverdraftPrompt(data);
        toast.warning(data.message || 'Cash deficit warning. Confirm overdraft to proceed.');
        return;
      }

      toast.success(t('dukaan.cash.withdrawalSuccess') || 'Owner withdrawal recorded successfully');
      await qc.invalidateQueries({ queryKey: cashKeys.all });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      setAmountStr('');
      setNotes('');
      setOverdraftPrompt(null);
      setConfirmOverdraft(false);
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record owner withdrawal');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    withdrawalMutation.mutate({
      amount: toPaisa(parsedAmount),
      date: date || undefined,
      notes: notes.trim() || undefined,
      confirmOverdraft: confirmOverdraft || undefined
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setAmountStr('');
          setNotes('');
          setOverdraftPrompt(null);
          setConfirmOverdraft(false);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className='w-full sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {t('dukaan.cash.recordWithdrawalTitle') || 'Record Owner Withdrawal'}
          </DialogTitle>
          <DialogDescription>
            {t('dukaan.cash.recordWithdrawalDesc') ||
              'Record cash the owner takes out of the shop drawer. This is not counted as an operating expense.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          {/* Amount */}
          <div className='space-y-1.5 w-full'>
            <Label htmlFor='withdrawal-amount' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.withdrawalAmount') || 'Withdrawal Amount (PKR)'}{' '}
              <span className='text-destructive'>*</span>
            </Label>
            <div className='relative w-full'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                Rs
              </span>
              <Input
                id='withdrawal-amount'
                type='number'
                min='1'
                step='any'
                placeholder='0.00'
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setOverdraftPrompt(null);
                  setConfirmOverdraft(false);
                }}
                disabled={withdrawalMutation.isPending}
                className='h-10 pl-9 text-sm font-normal text-foreground w-full'
                autoFocus
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className='space-y-1.5 w-full'>
            <Label htmlFor='withdrawal-date' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.date') || 'Date'} <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='withdrawal-date'
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={withdrawalMutation.isPending}
              className='h-10 text-sm font-normal text-foreground w-full cursor-pointer'
              required
            />
          </div>

          {/* Notes */}
          <div className='space-y-1.5 w-full'>
            <Label htmlFor='withdrawal-notes' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.notes') || 'Notes'}{' '}
              <span className='text-xs text-muted-foreground'>
                ({t('common.optional') || 'Optional'})
              </span>
            </Label>
            <Textarea
              id='withdrawal-notes'
              rows={2}
              placeholder='e.g. Took money home...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={withdrawalMutation.isPending}
              className='resize-none text-sm font-normal text-foreground w-full'
            />
          </div>

          {/* Overdraft Warning Banner */}
          {overdraftPrompt && (
            <div className='rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2.5 text-xs text-amber-900 dark:text-amber-200'>
              <div className='flex items-start gap-2'>
                <Icons.warning className='size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
                <div className='flex-1'>
                  <p className='font-semibold'>
                    {t('dukaan.cash.shortfallWarningTitle') || 'Cash Shortfall Warning'}
                  </p>
                  <p className='mt-0.5 text-muted-foreground'>
                    {overdraftPrompt.message ||
                      `This withdrawal takes drawer cash below zero by ${formatPkr(overdraftPrompt.shortfall)}.`}
                  </p>
                </div>
              </div>
              <label className='flex cursor-pointer items-center gap-2 pt-1 font-medium'>
                <Checkbox
                  checked={confirmOverdraft}
                  onCheckedChange={(c) => setConfirmOverdraft(Boolean(c))}
                />
                <span>
                  {t('dukaan.cash.confirmOverdraftLabel') ||
                    'Confirm withdrawal despite cash deficit'}
                </span>
              </label>
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
            <DialogCancelButton
              onClick={() => onOpenChange(false)}
              disabled={withdrawalMutation.isPending}
            />
            <DialogPrimaryButton
              mode='save'
              loading={withdrawalMutation.isPending}
              disabled={
                withdrawalMutation.isPending ||
                !amountStr ||
                Number(amountStr) <= 0 ||
                (Boolean(overdraftPrompt) && !confirmOverdraft)
              }
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
