'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import { toPaisa } from '@/lib/dukaan/numbers';
import { dukaanKeys } from '../api/queries';
import { partyFormSchema } from '../schemas/forms';
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

function SupplierDialogBody({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (value: {
      name: string;
      phone: string;
      address: string;
      notes: string;
      opening_balance: number;
    }) =>
      dukaan.createSupplier({
        name: value.name.trim(),
        phone: value.phone.trim(),
        address: value.address || undefined,
        notes: value.notes || undefined,
        opening_balance: toPaisa(value.opening_balance)
      }),
    onSuccess: () => {
      toast.success('Supplier added');
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
    validators: { onSubmit: partyFormSchema },
    onSubmit: ({ value }) => {
      create.mutate(value);
    }
  });

  return (
    <DialogContent className='flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
      <DialogHeader className='shrink-0 px-4 pt-4 pr-12'>
        <DialogTitle>Add supplier</DialogTitle>
        <DialogDescription>Create a supplier for purchases and dues.</DialogDescription>
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
              children={(field) => <field.TextField label='Name' required autoFocus />}
            />
            <form.AppField
              name='phone'
              children={(field) => (
                <field.TextField
                  label='Phone'
                  type='tel'
                  inputMode='numeric'
                  placeholder='03XXXXXXXXX'
                  startIcon={Icons.phone}
                  required
                />
              )}
            />
            <form.AppField
              name='address'
              children={(field) => <field.TextField label='Address' />}
            />
            <form.AppField
              name='opening_balance'
              children={(field) => (
                <field.TextField label='Opening balance (Rs, old dues)' type='number' />
              )}
            />
            <form.AppField
              name='notes'
              children={(field) => <field.TextareaField label='Notes' />}
            />
          </FieldGroup>
        </div>
        <DialogFooter className='mx-0 mb-0 shrink-0'>
          <DialogCancelButton onClick={() => onOpenChange(false)} />
          <DialogPrimaryButton mode='add' disabled={create.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function SuppliersHeaderAction() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type='button' size='sm' onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Add supplier
      </Button>
      <SupplierDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function SuppliersListClient() {
  return <SuppliersTable toolbarAction={<SuppliersHeaderAction />} />;
}
