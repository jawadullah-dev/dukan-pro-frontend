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
import { formatLabel, formatPkr } from '@/lib/dukaan/numbers';
import type { SoftCashWarning } from '@/lib/dukaan/types';
import { dukaanKeys } from '../api/queries';
import { reasonSchema } from '../schemas/forms';
import { DialogCancelButton, DialogConfirmButton } from './dialog-actions';
import { RowActionsMenu } from './row-actions-menu';

interface PaymentActionRow {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  method: string;
  customer_name?: string;
  sale_no?: string;
}

export function PaymentCellAction({ data }: { data: PaymentActionRow }) {
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
          <PaymentCancelBody
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

function PaymentCancelBody({
  data,
  onClose,
  onSuccess
}: {
  data: PaymentActionRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [warning, setWarning] = useState<SoftCashWarning | null>(null);

  const cancel = useMutation({
    mutationFn: ({ reason, confirm }: { reason: string; confirm?: boolean }) =>
      dukaan.cancelPayment(data.id, reason, 'customer', confirm),
    onSuccess: (res) => {
      if (res.cash_warning) {
        setWarning(res.cash_warning);
        toast.warning('Cash would go below zero — confirm to continue');
        return;
      }
      toast.success('Payment cancelled');
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: { onSubmit: reasonSchema },
    onSubmit: ({ value }) => {
      cancel.mutate({ reason: value.reason.trim(), confirm: false });
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>Cancel payment</DialogTitle>
        <DialogDescription>
          {data.customer_name ?? 'Walk-in'} · {formatPkr(data.amount)} · {formatLabel(data.method)}
          {data.sale_no ? ` · ${data.sale_no}` : ''}
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
            children={(field) => <field.TextareaField label='Reason' required />}
          />
        </FieldGroup>
        {warning ? (
          <div className='text-sm'>
            Soft overdraft: cash {formatPkr(warning.current_cash)} →{' '}
            {formatPkr(warning.projected_cash)}
            <div className='mt-2 flex gap-3'>
              <Button
                type='button'
                onClick={() =>
                  cancel.mutate({
                    reason: form.state.values.reason.trim(),
                    confirm: true
                  })
                }
              >
                Confirm cancel
              </Button>
              <Button type='button' variant='outline' onClick={() => setWarning(null)}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <DialogFooter>
            <DialogCancelButton onClick={onClose} />
            <DialogConfirmButton disabled={cancel.isPending} />
          </DialogFooter>
        )}
      </form>
    </DialogContent>
  );
}
