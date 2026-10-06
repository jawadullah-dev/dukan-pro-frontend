'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { t } from '@/i18n';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import {
  createClientRequestId,
  formatLabel,
  formatPkr,
  fromPaisa,
  toPaisa
} from '@/lib/dukaan/numbers';
import type { SoftCashWarning } from '@/lib/dukaan/types';
import type { Product } from '@/lib/dukaan/types';
import { dukaanKeys, saleQueryOptions, unitsQueryOptions } from '../api/queries';
import { ACTION_LABELS } from '../constants/ui';
import { reasonSchema, saleFormSchema } from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';
import { FormEntitySelect } from './form-entity-select';
import { SalesTable } from './tables/commerce-tables';

function SaleCreateDialog({
  open,
  onOpenChange,
  clearDefaultQuery
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearDefaultQuery?: boolean;
}) {
  const router = useRouter();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next && clearDefaultQuery) router.replace('/dashboard/sales');
      }}
    >
      <DialogContent className='flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
          <DialogTitle>New sale</DialogTitle>
          <DialogDescription>
            Phones require a customer; walk-in accessories OK; Udhar needs customer
          </DialogDescription>
        </DialogHeader>
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4'>
          <Suspense fallback={<p className='text-muted-foreground text-sm'>Loading…</p>}>
            <SaleCreateForm onDone={() => onOpenChange(false)} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SalesHeaderAction({ className, onAdd }: { className?: string; onAdd: () => void }) {
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.newSale')}
    </Button>
  );
}

export function SalesListClient({ defaultOpenAdd = false }: { defaultOpenAdd?: boolean }) {
  const [open, setOpen] = useState(defaultOpenAdd);

  return (
    <TablePageBody>
      <SalesTable
        toolbarAction={<SalesHeaderAction className='h-8' onAdd={() => setOpen(true)} />}
      />
      <FloatingActionButton label={t('common.newSale')} onClick={() => setOpen(true)} />
      <SaleCreateDialog open={open} onOpenChange={setOpen} clearDefaultQuery={defaultOpenAdd} />
    </TablePageBody>
  );
}

function imeiLabel(imei1: string, imei2?: string): string {
  return imei2 ? `${imei1} / ${imei2}` : imei1;
}

const emptySaleLine: {
  product_id: string;
  quantity: number;
  unit_price: number;
  inventory_unit_id: string;
  tracking_type?: Product['tracking_type'];
} = {
  product_id: '',
  quantity: 1,
  unit_price: 0,
  inventory_unit_id: ''
};

