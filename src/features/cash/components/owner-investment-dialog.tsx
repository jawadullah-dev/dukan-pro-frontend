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
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { toPaisa } from '@/lib/dukaan/numbers';
import type { OwnerInvestmentDialogProps } from '@/types/cash';
import { createOwnerInvestmentMutation } from '../api/mutations';
import { cashKeys } from '../api/queries';

import { useT } from '@/i18n/use-t';

export function OwnerInvestmentDialog({ open, onOpenChange }: OwnerInvestmentDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const createMutation = useMutation({
    ...createOwnerInvestmentMutation,
    onSuccess: async () => {
      toast.success(t('dukaan.cash.investmentSuccess'));
      await qc.invalidateQueries({ queryKey: cashKeys.all });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      setAmountStr('');
      setNotes('');
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || t('dukaan.cash.investmentFailed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(t('common.invalidAmount'));
      return;
    }

    createMutation.mutate({
      amount: toPaisa(parsedAmount),
      date: date || undefined,
      notes: notes.trim() || undefined
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAmountStr('');
      setNotes('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='w-full sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('dukaan.cash.recordInvestmentTitle')}</DialogTitle>
          <DialogDescription>{t('dukaan.cash.recordInvestmentDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
          <div className='space-y-1.5 w-full'>
            <Label htmlFor='investment-amount' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.investmentAmount')} <span className='text-destructive'>*</span>
            </Label>
            <div className='relative w-full'>
              <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                {t('common.currency')}
              </span>
              <Input
                id='investment-amount'
                type='number'
                min='1'
                step='any'
                placeholder='0.00'
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={createMutation.isPending}
                className='h-10 ps-9 text-sm font-normal text-foreground w-full'
                autoFocus
                required
              />
            </div>
          </div>

          <div className='space-y-1.5 w-full'>
            <Label htmlFor='investment-date' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.date')} <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='investment-date'
              type='date'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={createMutation.isPending}
              className='h-10 text-sm font-normal text-foreground w-full cursor-pointer'
              required
            />
          </div>

          <div className='space-y-1.5 w-full'>
            <Label htmlFor='investment-notes' className='text-sm font-normal text-foreground'>
              {t('dukaan.cash.notes')}{' '}
              <span className='text-xs text-muted-foreground'>({t('common.optional')})</span>
            </Label>
            <Textarea
              id='investment-notes'
              rows={2}
              placeholder={t('dukaan.cash.investmentPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={createMutation.isPending}
              className='resize-none text-sm font-normal text-foreground w-full'
            />
          </div>

          <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
            <DialogCancelButton
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            />
            <DialogPrimaryButton
              mode='save'
              loading={createMutation.isPending}
              disabled={createMutation.isPending || !amountStr || Number(amountStr) <= 0}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
