'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import { createClientRequestId, formatPkr, toPaisa } from '@/lib/dukaan/numbers';
import { customerQueryOptions, dukaanKeys } from '../api/queries';
import { partyFormSchema, receivePaymentSchema } from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';
import { CustomersTable } from './tables/commerce-tables';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CustomerDialog({ open, onOpenChange }: CustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <CustomerDialogBody key='new' onOpenChange={onOpenChange} /> : null}
    </Dialog>
  );
}

function CustomerDialogBody({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (value: {
      name: string;
      phone: string;
      address: string;
      notes: string;
      opening_balance: number;
    }) =>
      dukaan.createCustomer({
        name: value.name.trim(),
        phone: value.phone.trim(),
        address: value.address || undefined,
        notes: value.notes || undefined,
        opening_balance: toPaisa(value.opening_balance)
      }),
    onSuccess: () => {
      toast.success('Customer added');
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
        <DialogTitle>Add customer</DialogTitle>
        <DialogDescription>Create a customer for sales and Udhar.</DialogDescription>
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
              children={(field) => <field.TextField label='Opening Udhar (Rs)' type='number' />}
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

export function CustomersHeaderAction() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type='button' size='sm' onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Add customer
      </Button>
      <CustomerDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function CustomersListClient() {
  return <CustomersTable toolbarAction={<CustomersHeaderAction />} />;
}

export function CustomerLedgerClient({ id }: { id: string }) {
  const qc = useQueryClient();
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
          ? `Payment recorded (oldest first · receipt group ${group.slice(0, 12)}…)`
          : 'Payment recorded (oldest first)'
      );
      setClientRequestId(createClientRequestId());
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: { amount: undefined as number | undefined },
    validators: { onSubmit: receivePaymentSchema },
    onSubmit: async ({ value }) => {
      await pay.mutateAsync(value.amount!);
      form.reset();
    }
  });

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-xl font-semibold'>{data.name}</h3>
        <p className='text-muted-foreground text-sm'>
          {data.phone} · Current Udhar {formatPkr(data.udhar)}
        </p>
        {data.address ? <p className='text-muted-foreground text-sm'>{data.address}</p> : null}
        {data.notes ? <p className='text-muted-foreground text-sm'>{data.notes}</p> : null}
      </div>

      <form
        className='flex max-w-md flex-wrap items-end gap-2 rounded-lg border p-3'
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className='grid flex-1 gap-2'>
          <form.AppField
            name='amount'
            children={(field) => (
              <field.TextField
                label='Receive Udhar payment (Rs)'
                type='number'
                required
                description='Allocates oldest first · same receipt_group_id for the group'
              />
            )}
          />
        </div>
        <Button type='submit' disabled={pay.isPending}>
          Save payment
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Running</TableHead>
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
