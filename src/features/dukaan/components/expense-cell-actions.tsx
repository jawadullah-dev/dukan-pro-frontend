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

interface ExpenseActionRow {
  id: string;
  expense_date: string;
  amount: number;
  description?: string;
  status: string;
}

export function ExpenseCellAction({ data }: { data: ExpenseActionRow }) {
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
          <ExpenseCancelBody
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

function ExpenseCancelBody({
  data,
  onClose,
  onSuccess
}: {
  data: ExpenseActionRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const cancel = useMutation({
    mutationFn: (reason: string) => dukaan.cancelExpense(data.id, reason),
    onSuccess: () => {
      toast.success('Expense cancelled');
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
        <DialogTitle>Cancel expense</DialogTitle>
        <DialogDescription>
          {data.expense_date} · {formatPkr(data.amount)}
          {data.description ? ` · ${data.description}` : ''}
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
                placeholder='Why are you cancelling this expense?'
                autoFocus
              />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogCancelButton onClick={onClose} />
          <DialogConfirmButton disabled={cancel.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
