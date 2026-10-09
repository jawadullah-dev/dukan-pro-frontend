'use client';

interface SupplierMutationValue {
  name: string;
  phone: string;
  address: string;
  notes: string;
  opening_balance: number;
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import { toPaisa } from '@/lib/dukaan/numbers';
import { dukaanKeys } from '../api/queries';
import { createPartyFormSchema } from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';
import { SuppliersTable } from './tables/commerce-tables';

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SupplierDialog({ open, onOpenChange }: SupplierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <SupplierDialogBody key='new' onOpenChange={onOpenChange} /> : null}
    </Dialog>
  );
}

interface SupplierDialogBodyProps {
  onOpenChange: (open: boolean) => void;
}

function SupplierDialogBody({ onOpenChange }: SupplierDialogBodyProps) {
  const qc = useQueryClient();
  const t = useT();

  const create = useMutation({
    mutationFn: (value: SupplierMutationValue) =>
      dukaan.createSupplier({
        name: value.name.trim(),
        phone: value.phone.trim(),
        address: value.address || undefined,
        notes: value.notes || undefined,
        opening_balance: toPaisa(value.opening_balance)
      }),
    onSuccess: () => {
      toast.success(t('dukaan.party.supplierAdded'));
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      notes: '',
      opening_balance: 0
    },
    validators: { onSubmit: createPartyFormSchema(t) },
    onSubmit: ({ value }) => {
      create.mutate(value);
    }
  });

  return (
    <DialogContent className='flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
      <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
        <DialogTitle>{t('dukaan.party.supplierAddTitle')}</DialogTitle>
        <DialogDescription>{t('dukaan.party.supplierAddDescription')}</DialogDescription>
      </DialogHeader>
      <form
        className='flex min-h-0 flex-1 flex-col'
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4'>
          <FieldGroup className='gap-4'>
            <form.AppField
              name='name'
              children={(field) => (
                <field.TextField label={t('dukaan.party.name')} required autoFocus />
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
                  required
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
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={create.isPending} />
          <DialogPrimaryButton mode='add' loading={create.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface SuppliersHeaderActionProps {
  onAdd?: () => void;
}

export function SuppliersHeaderAction({ onAdd }: SuppliersHeaderActionProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    if (onAdd) onAdd();
    else setOpen(true);
  };
  return (
    <>
      <Button type='button' size='sm' onClick={handleOpen}>
        <Icons.add className='me-2 h-4 w-4' />
        {t('common.addSupplier')}
      </Button>
      {onAdd ? null : <SupplierDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function SuppliersListClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <SuppliersTable toolbarAction={<SuppliersHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('common.addSupplier')} onClick={() => setOpen(true)} />
      <SupplierDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}