export function SaleCreateForm({ onDone }: { onDone?: () => void }) {
  const qc = useQueryClient();
  const { data: units } = useSuspenseQuery(unitsQueryOptions());
  const [clientRequestId] = useState(() => createClientRequestId());

  const save = useMutation({
    mutationFn: (value: {
      customer_id: string;
      discount: number;
      paid_now: number;
      method: 'CASH' | 'BANK' | 'MOBILE_WALLET';
      lines: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        inventory_unit_id?: string;
        tracking_type?: Product['tracking_type'];
      }>;
    }) =>
      dukaan.createSale({
        customer_id: value.customer_id === '__walkin__' ? undefined : value.customer_id,
        discount: toPaisa(value.discount),
        paid_now: toPaisa(value.paid_now),
        method: value.method,
        client_request_id: clientRequestId,
        lines: value.lines.map((l) => ({
          product_id: l.product_id,
          quantity: l.quantity,
          unit_price: toPaisa(l.unit_price),
          inventory_unit_id: l.inventory_unit_id || undefined
        }))
      }),
    onSuccess: (res) => {
      if (res.below_cost_warning) {
        toast.warning('One or more items sold below cost (allowed)');
      }
      toast.success(`Sale ${res.sale.sale_no} saved`);
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      window.location.href = `/dashboard/sales/${res.sale.id}`;
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      customer_id: '__walkin__',
      discount: 0,
      paid_now: 0,
      method: 'CASH' as 'CASH' | 'BANK' | 'MOBILE_WALLET',
      lines: [{ ...emptySaleLine }]
    },
    validators: { onSubmit: saleFormSchema },
    onSubmit: ({ value }) => {
      save.mutate(value);
    }
  });

  return (
    <form
      className='space-y-4'
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className='max-w-md gap-3'>
        <form.Subscribe
          selector={(s) => s.values.lines}
          children={(lines) => {
            const hasPhone = lines.some((l) => l.tracking_type === 'SERIALIZED');
            return (
              <form.Field
                name='customer_id'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FormEntitySelect
                      name={field.name}
                      label={
                        hasPhone
                          ? 'Customer (required for phones)'
                          : 'Customer (required for Udhar)'
                      }
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onValueChange={(id) => field.handleChange(id || '__walkin__')}
                      isInvalid={isInvalid}
                      errors={field.state.meta.errors}
                      queryKey={dukaanKeys.customers()}
                      fetchPage={(filters) => dukaan.listCustomers(filters)}
                      placeholder='Walk-in or customer'
                      searchPlaceholder='Search customers...'
                      selectedLabel={field.state.value === '__walkin__' ? 'Walk-in' : undefined}
                      extraItems={[
                        {
                          id: '__walkin__',
                          name: 'Walk-in (accessories, full cash only)'
                        }
                      ]}
                    />
                  );
                }}
              />
            );
          }}
        />
      </FieldGroup>

      <div className='space-y-3'>
        <form.AppField
          name='lines'
          mode='array'
          children={(field) => (
            <>
              {field.state.value.map((_, idx) => (
                <div
                  key={idx}
                  className='relative grid gap-2 rounded-lg border p-3 pr-24 md:grid-cols-4'
                >
                  {field.state.value.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-2 top-2 h-7 text-muted-foreground hover:text-destructive'
                      onClick={() => field.removeValue(idx)}
                    >
                      <Icons.trash className='mr-1 h-4 w-4' />
                      {ACTION_LABELS.remove}
                    </Button>
                  )}
                  <div className='md:col-span-2'>
                    <form.Field
                      name={`lines[${idx}].product_id`}
                      children={(subField) => {
                        const isInvalid =
                          subField.state.meta.isTouched && !subField.state.meta.isValid;
                        return (
                          <FormEntitySelect<Product>
                            name={subField.name}
                            label='Product'
                            required
                            value={subField.state.value}
                            onBlur={subField.handleBlur}
                            onValueChange={(id, product) => {
                              subField.handleChange(id);
                              form.setFieldValue(
                                `lines[${idx}].unit_price`,
                                product ? fromPaisa(product.default_selling_price) : 0
                              );
                              form.setFieldValue(
                                `lines[${idx}].tracking_type`,
                                product?.tracking_type
                              );
                              form.setFieldValue(`lines[${idx}].inventory_unit_id`, '');
                              form.setFieldValue(`lines[${idx}].quantity`, 1);
                            }}
                            isInvalid={isInvalid}
                            errors={subField.state.meta.errors}
                            queryKey={dukaanKeys.products()}
                            fetchPage={(filters) => dukaan.listProducts(filters)}
                            placeholder='Product'
                            searchPlaceholder='Search products...'
                          />
                        );
                      }}
                    />
                  </div>
                  <form.Subscribe
                    selector={(s) => ({
                      trackingType: s.values.lines[idx]?.tracking_type,
                      productId: s.values.lines[idx]?.product_id
                    })}
                    children={({ trackingType, productId }) =>
                      trackingType === 'SERIALIZED' ? (
                        <div className='md:col-span-2'>
                          <form.AppField
                            name={`lines[${idx}].inventory_unit_id`}
                            children={(subField) => (
                              <subField.SelectField
                                label='IMEI1 / IMEI2'
                                required
                                placeholder='Pick IMEI'
                                options={units
                                  .filter((u) => u.product_id === productId)
                                  .map((u) => ({
                                    value: u.id,
                                    label: `${imeiLabel(u.imei1, u.imei2)} (${formatLabel(u.condition)})`
                                  }))}
                              />
                            )}
                          />
                        </div>
                      ) : (
                        <form.AppField
                          name={`lines[${idx}].quantity`}
                          children={(subField) => (
                            <subField.TextField label='Qty' type='number' required />
                          )}
                        />
                      )
                    }
                  />
                  <form.AppField
                    name={`lines[${idx}].unit_price`}
                    children={(subField) => (
                      <subField.TextField label='Unit price (Rs)' type='number' required />
                    )}
                  />
                </div>
              ))}
              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => field.pushValue({ ...emptySaleLine })}
                >
                  <Icons.add className='mr-2 h-4 w-4' />
                  Add item
                </Button>
              </div>
            </>
          )}
        />
      </div>

      <div className='grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2'>
        <form.AppField
          name='discount'
          children={(field) => (
            <field.TextField label='Sale discount (Rs)' type='number' required />
          )}
        />
        <form.AppField
          name='paid_now'
          children={(field) => <field.TextField label='Paid now (Rs)' type='number' required />}
        />
        <form.AppField
          name='method'
          children={(field) => (
            <field.SelectField
              label='Payment method'
              required
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'BANK', label: 'Bank' },
                { value: 'MOBILE_WALLET', label: 'Mobile wallet' }
              ]}
            />
          )}
        />
        <form.Subscribe
          selector={(s) => ({
            lines: s.values.lines,
            discount: s.values.discount,
            paidNow: s.values.paid_now
          })}
          children={({ lines, discount, paidNow }) => {
            const subtotalRs = lines.reduce(
              (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
              0
            );
            const totalRs = Math.max(0, subtotalRs - (Number(discount) || 0));
            const udharRs = Math.max(0, totalRs - (Number(paidNow) || 0));
            return (
              <p className='flex items-center text-muted-foreground text-sm sm:col-span-2'>
                Subtotal {formatPkr(toPaisa(subtotalRs))} · Total {formatPkr(toPaisa(totalRs))} ·
                Udhar {formatPkr(toPaisa(udharRs))}
              </p>
            );
          }}
        />
      </div>

      <DialogFooter className='mx-0 mb-0 px-0'>
        {onDone ? <DialogCancelButton onClick={onDone} disabled={save.isPending} /> : null}
        <DialogPrimaryButton mode='save' loading={save.isPending} />
      </DialogFooter>
    </form>
  );
}

