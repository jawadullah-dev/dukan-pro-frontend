'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useT } from '@/i18n/use-t';
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
import { createReasonSchema } from '../schemas/forms';
import { DialogCancelButton, DialogConfirmButton } from './dialog-actions';
import { RowActionsMenu } from './row-actions-menu';

interface SupplierPaymentActionRow {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  supplier_name?: string;
}

interface SupplierPaymentCellActionProps {
  data: SupplierPaymentActionRow;
}

export function SupplierPaymentCellAction({ data }: SupplierPaymentCellActionProps) {
  const qc = useQueryClient();
  const t = useT();
  const [open, setOpen] = useState(false);

  if (data.status !== 'ACTIVE') return null;

  return (
    <>
      <RowActionsMenu
        actions={[
          {
            label: t('dukaan.actions.cancel'),
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

interface SupplierPaymentCancelBodyProps {
  data: SupplierPaymentActionRow;
  onClose: () => void;
  onSuccess: () => void;
}

function SupplierPaymentCancelBody({ data, onClose, onSuccess }: SupplierPaymentCancelBodyProps) {
  const t = useT();
  const cancel = useMutation({
    mutationFn: (reason: string) => dukaan.cancelPayment(data.id, reason, 'supplier'),
    onSuccess: () => {
      toast.success(t('dukaan.actions.supplierPaymentCancelled'));
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: { onSubmit: createReasonSchema(t) },
    onSubmit: ({ value }) => {
      cancel.mutate(value.reason.trim());
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>{t('dukaan.actions.cancelSupplierPaymentTitle')}</DialogTitle>
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
                label={t('stock.reason')}
                required
                placeholder={t('dukaan.actions.cancelSupplierPaymentPlaceholder')}
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
