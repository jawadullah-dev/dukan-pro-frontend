'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { TablePageBody } from '@/components/layout/table-page-body';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import { createClientRequestId, formatPkr, toPaisa } from '@/lib/dukaan/numbers';
import { customerQueryOptions, dukaanKeys } from '@/features/dukaan/api/queries';
import { createReceivePaymentSchema } from '../schemas/customer-schema';
import { CustomerDialog } from './customer-dialog';
import { CustomersTable } from './customers-table';
import type { CustomersHeaderActionProps, CustomerLedgerClientProps } from '@/types';

export function CustomersHeaderAction({ onAdd }: CustomersHeaderActionProps) {
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
        {t('common.addCustomer')}
      </Button>
      {onAdd ? null : <CustomerDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function CustomersListClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <CustomersTable toolbarAction={<CustomersHeaderAction onAdd={() => setOpen(true)} />} />
      <FloatingActionButton label={t('common.addCustomer')} onClick={() => setOpen(true)} />
      <CustomerDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}

export function CustomerLedgerClient({ id }: CustomerLedgerClientProps) {
  const qc = useQueryClient();
  const t = useT();
  const { data } = useSuspenseQuery(customerQueryOptions(id));
  const [clientRequestId, setClientRequestId] = useState(() => createClientRequestId());

  const pay = useMutation({
    mutationFn: (amount: number) =>
      dukaan.receiveCustomerPayment({
        customer_id: id,
        amount: toPaisa(amount),
        client_request_id: clientRequestId
      }),
    onSuccess: (res) => {
      const group = res.payments[0]?.receipt_group_id;
      toast.success(
        group
          ? t('dukaan.party.paymentRecordedWithGroup', { group: group.slice(0, 12) })
          : t('dukaan.party.paymentRecorded')
      );
      setClientRequestId(createClientRequestId());
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { amount: undefined as number | undefined },
    validators: { onSubmit: createReceivePaymentSchema(t) },
    onSubmit: async ({ value }) => {
      if (value.amount != null) await pay.mutateAsync(value.amount);
      form.reset();
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-xl font-semibold'>{data.name}</h3>
        <p className='text-muted-foreground text-sm'>
          {data.phone} · {t('dukaan.party.currentUdhar')} {formatPkr(data.udhar)}
        </p>
        {data.address ? <p className='text-muted-foreground text-sm'>{data.address}</p> : null}
        {data.notes ? <p className='text-muted-foreground text-sm'>{data.notes}</p> : null}
      </div>

      <form
        className='flex max-w-md flex-wrap items-end gap-2 rounded-lg border p-3'
        onSubmit={handleSubmit}
      >
        <div className='grid flex-1 gap-2'>
          <form.AppField
            name='amount'
            children={(field) => (
              <field.TextField
                label={t('dukaan.party.receivePayment')}
                type='number'
                required
                description={t('dukaan.party.paymentAllocationHint')}
              />
            )}
          />
        </div>
        <Button type='submit' isLoading={pay.isPending}>
          {t('dukaan.party.savePayment')}
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('dukaan.party.date')}</TableHead>
            <TableHead>{t('dukaan.party.entry')}</TableHead>
            <TableHead>{t('dukaan.party.amount')}</TableHead>
            <TableHead>{t('dukaan.party.running')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.ledger.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date.slice(0, 10)}</TableCell>
              <TableCell>{row.label}</TableCell>
              <TableCell>{formatPkr(row.amount)}</TableCell>
              <TableCell>{formatPkr(row.running_balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
