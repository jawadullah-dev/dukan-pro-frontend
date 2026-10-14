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
import type { BrandDTO } from '@/lib/api/types';
import type { BrandDialogProps, BrandDialogBodyProps } from '@/types';
import { brandKeys } from '../api/queries';
import { createBrand, updateBrand } from '../api/service';
import { createBrandFormSchema } from '../schemas/brand-schema';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';

export function BrandDialog({ open, onOpenChange, brand }: BrandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <BrandDialogBody key={brand?.id ?? 'new'} brand={brand} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

function BrandDialogBody({ brand, onOpenChange }: BrandDialogBodyProps) {
  const qc = useQueryClient();
  const isEdit = Boolean(brand);
  const t = useT();

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (brand) return updateBrand(brand.id, name);
      return createBrand(name);
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dukaan.brand.updated') : t('dukaan.brand.created'));
      void qc.invalidateQueries({ queryKey: brandKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { name: brand?.name ?? '' },
    validators: { onSubmit: createBrandFormSchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader className='pe-12'>
        <DialogTitle>
          {isEdit ? t('dukaan.brand.editTitle') : t('dukaan.brand.addTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? t('dukaan.brand.editDescription') : t('dukaan.brand.addDescription')}
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
                placeholder={t('dukaan.brand.namePlaceholder')}
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
