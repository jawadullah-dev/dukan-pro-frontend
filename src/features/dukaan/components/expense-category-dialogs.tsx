'use client';

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
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import type { ExpenseCategory } from '@/lib/dukaan/types';
import { dukaanKeys } from '../api/queries';
import { nameOnlySchema } from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';

interface ExpenseCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExpenseCategory | null;
}

export function ExpenseCategoryDialog({
  open,
  onOpenChange,
  category
}: ExpenseCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <ExpenseCategoryDialogBody
          key={category?.id ?? 'new'}
          category={category}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

function ExpenseCategoryDialogBody({
  category,
  onOpenChange
}: {
  category?: ExpenseCategory | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(category);

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (category) return dukaan.updateExpenseCategory(category.id, { name });
      return dukaan.createExpenseCategory(name);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Expense category updated' : 'Expense category created');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: category?.name ?? '' },
    validators: { onSubmit: nameOnlySchema },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit expense category' : 'Add expense category'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the expense category name.'
            : 'Create a category used when recording expenses.'}
        </DialogDescription>
      </DialogHeader>
      <form
        className='grid gap-4'
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField
            name='name'
            children={(field) => (
              <field.TextField label='Name' required placeholder='e.g. Rent' autoFocus />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={save.isPending} />
          <DialogPrimaryButton mode={isEdit ? 'edit' : 'add'} loading={save.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
