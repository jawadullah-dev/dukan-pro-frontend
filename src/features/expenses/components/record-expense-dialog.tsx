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
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { createExpenseMutation } from '../api/mutations';
import { expenseKeys } from '../api/queries';
import { CategorySelectCombobox } from './category-select';
import { AddCategoryDialog } from './add-category-dialog';
import type { ExpenseCategoryDTO } from '@/types/expense';

interface RecordExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategoryId?: string;
  onSuccess?: () => void;
}

export function RecordExpenseDialog({
  open,
  onOpenChange,
  defaultCategoryId,
  onSuccess
}: RecordExpenseDialogProps) {
  const qc = useQueryClient();
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? '');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryDTO | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [overdraftPrompt, setOverdraftPrompt] = useState<{
    shortfall: number;
    message: string;
  } | null>(null);

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
        toast.warning(res.message || 'Expense will cause cash overdraft');
        return;
      }

      toast.success(`Expense of Rs ${amountStr} recorded successfully`);
      void qc.invalidateQueries({ queryKey: expenseKeys.all });
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record expense');
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
      toast.error('Please select an expense category');
      return;
    }

    const num = parseFloat(amountStr);
    if (!num || num <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (overdraftPrompt && !confirmOverdraft) {
      toast.error('Please confirm the overdraft warning before saving');
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

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) resetForm();
          onOpenChange(next);
        }}
      >
        <DialogContent className='max-h-[92vh] overflow-y-auto w-full sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record an operating cost (rent, electricity, tea, salary, etc.).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
            <div className='space-y-1.5 w-full'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-normal text-foreground'>
                  Category <span className='text-destructive'>*</span>
                </Label>
                <button
                  type='button'
                  onClick={() => setAddCategoryOpen(true)}
                  className='text-xs font-medium text-primary hover:underline flex items-center gap-1'
                >
                  <Icons.add className='size-3' />
                  <span>New category</span>
                </button>
              </div>

              <CategorySelectCombobox
                value={categoryId}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setCategoryId(cat?.id ?? '');
                }}
                placeholder='Search and select category...'
                disabled={recordMutation.isPending}
                onAddNewCategoryClick={() => setAddCategoryOpen(true)}
              />
            </div>

            <div className='space-y-1.5 w-full'>
              <Label htmlFor='expense-amount' className='text-sm font-normal text-foreground'>
                Amount (PKR) <span className='text-destructive'>*</span>
              </Label>
              <div className='relative w-full'>
                <span className='absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                  Rs
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
                Expense Date <span className='text-destructive'>*</span>
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
                Description <span className='text-xs text-muted-foreground'>(Optional)</span>
              </Label>
              <Textarea
                id='expense-description'
                rows={3}
                placeholder='e.g. October monthly electricity bill...'
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
                    <p className='font-semibold'>Cash Shortfall Warning</p>
                    <p className='mt-0.5 text-muted-foreground'>
                      {overdraftPrompt.message ||
                        `This expense takes drawer cash below zero by ${formatPkr(overdraftPrompt.shortfall)}.`}
                    </p>
                  </div>
                </div>
                <label className='flex cursor-pointer items-center gap-2 pt-1 font-medium'>
                  <Checkbox
                    checked={confirmOverdraft}
                    onCheckedChange={(c) => setConfirmOverdraft(Boolean(c))}
                  />
                  <span>Confirm expense despite cash deficit</span>
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
