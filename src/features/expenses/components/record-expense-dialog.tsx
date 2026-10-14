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
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { formatPkr, toPaisa } from '@/lib/dukaan/numbers';
import { todayIsoDate } from '@/lib/dates';
import { useT } from '@/i18n/use-t';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { createExpenseMutation } from '../api/mutations';
import { expenseKeys } from '../api/queries';
import { CategorySelectCombobox } from './category-select';
import { AddCategoryDialog } from './add-category-dialog';
import type { ExpenseCategoryDTO, RecordExpenseDialogProps } from '@/types/expense';
import type { OverdraftPrompt } from '@/types';

export function RecordExpenseDialog({
  open,
  onOpenChange,
  defaultCategoryId,
  onSuccess
}: RecordExpenseDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? '');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryDTO | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayIsoDate);
  const [description, setDescription] = useState('');
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [overdraftPrompt, setOverdraftPrompt] = useState<OverdraftPrompt | null>(null);

  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const recordMutation = useMutation({
    ...createExpenseMutation,
    onSuccess: (res) => {
      if (res && res.confirmOverdraft) {
        setOverdraftPrompt({
          shortfall: res.shortfall,
          message: res.message
        });
        setConfirmOverdraft(true);
        toast.warning(res.message || t('expenses.overdraftWarning'));
        return;
      }

      toast.success(t('expenses.recordSuccess', { amount: amountStr }));
      void qc.invalidateQueries({ queryKey: expenseKeys.all });
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('expenses.recordFailed'));
    }
  });

  const resetForm = () => {
    setCategoryId('');
    setSelectedCategory(null);
    setAmountStr('');
    setDescription('');
    setConfirmOverdraft(false);
    setOverdraftPrompt(null);
  };

  const handleCategoryCreated = (newCat: ExpenseCategoryDTO) => {
    setSelectedCategory(newCat);
    setCategoryId(newCat.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error(t('expenses.categoryRequired'));
      return;
    }

    const num = parseFloat(amountStr);
    if (!num || num <= 0) {
      toast.error(t('common.invalidAmount'));
      return;
    }

    if (overdraftPrompt && !confirmOverdraft) {
      toast.error(t('expenses.confirmOverdraftRequired'));
      return;
    }

    recordMutation.mutate({
      categoryId,
      amount: toPaisa(num),
      expenseDate,
      description: description.trim() ? description.trim() : undefined,
      confirmOverdraft: confirmOverdraft || !!overdraftPrompt
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleCategorySelect = (cat: ExpenseCategoryDTO | null) => {
    setSelectedCategory(cat);
    setCategoryId(cat?.id ?? '');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='max-h-[92vh] overflow-y-auto w-full sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('expenses.recordExpenseTitle')}</DialogTitle>
            <DialogDescription>{t('expenses.recordExpenseDesc')}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
            <div className='space-y-1.5 w-full'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-normal text-foreground'>
                  {t('expenses.category')} <span className='text-destructive'>*</span>
                </Label>
                <button
                  type='button'
                  onClick={() => setAddCategoryOpen(true)}
                  className='text-xs font-medium text-primary hover:underline flex items-center gap-1'
                >
                  <Icons.add className='size-3' />
                  <span>{t('expenses.newCategory')}</span>
                </button>
              </div>

              <CategorySelectCombobox
                value={categoryId}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
                placeholder={t('expenses.searchAndSelectCategory')}
                disabled={recordMutation.isPending}
                onAddNewCategoryClick={() => setAddCategoryOpen(true)}
              />
            </div>

            <div className='space-y-1.5 w-full'>
              <Label htmlFor='expense-amount' className='text-sm font-normal text-foreground'>
                {t('expenses.amountPkr')} <span className='text-destructive'>*</span>
              </Label>
              <div className='relative w-full'>
                <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                  {t('common.currency')}
                </span>
                <Input
                  id='expense-amount'
                  type='number'
                  min='1'
                  step='any'
                  placeholder='0.00'
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  disabled={recordMutation.isPending}
                  className='h-10 ps-9 text-sm font-normal text-foreground w-full'
                  required
                />
              </div>
            </div>

            <div className='space-y-1.5 w-full'>
              <Label htmlFor='expense-date' className='text-sm font-normal text-foreground'>
                {t('expenses.expenseDate')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='expense-date'
                type='date'
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                disabled={recordMutation.isPending}
                className='h-10 text-sm font-normal text-foreground w-full cursor-pointer'
                required
              />
            </div>

            <div className='space-y-1.5 w-full'>
              <Label htmlFor='expense-description' className='text-sm font-normal text-foreground'>
                {t('expenses.description')}{' '}
                <span className='text-xs text-muted-foreground'>({t('common.optional')})</span>
              </Label>
              <Textarea
                id='expense-description'
                rows={3}
                placeholder={t('expenses.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={recordMutation.isPending}
                className='resize-none text-sm font-normal text-foreground w-full'
              />
            </div>

            {overdraftPrompt && (
              <div className='rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2.5 text-xs text-amber-900 dark:text-amber-200'>
                <div className='flex items-start gap-2'>
                  <Icons.warning className='size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5' />
                  <div className='flex-1'>
                    <p className='font-semibold'>{t('expenses.shortfallWarningTitle')}</p>
                    <p className='mt-0.5 text-muted-foreground'>
                      {overdraftPrompt.message ||
                        t('dukaan.cash.shortfallWarningDesc', {
                          shortfall: formatPkr(overdraftPrompt.shortfall ?? 0)
                        })}
                    </p>
                  </div>
                </div>
                <label className='flex cursor-pointer items-center gap-2 pt-1 font-medium'>
                  <Checkbox
                    checked={confirmOverdraft}
                    onCheckedChange={(c) => setConfirmOverdraft(Boolean(c))}
                  />
                  <span>{t('expenses.confirmExpenseOverdraft')}</span>
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

      <AddCategoryDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
}
