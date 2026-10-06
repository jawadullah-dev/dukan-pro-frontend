'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
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
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { dukaan } from '@/lib/dukaan';
import {
  createClientRequestId,
  formatLabel,
  formatPkr,
  toPaisa,
  todayIsoDate
} from '@/lib/dukaan/numbers';
import type { SoftCashWarning } from '@/lib/dukaan/types';
import type { Product } from '@/lib/dukaan/types';
import {
  dukaanKeys,
  purchasesQueryOptions,
  suppliersQueryOptions,
  unitsQueryOptions
} from '../api/queries';
import { expenseFormSchema, stockAdjustSchema, supplierPaymentFormSchema } from '../schemas/forms';
import { DialogCancelButton, DialogPrimaryButton } from './dialog-actions';
import { FormEntitySelect } from './form-entity-select';
import {
  CashTable,
  ExpenseCategoriesTable,
  ExpensesTable,
  InventoryTable,
  MovementsTable,
  SupplierPaymentsTable
} from './tables/commerce-tables';
import { ExpenseCategoryDialog } from './expense-category-dialogs';

export function InventoryListClient() {
  return (
    <TablePageBody>
      <InventoryTable />
    </TablePageBody>
  );
}

export function InventoryMovementsClient() {
  return (
    <TablePageBody>
      <MovementsTable />
    </TablePageBody>
  );
}

type StockAdjustValues = {
  product_id: string;
  tracking_type?: Product['tracking_type'];
  inventory_unit_id: string;
  type: 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  counted_quantity: number;
  reason: string;
};

export function StockAdjustForm() {
  const qc = useQueryClient();
  const { data: units } = useSuspenseQuery(unitsQueryOptions());

  const save = useMutation({
    mutationFn: (value: StockAdjustValues) =>
      dukaan.adjustStock({
        product_id: value.product_id,
        inventory_unit_id: value.inventory_unit_id || undefined,
        type: value.type,
        counted_quantity: value.tracking_type === 'QUANTITY' ? value.counted_quantity : undefined,
        reason: value.reason
      }),
    onSuccess: () => {
      toast.success('Stock updated');
      form.reset();
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      product_id: '',
      tracking_type: undefined,
      inventory_unit_id: '',
      type: 'ADJUSTMENT',
      counted_quantity: 0,
      reason: ''
    } as StockAdjustValues,
    validators: { onSubmit: stockAdjustSchema },
    onSubmit: ({ value }) => {
      save.mutate(value);
    }
  });

  return (
    <form
      className='grid max-w-lg gap-3'
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className='gap-3'>
        <form.Field
          name='product_id'
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <FormEntitySelect<Product>
                name={field.name}
                label='Product'
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(id, product) => {
                  field.handleChange(id);
                  form.setFieldValue('tracking_type', product?.tracking_type);
                  form.setFieldValue('inventory_unit_id', '');
                }}
                isInvalid={isInvalid}
                errors={field.state.meta.errors}
                queryKey={dukaanKeys.products()}
                fetchPage={(filters) => dukaan.listProducts(filters)}
                placeholder='Product'
                searchPlaceholder='Search products...'
              />
            );
          }}
        />

        <form.AppField
          name='type'
          children={(field) => (
            <field.SelectField
              label='Type'
              required
              options={[
                { value: 'ADJUSTMENT', label: formatLabel('ADJUSTMENT') },
                { value: 'DAMAGED', label: formatLabel('DAMAGED') },
                { value: 'LOST', label: formatLabel('LOST') }
              ]}
            />
          )}
        />

        <form.Subscribe
          selector={(s) => ({
            trackingType: s.values.tracking_type,
            productId: s.values.product_id
          })}
          children={({ trackingType, productId }) =>
            trackingType === 'SERIALIZED' ? (
              <form.AppField
                name='inventory_unit_id'
                children={(field) => (
                  <field.SelectField
                    label='IMEI1 / IMEI2'
                    required
                    placeholder='IMEI'
                    options={units
                      .filter((u) => u.product_id === productId)
                      .map((u) => ({
                        value: u.id,
                        label: u.imei2 ? `${u.imei1} / ${u.imei2}` : u.imei1
                      }))}
                  />
                )}
              />
            ) : (
              <form.AppField
                name='counted_quantity'
                children={(field) => <field.TextField label='Counted quantity' type='number' />}
              />
            )
          }
        />

        <form.AppField
          name='reason'
          children={(field) => <field.TextareaField label='Reason' required />}
        />
      </FieldGroup>
      <Button type='submit' isLoading={save.isPending}>
        Save adjustment
      </Button>
    </form>
  );
}

function ExpenseCreateForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [warning, setWarning] = useState<SoftCashWarning | null>(null);

  const create = useMutation({
    mutationFn: ({
      value,
      confirm_overdraft
    }: {
      value: {
        category_id: string;
        amount: number;
        expense_date: string;
        description: string;
      };
      confirm_overdraft?: boolean;
    }) =>
      dukaan.createExpense({
        category_id: value.category_id,
        amount: toPaisa(value.amount),
        expense_date: value.expense_date,
        description: value.description || undefined,
        confirm_overdraft
      }),
    onSuccess: (res) => {
      if (res.cash_warning) {
        setWarning(res.cash_warning);
        toast.warning('Cash warning — confirm to continue');
        return;
      }
      toast.success('Expense saved');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      category_id: '',
      amount: 0,
      expense_date: todayIsoDate(),
      description: ''
    },
    validators: { onSubmit: expenseFormSchema },
    onSubmit: ({ value }) => {
      create.mutate({ value, confirm_overdraft: false });
    }
  });

  return (
    <form
      className='grid gap-4'
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className='gap-4'>
        <form.Field
          name='category_id'
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <FormEntitySelect
                name={field.name}
                label='Category'
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(id) => field.handleChange(id)}
                isInvalid={isInvalid}
                errors={field.state.meta.errors}
                queryKey={dukaanKeys.expenseCategories()}
                fetchPage={(filters) => dukaan.listExpenseCategories(filters)}
                placeholder='Select category'
                searchPlaceholder='Search categories...'
              />
            );
          }}
        />
        <form.AppField
          name='amount'
          children={(field) => <field.TextField label='Amount (Rs)' type='number' required />}
        />
        <form.AppField
          name='expense_date'
          children={(field) => <field.TextField label='Expense date' type='date' required />}
        />
        <form.AppField
          name='description'
          children={(field) => <field.TextareaField label='Description' />}
        />
      </FieldGroup>
      {warning ? (
        <div className='text-sm'>
          Soft overdraft: cash {formatPkr(warning.current_cash)} →{' '}
          {formatPkr(warning.projected_cash)}
          <div className='mt-2 flex gap-3'>
            <Button
              type='button'
              isLoading={create.isPending}
              onClick={() => create.mutate({ value: form.state.values, confirm_overdraft: true })}
            >
              Confirm
            </Button>
            <Button
              type='button'
              variant='outline'
              disabled={create.isPending}
              onClick={() => setWarning(null)}
            >
              Back
            </Button>
          </div>
        </div>
      ) : (
        <DialogFooter>
          <DialogCancelButton onClick={onDone} disabled={create.isPending} />
          <DialogPrimaryButton mode='save' loading={create.isPending} />
        </DialogFooter>
      )}
    </form>
  );
}

export function ExpensesHeaderAction({
  className,
  onAdd
}: {
  className?: string;
  onAdd: () => void;
}) {
  const t = useT();
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.addExpense')}
    </Button>
  );
}

export function ExpensesClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleOpen = () => {
    setFormKey((k) => k + 1);
    setOpen(true);
  };

  return (
    <TablePageBody>
      <ExpensesTable toolbarAction={<ExpensesHeaderAction className='h-8' onAdd={handleOpen} />} />
      <FloatingActionButton label={t('common.addExpense')} onClick={handleOpen} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add expense</DialogTitle>
            <DialogDescription>Record an operating expense from cash.</DialogDescription>
          </DialogHeader>
          {open ? (
            <Suspense fallback={<p className='text-muted-foreground text-sm'>Loading…</p>}>
              <ExpenseCreateForm key={formKey} onDone={() => setOpen(false)} />
            </Suspense>
          ) : null}
        </DialogContent>
      </Dialog>
    </TablePageBody>
  );
}

export function ExpenseCategoriesHeaderAction({ onAdd }: { onAdd?: () => void }) {
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
        {t('common.addCategory')}
      </Button>
      {onAdd ? null : <ExpenseCategoryDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function ExpenseCategoriesClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <TablePageBody>
      <ExpenseCategoriesTable
        toolbarAction={<ExpenseCategoriesHeaderAction onAdd={() => setOpen(true)} />}
      />
      <FloatingActionButton label={t('common.addCategory')} onClick={() => setOpen(true)} />
      <ExpenseCategoryDialog open={open} onOpenChange={setOpen} />
    </TablePageBody>
  );
}

export function CashLedgerClient() {
  return (
    <TablePageBody>
      <CashTable />
    </TablePageBody>
  );
}

function SupplierPaymentCreateForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const { data: suppliers } = useSuspenseQuery(suppliersQueryOptions({ limit: 100 }));
  const { data: purchases } = useSuspenseQuery(purchasesQueryOptions({ limit: 100 }));
  const [clientRequestId] = useState(() => createClientRequestId());
  const [warning, setWarning] = useState<SoftCashWarning | null>(null);

  const save = useMutation({
    mutationFn: ({
      value,
      confirm_overdraft
    }: {
      value: {
        supplier_id: string;
        purchase_id: string;
        amount: number;
        payment_date: string;
        notes: string;
      };
      confirm_overdraft?: boolean;
    }) =>
      dukaan.createSupplierPayment({
        supplier_id: value.supplier_id,
        purchase_id: value.purchase_id === '__opening__' ? undefined : value.purchase_id,
        amount: toPaisa(value.amount),
        payment_date: value.payment_date,
        notes: value.notes || undefined,
        confirm_overdraft,
        client_request_id: clientRequestId
      }),
    onSuccess: (res) => {
      if (res.cash_warning) {
        setWarning(res.cash_warning);
        toast.warning('Cash warning — confirm to continue');
        return;
      }
      toast.success('Supplier payment saved');
      void qc.invalidateQueries({ queryKey: dukaanKeys.all });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      supplier_id: '',
      purchase_id: '__opening__',
      amount: 0,
      payment_date: todayIsoDate(),
      notes: ''
    },
    validators: { onSubmit: supplierPaymentFormSchema },
    onSubmit: ({ value }) => {
      save.mutate({ value, confirm_overdraft: false });
    }
  });

  const supplierOptions = suppliers.items
    .filter((s) => s.is_active)
    .map((s) => ({ value: s.id, label: s.name }));

  return (
    <form
      className='grid gap-4'
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className='gap-4'>
        <form.AppField
          name='supplier_id'
          listeners={{
            onChange: () => {
              form.setFieldValue('purchase_id', '__opening__');
            }
          }}
          children={(field) => (
            <field.SelectField
              label='Supplier'
              required
              placeholder='Supplier'
              options={supplierOptions}
            />
          )}
        />
        <form.Subscribe
          selector={(s) => s.values.supplier_id}
          children={(supplierId) => (
            <form.AppField
              name='purchase_id'
              children={(field) => (
                <field.SelectField
                  label='Purchase (optional)'
                  placeholder='Purchase'
                  options={[
                    { value: '__opening__', label: 'Opening balance / general' },
                    ...purchases.items
                      .filter(
                        (p) =>
                          p.supplier_id === supplierId &&
                          p.status === 'ACTIVE' &&
                          !p.is_opening_stock
                      )
                      .map((p) => ({
                        value: p.id,
                        label: `${p.purchase_no} · ${formatPkr(p.total_amount)}`
                      }))
                  ]}
                />
              )}
            />
          )}
        />
        <form.AppField
          name='amount'
          children={(field) => <field.TextField label='Amount (Rs)' type='number' required />}
        />
        <form.AppField
          name='payment_date'
          children={(field) => <field.TextField label='Payment date' type='date' required />}
        />
        <form.AppField name='notes' children={(field) => <field.TextareaField label='Notes' />} />
      </FieldGroup>
      {warning ? (
        <div className='text-sm'>
          Soft overdraft confirm needed ({formatPkr(warning.projected_cash)})
          <div className='mt-2 flex gap-3'>
            <Button
              type='button'
              isLoading={save.isPending}
              onClick={() => save.mutate({ value: form.state.values, confirm_overdraft: true })}
            >
              Confirm
            </Button>
            <Button
              type='button'
              variant='outline'
              disabled={save.isPending}
              onClick={() => setWarning(null)}
            >
              Back
            </Button>
          </div>
        </div>
      ) : (
        <DialogFooter>
          <DialogCancelButton onClick={onDone} disabled={save.isPending} />
          <DialogPrimaryButton mode='save' loading={save.isPending} />
        </DialogFooter>
      )}
    </form>
  );
}

export function SupplierPaymentsHeaderAction({
  className,
  onAdd
}: {
  className?: string;
  onAdd: () => void;
}) {
  const t = useT();
  return (
    <Button type='button' className={className ?? 'h-8'} onClick={onAdd}>
      <Icons.add className='me-2 h-4 w-4' />
      {t('common.addPayment')}
    </Button>
  );
}

export function SupplierPaymentsClient() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleOpen = () => {
    setFormKey((k) => k + 1);
    setOpen(true);
  };

  return (
    <TablePageBody>
      <SupplierPaymentsTable
        toolbarAction={<SupplierPaymentsHeaderAction className='h-8' onAdd={handleOpen} />}
      />
      <FloatingActionButton label={t('common.addPayment')} onClick={handleOpen} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add supplier payment</DialogTitle>
            <DialogDescription>
              Pay a supplier against a purchase or opening balance.
            </DialogDescription>
          </DialogHeader>
          {open ? (
            <Suspense fallback={<p className='text-muted-foreground text-sm'>Loading…</p>}>
              <SupplierPaymentCreateForm key={formKey} onDone={() => setOpen(false)} />
            </Suspense>
          ) : null}
        </DialogContent>
      </Dialog>
    </TablePageBody>
  );
}
