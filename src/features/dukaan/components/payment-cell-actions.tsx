'use client';

interface CancelPaymentVariables {
  reason: string;
  confirm?: boolean;
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useT } from '@/i18n/use-t';
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
import { createReasonSchema } from '../schemas/forms';
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

interface PaymentCellActionProps {
  data: PaymentActionRow;
}

export function PaymentCellAction({ data }: PaymentCellActionProps) {
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

interface PaymentCancelBodyProps {
  data: PaymentActionRow;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentCancelBody({ data, onClose, onSuccess }: PaymentCancelBodyProps) {
  const [warning, setWarning] = useState<SoftCashWarning | null>(null);
  const t = useT();

  const cancel = useMutation({
    mutationFn: ({ reason, confirm }: CancelPaymentVariables) =>
      dukaan.cancelPayment(data.id, reason, 'customer', confirm),
    onSuccess: (res) => {
      if (res.cash_warning) {
        setWarning(res.cash_warning);
        toast.warning(t('dukaan.actions.cashBelowZeroWarning'));
        return;
      }
      toast.success(t('dukaan.actions.paymentCancelled'));
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { reason: '' },
    validators: { onSubmit: createReasonSchema(t) },
    onSubmit: ({ value }) => {
      cancel.mutate({ reason: value.reason.trim(), confirm: false });
    }
  });

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader>
        <DialogTitle>{t('dukaan.actions.cancelPaymentTitle')}</DialogTitle>
        <DialogDescription>
          {data.customer_name ?? t('dukaan.sale.walkInLabel')} · {formatPkr(data.amount)} ·{' '}
          {formatLabel(data.method)}
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
            children={(field) => (
              <field.TextareaField label={t('dukaan.actions.reason')} required />
            )}
          />
        </FieldGroup>
        {warning ? (
          <div className='text-sm'>
            {t('dukaan.actions.softOverdraft')}:{' '}
            {t('dukaan.actions.cashArrow', {
              current: formatPkr(warning.current_cash),
              projected: formatPkr(warning.projected_cash)
            })}
            <div className='mt-2 flex gap-3'>
              <Button
                type='button'
                isLoading={cancel.isPending}
                onClick={() =>
                  cancel.mutate({
                    reason: form.state.values.reason.trim(),
                    confirm: true
                  })
                }
              >
                {t('dukaan.actions.confirmCancel')}
              </Button>
              <Button
                type='button'
                variant='outline'
                disabled={cancel.isPending}
                onClick={() => setWarning(null)}
              >
                {t('common.back')}
              </Button>
            </div>
          </div>
        ) : (
          <DialogFooter>
            <DialogCancelButton onClick={onClose} disabled={cancel.isPending} />
            <DialogConfirmButton loading={cancel.isPending} />
          </DialogFooter>
        )}
      </form>
    </DialogContent>
  );
}
