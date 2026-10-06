'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
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
import { formatPkr } from '@/lib/dukaan/numbers';
import { dukaanKeys } from '../api/queries';
import { reasonSchema } from '../schemas/forms';
import { DialogCancelButton, DialogConfirmButton } from './dialog-actions';
import { RowActionsMenu } from './row-actions-menu';

interface SupplierPaymentActionRow {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  supplier_name?: string;
}

export function SupplierPaymentCellAction({ data }: { data: SupplierPaymentActionRow }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  if (data.status !== 'ACTIVE') return null;

  return (
    <>
      <RowActionsMenu
        actions={[
          {
            label: 'Cancel',
            icon: Icons.trash,
            variant: 'destructive',
            onClick: () => setOpen(true)
          }
        ]}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        {open ? (
          <SupplierPaymentCancelBody
            key={data.id}
            data={data}
            onClose={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false);
              void qc.invalidateQueries({ queryKey: dukaanKeys.all });
            }}
          />
        ) : null}
      </Dialog>
    </>
  );
}

function SupplierPaymentCancelBody({
  data,
  onClose,
  onSuccess
}: {
  data: SupplierPaymentActionRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const cancel = useMutation({
    mutationFn: (reason: string) => dukaan.cancelPayment(data.id, reason, 'supplier'),
    onSuccess: () => {
      toast.success('Supplier payment cancelled');
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: { onSubmit: reasonSchema },
    onSubmit: ({ value }) => {
      cancel.mutate(value.reason.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>Cancel supplier payment</DialogTitle>
        <DialogDescription>
          {data.supplier_name ?? 'Supplier'} · {formatPkr(data.amount)} ·{' '}
          {data.created_at.slice(0, 10)}
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
            name='reason'
            children={(field) => (
              <field.TextareaField
                label='Reason'
                required
                placeholder='Why are you cancelling this payment?'
                autoFocus
              />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogCancelButton onClick={onClose} disabled={cancel.isPending} />
          <DialogConfirmButton loading={cancel.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
