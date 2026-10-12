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
import type { CustomerDTO } from '@/lib/api/types';
import { customerKeys } from '../api/queries';
import { createCustomer, updateCustomer } from '../api/service';
import { createPartyFormSchema } from '../schemas/customer-schema';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerDTO | null;
}

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CustomerDialogBody
          key={customer?.id ?? 'new'}
          customer={customer}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

interface CustomerDialogBodyProps {
  customer?: CustomerDTO | null;
  onOpenChange: (open: boolean) => void;
}

interface CustomerFormState {
  name: string;
  phone: string;
  address: string;
  notes: string;
  opening_balance: number;
}

function CustomerDialogBody({ customer, onOpenChange }: CustomerDialogBodyProps) {
  const qc = useQueryClient();
  const t = useT();
  const isEdit = Boolean(customer);

  const save = useMutation({
    mutationFn: async (value: CustomerFormState) => {
      const payload = {
        name: value.name.trim(),
        phone: value.phone.trim() || undefined,
        address: value.address.trim() || undefined,
        notes: value.notes.trim() || undefined,
        openingBalance: toPaisa(Number(value.opening_balance || 0))
      };

      if (customer) {
        return updateCustomer(customer.id, payload);
      }
      return createCustomer({ ...payload, isActive: true });
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dukaan.party.customerUpdated') : t('dukaan.party.customerAdded'));
      void qc.invalidateQueries({ queryKey: customerKeys.all });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
      notes: customer?.notes ?? '',
      opening_balance: customer ? fromPaisa(customer.openingBalance) : 0
    },
    validators: { onSubmit: createPartyFormSchema(t) },
    onSubmit: ({ value }) => {
      save.mutate(value as CustomerFormState);
    }
  });

  return (
    <DialogContent className='flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
      <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
        <DialogTitle>
          {isEdit ? t('dukaan.party.customerEditTitle') : t('dukaan.party.customerAddTitle')}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? t('dukaan.party.customerEditDescription')
            : t('dukaan.party.customerAddDescription')}
        </DialogDescription>
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
                <field.TextField label={t('dukaan.party.customerOpeningBalance')} type='number' />
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
