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
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { fromPaisa, toPaisa } from '@/lib/dukaan/numbers';
import type { SupplierDTO } from '@/lib/api/types';
import { supplierKeys } from '../api/queries';
import { createSupplier, updateSupplier } from '../api/service';
import { createSupplierFormSchema } from '../schemas/supplier-schema';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import type {
  SupplierDialogProps,
  SupplierDialogBodyProps,
  SupplierFormState
} from '@/types/suppliers';

export function SupplierDialog({ open, onOpenChange, supplier }: SupplierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SupplierDialogBody
          key={supplier?.id ?? 'new'}
          supplier={supplier}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

function SupplierDialogBody({ supplier, onOpenChange }: SupplierDialogBodyProps) {
  const qc = useQueryClient();
  const t = useT();
  const isEdit = Boolean(supplier);

  const save = useMutation({
    mutationFn: async (value: SupplierFormState) => {
      const payload = {
        name: value.name.trim(),
        phone: value.phone?.trim() || undefined,
        address: value.address?.trim() || undefined,
        notes: value.notes?.trim() || undefined,
        openingBalance: toPaisa(Number(value.opening_balance || 0))
      };

      if (supplier) {
        return updateSupplier(supplier.id, payload);
      }
      return createSupplier({ ...payload, isActive: true });
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dukaan.supplier.updated') : t('dukaan.supplier.created'));
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      name: supplier?.name ?? '',
      phone: supplier?.phone ?? '',
      address: supplier?.address ?? '',
      notes: supplier?.notes ?? '',
      opening_balance: supplier ? fromPaisa(supplier.openingBalance) : 0
    },
    validators: { onSubmit: createSupplierFormSchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value as SupplierFormState);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <DialogContent className='flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
      <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
        <DialogTitle>
          {isEdit ? t('dukaan.supplier.editTitle') : t('dukaan.supplier.addTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit ? t('dukaan.supplier.editDescription') : t('dukaan.supplier.addDescription')}
        </DialogDescription>
      </DialogHeader>
      <form className='flex min-h-0 flex-1 flex-col' onSubmit={handleSubmit}>
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4'>
          <FieldGroup className='gap-4'>
            <form.AppField
              name='name'
              children={(field) => (
                <field.TextField
                  label={t('dukaan.party.name')}
                  required
                  disabled={supplier?.isSystem}
                  autoFocus={!supplier?.isSystem}
                  placeholder={t('dukaan.supplier.namePlaceholder')}
                />
              )}
            />
            <form.AppField
              name='phone'
              children={(field) => (
                <field.TextField
                  label={t('dukaan.party.phone')}
                  type='tel'
                  inputMode='numeric'
                  placeholder={t('users.phonePlaceholder')}
                  startIcon={Icons.phone}
                />
              )}
            />
            <form.AppField
              name='address'
              children={(field) => <field.TextField label={t('dukaan.party.address')} />}
            />
            <form.AppField
              name='opening_balance'
              children={(field) => (
                <field.TextField label={t('dukaan.party.supplierOpeningBalance')} type='number' />
              )}
            />
            <form.AppField
              name='notes'
              children={(field) => <field.TextareaField label={t('dukaan.party.notes')} />}
            />
          </FieldGroup>
        </div>
        <DialogFooter className='mx-0 mb-0 shrink-0'>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={save.isPending} />
          <DialogPrimaryButton mode={isEdit ? 'edit' : 'add'} loading={save.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