export function SaleDetailClient({ id }: { id: string }) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(saleQueryOptions(id));
  const [warning, setWarning] = useState<SoftCashWarning | null>(null);

  const cancel = useMutation({
    mutationFn: ({ reason, confirm }: { reason: string; confirm?: boolean }) =>
      dukaan.cancelSale(id, reason, confirm),
    onSuccess: (res) => {
      if (res.cash_warning) {
        setWarning(res.cash_warning);
        toast.warning('Cash would go below zero — confirm to reverse payment');
        return;
      }
      toast.success('Sale cancelled');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
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
    <div className='space-y-4'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-xl font-semibold'>{data.sale_no}</h3>
          <p className='text-muted-foreground text-sm'>
            {data.customer?.name ?? 'Walk-in'} · {data.sale_date} · Outstanding{' '}
            {formatPkr(data.outstanding)}
          </p>
          <Badge variant={data.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {formatLabel(data.status)}
          </Badge>
        </div>
        <Link
          href={`/dashboard/sales/${id}/receipt`}
          className='border-border inline-flex h-8 items-center rounded-lg border px-2.5 text-sm'
        >
          PDF / Print receipt
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>IMEI1</TableHead>
            <TableHead>IMEI2</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Line</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product?.name ?? item.product_id}</TableCell>
              <TableCell>{item.unit?.imei1 ?? '—'}</TableCell>
              <TableCell>{item.unit?.imei2 ?? '—'}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{formatPkr(item.unit_price)}</TableCell>
              <TableCell>{formatPkr(item.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.payments.length > 0 ? (
        <div className='space-y-1 text-sm'>
          <p className='font-medium'>Payments</p>
          {data.payments.map((p) => (
            <p key={p.id} className='text-muted-foreground'>
              {formatPkr(p.amount)} · {formatLabel(p.method)} · group{' '}
              <span className='font-mono text-xs'>{p.receipt_group_id}</span>
              {p.status === 'CANCELLED' ? ' (cancelled)' : ''}
            </p>
          ))}
        </div>
      ) : null}

      <p className='text-sm'>
        Subtotal {formatPkr(data.subtotal)} · Discount {formatPkr(data.discount)} · Total{' '}
        {formatPkr(data.total_amount)}
      </p>

      {data.status === 'ACTIVE' ? (
        <form
          className='grid max-w-lg gap-2 rounded-lg border p-3'
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name='reason'
              children={(field) => <field.TextareaField label='Cancel with reason' required />}
            />
          </FieldGroup>
          {warning ? (
            <div className='text-sm'>
              Cash {formatPkr(warning.current_cash)} → {formatPkr(warning.projected_cash)}. Confirm?
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
                  Confirm cancel
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  disabled={cancel.isPending}
                  onClick={() => setWarning(null)}
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <Button type='submit' variant='destructive' isLoading={cancel.isPending}>
              Cancel sale
            </Button>
          )}
        </form>
      ) : (
        <p className='text-muted-foreground text-sm'>
          Cancelled: {data.cancel_reason} ({data.cancelled_at})
        </p>
      )}
    </div>
  );
}

export function SaleReceiptClient({ id }: { id: string }) {
  const { data } = useSuspenseQuery(saleQueryOptions(id));
  const receiptGroup = data.payments.find((p) => p.status === 'ACTIVE')?.receipt_group_id;
  return (
    <div className='mx-auto max-w-lg space-y-4 rounded-lg border bg-white p-6 text-black print:border-0'>
      <div className='text-center'>
        <h1 className='text-xl font-bold'>{data.shop?.name}</h1>
        <p className='text-sm'>{data.shop?.address}</p>
        <p className='mt-2 font-medium'>Receipt {data.sale_no}</p>
        <p className='text-sm'>{data.sale_date}</p>
        {receiptGroup ? (
          <p className='text-muted-foreground text-xs'>Group {receiptGroup}</p>
        ) : null}
      </div>
      <div className='text-sm'>
        Customer: {data.customer?.name ?? 'Walk-in'}
        {data.customer?.phone ? ` · ${data.customer.phone}` : ''}
      </div>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b text-left'>
            <th className='py-1'>Item</th>
            <th>IMEI</th>
            <th>Qty</th>
            <th className='text-right'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} className='border-b'>
              <td className='py-1'>{item.product?.name}</td>
              <td>{item.unit ? imeiLabel(item.unit.imei1, item.unit.imei2) : '—'}</td>
              <td>{item.quantity}</td>
              <td className='text-right'>{formatPkr(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='space-y-1 text-sm'>
        <div className='flex justify-between'>
          <span>Subtotal</span>
          <span>{formatPkr(data.subtotal)}</span>
        </div>
        <div className='flex justify-between'>
          <span>Discount</span>
          <span>{formatPkr(data.discount)}</span>
        </div>
        <div className='flex justify-between font-semibold'>
          <span>Total</span>
          <span>{formatPkr(data.total_amount)}</span>
        </div>
        <div className='flex justify-between'>
          <span>Paid</span>
          <span>{formatPkr(data.total_amount - data.outstanding)}</span>
        </div>
        <div className='flex justify-between'>
          <span>Balance</span>
          <span>{formatPkr(data.outstanding)}</span>
        </div>
      </div>
      <Button className='print:hidden' onClick={() => window.print()}>
        Print
      </Button>
    </div>
  );
}
