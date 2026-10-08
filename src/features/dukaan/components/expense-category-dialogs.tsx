'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useT } from '@/i18n/use-t';
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
import { createNameOnlySchema } from '../schemas/forms';
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
  const t = useT();

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (category) return dukaan.updateExpenseCategory(category.id, { name });
      return dukaan.createExpenseCategory(name);
    },
    onSuccess: () => {
      toast.success(
        isEdit ? t('dukaan.category.expenseUpdated') : t('dukaan.category.expenseCreated')
      );
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: category?.name ?? '' },
    validators: { onSubmit: createNameOnlySchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? t('dukaan.category.expenseEditTitle') : t('dukaan.category.expenseAddTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? t('dukaan.category.expenseEditDescription')
            : t('dukaan.category.expenseAddDescription')}
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
              <field.TextField
                label={t('dukaan.party.name')}
                required
                placeholder={t('dukaan.category.expenseNamePlaceholder')}
                autoFocus
              />
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
