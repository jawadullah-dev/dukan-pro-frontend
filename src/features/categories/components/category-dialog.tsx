'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useT } from '@/i18n/use-t';
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
import type { CategoryDialogProps, CategoryDialogBodyProps } from '@/types';
import { categoryKeys } from '../api/queries';
import { createCategory, updateCategory } from '../api/service';
import { createCategoryFormSchema } from '../schemas/category-schema';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CategoryDialogBody
          key={category?.id ?? 'new'}
          category={category}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

function CategoryDialogBody({ category, onOpenChange }: CategoryDialogBodyProps) {
  const qc = useQueryClient();
  const isEdit = Boolean(category);
  const t = useT();

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (category) return updateCategory(category.id, name);
      return createCategory(name);
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dukaan.category.updated') : t('dukaan.category.created'));
      void qc.invalidateQueries({ queryKey: categoryKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: category?.name ?? '' },
    validators: { onSubmit: createCategoryFormSchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader className='pe-12'>
        <DialogTitle>
          {isEdit ? t('dukaan.category.editTitle') : t('dukaan.category.addTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? t('dukaan.category.editDescription') : t('dukaan.category.addDescription')}
        </DialogDescription>
      </DialogHeader>
      <form className='grid gap-4' onSubmit={handleSubmit}>
        <FieldGroup>
          <form.AppField
            name='name'
            children={(field) => (
              <field.TextField
                label={t('dukaan.party.name')}
                required
                placeholder={t('dukaan.category.namePlaceholder')}
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
