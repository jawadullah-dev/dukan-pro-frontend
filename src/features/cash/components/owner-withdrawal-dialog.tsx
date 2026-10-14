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
import { todayIsoDate } from '@/lib/dates';
import { createOwnerWithdrawalMutation } from '../api/mutations';
import { cashKeys } from '../api/queries';
import type {
  CashOverdraftPrompt,
  CreateOwnerWithdrawalResult,
  OwnerWithdrawalDialogProps
} from '@/types/cash';

import { useT } from '@/i18n/use-t';

export function OwnerWithdrawalDialog({ open, onOpenChange }: OwnerWithdrawalDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(todayIsoDate);
  const [notes, setNotes] = useState('');
  const [overdraftPrompt, setOverdraftPrompt] = useState<CashOverdraftPrompt | null>(null);
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);

  const withdrawalMutation = useMutation({
    ...createOwnerWithdrawalMutation,
    onSuccess: async (data: CreateOwnerWithdrawalResult) => {
      if ('confirmOverdraft' in data && data.confirmOverdraft) {
        setOverdraftPrompt(data);
        toast.warning(data.message || t('dukaan.cash.overdraftWarning'));
        return;
      }

      toast.success(t('dukaan.cash.withdrawalSuccess'));
      await qc.invalidateQueries({ queryKey: cashKeys.all });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      setAmountStr('');
      setNotes('');
      setOverdraftPrompt(null);
      setConfirmOverdraft(false);
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || t('dukaan.cash.withdrawalFailed'));
    }
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountStr(e.target.value);
    setOverdraftPrompt(null);
    setConfirmOverdraft(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(t('common.invalidAmount'));
      return;
    }

    withdrawalMutation.mutate({
      amount: toPaisa(parsedAmount),
      date: date || undefined,
      notes: notes.trim() || undefined,
      confirmOverdraft: confirmOverdraft || undefined
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAmountStr('');
      setNotes('');
      setOverdraftPrompt(null);
      setConfirmOverdraft(false);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='w-full sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('dukaan.cash.recordWithdrawalTitle')}</DialogTitle>
          <DialogDescription>{t('dukaan.cash.recordWithdrawalDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5 w-full'>
            <Label htmlFor='withdrawal-amount' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.withdrawalAmount')} <span className='text-destructive'>*</span>
            </Label>
            <div className='relative w-full'>
              <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                {t('common.currency')}
              </span>
              <Input
                id='withdrawal-amount'
                type='number'
                min='1'
                step='any'
                placeholder='0.00'
                value={amountStr}
                onChange={handleAmountChange}
                disabled={withdrawalMutation.isPending}
                className='h-10 ps-9 text-sm font-normal text-foreground w-full'
                autoFocus
                required
              />
            </div>
          </div>

          <div className='space-y-1.5 w-full'>
            <Label htmlFor='withdrawal-date' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.date')} <span className='text-destructive'>*</span>
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

          <div className='space-y-1.5 w-full'>
            <Label htmlFor='withdrawal-notes' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.notes')}{' '}
              <span className='text-xs text-muted-foreground'>({t('common.optional')})</span>
            </Label>
            <Textarea
              id='withdrawal-notes'
              rows={2}
              placeholder={t('dukaan.cash.withdrawalPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={withdrawalMutation.isPending}
              className='resize-none text-sm font-normal text-foreground w-full'
            />
          </div>

          {overdraftPrompt && (
            <div className='rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2.5 text-xs text-amber-900 dark:text-amber-200'>
              <div className='flex items-start gap-2'>
                <Icons.warning className='size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
                <div className='flex-1'>
                  <p className='font-semibold'>{t('dukaan.cash.shortfallWarningTitle')}</p>
                  <p className='mt-0.5 text-muted-foreground'>
                    {overdraftPrompt.message ||
                      t('dukaan.cash.shortfallWarningDesc', {
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
                <span>{t('dukaan.cash.confirmOverdraftLabel')}</span>
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
