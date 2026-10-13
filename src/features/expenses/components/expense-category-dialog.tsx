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
import { Switch } from '@/components/ui/switch';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import { createExpenseCategoryMutation, updateExpenseCategoryMutation } from '../api/mutations';
import { expenseKeys } from '../api/queries';
import { listExpenseCategories } from '../api/service';
import type { ExpenseCategoryDTO } from '@/types/expense';

export interface ExpenseCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExpenseCategoryDTO | null;
  onCategoryCreated?: (category: ExpenseCategoryDTO) => void;
}

interface ExpenseCategoryDialogBodyProps {
  category?: ExpenseCategoryDTO | null;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (category: ExpenseCategoryDTO) => void;
}

function ExpenseCategoryDialogBody({
  category,
  onOpenChange,
  onCategoryCreated
}: ExpenseCategoryDialogBodyProps) {
  const qc = useQueryClient();
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name ?? '');
  const [isActive, setIsActive] = useState(category ? category.isActive : true);

  const createMutation = useMutation({
    ...createExpenseCategoryMutation,
    onSuccess: async () => {
      toast.success(`Expense category "${name.trim()}" created successfully`);
      await qc.invalidateQueries({ queryKey: expenseKeys.all });

      if (onCategoryCreated) {
        try {
          const fresh = await listExpenseCategories({ search: name.trim(), isActive: true });
          const found = fresh.items.find(
            (c: ExpenseCategoryDTO) => c.name.toLowerCase() === name.trim().toLowerCase()
          );
          if (found) {
            onCategoryCreated(found);
          }
        } catch {}
      }

      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create expense category');
    }
  });

  const updateMutation = useMutation({
    ...updateExpenseCategoryMutation,
    onSuccess: async () => {
      toast.success(`Expense category "${name.trim()}" updated successfully`);
      await qc.invalidateQueries({ queryKey: expenseKeys.all });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update expense category');
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Category name is required');
      return;
    }
    if (trimmed.length < 2) {
      toast.error('Category name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 100) {
      toast.error('Category name cannot exceed 100 characters');
      return;
    }

    if (isEdit && category) {
      updateMutation.mutate({
        id: category.id,
        input: {
          name: trimmed,
          isActive
        }
      });
    } else {
      createMutation.mutate({
        name: trimmed,
        isActive
      });
    }
  };

  return (
    <DialogContent className='w-full sm:max-w-md'>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Expense Category' : 'Add Expense Category'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the category name and its active status.'
            : 'Create a new category to organize your shop operating expenses.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className='space-y-4 pt-2'>
        <div className='space-y-1.5'>
          <Label htmlFor='category-name' className='text-sm font-normal text-foreground'>
            Category Name <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='category-name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Generator Fuel, Marketing, Tea & Snacks'
            disabled={isPending}
            className='h-10 text-sm font-normal text-foreground w-full'
            autoFocus
            required
          />
        </div>

        {isEdit && (
          <div className='flex items-center justify-between rounded-lg border border-border p-3'>
            <div className='space-y-0.5'>
              <Label
                htmlFor='category-status'
                className='text-sm font-medium text-foreground cursor-pointer'
              >
                Active Status
              </Label>
              <p className='text-xs text-muted-foreground'>
                {isActive
                  ? 'Category is active and available for expenses'
                  : 'Category is inactive and hidden from new expense entries'}
              </p>
            </div>
            <Switch
              id='category-status'
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isPending}
            />
          </div>
        )}

        <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={isPending} />
          <DialogPrimaryButton
            mode='save'
            loading={isPending}
            disabled={isPending || !name.trim()}
          />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function ExpenseCategoryDialog({
  open,
  onOpenChange,
  category,
  onCategoryCreated
}: ExpenseCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ExpenseCategoryDialogBody
          key={category?.id ?? 'new'}
          category={category}
          onOpenChange={onOpenChange}
          onCategoryCreated={onCategoryCreated}
        />
      ) : null}
    </Dialog>
  );
}
