import * as z from 'zod';

export const nameOnlySchema = z.object({
  name: z.string().trim().min(1, 'Name is required')
});

export const reasonSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required')
});

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  category_id: z.string().min(1, 'Category is required'),
  brand_id: z.string().min(1, 'Brand is required'),
  tracking_type: z.enum(['SERIALIZED', 'QUANTITY']),
  default_purchase_price: z
    .number({ error: 'Purchase price is required' })
    .min(0, 'Must be 0 or more'),
  default_selling_price: z
    .number({ error: 'Selling price is required' })
    .min(0, 'Must be 0 or more'),
  low_stock_threshold: z
    .number({ error: 'Low stock threshold is required' })
    .min(0, 'Must be 0 or more'),
  model: z.string(),
  color: z.string(),
  ram: z.string(),
  storage: z.string(),
  sku: z.string(),
  barcode: z.string(),
  description: z.string()
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const partyFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  address: z.string(),
  notes: z.string(),
  opening_balance: z.number({ error: 'Opening balance is required' }).min(0, 'Must be 0 or more')
});

export type PartyFormValues = z.infer<typeof partyFormSchema>;

export const expenseFormSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be more than 0'),
  expense_date: z.string().min(1, 'Date is required'),
  description: z.string()
});

export const supplierPaymentFormSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  purchase_id: z.string(),
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be more than 0'),
  payment_date: z.string().min(1, 'Date is required'),
  notes: z.string()
});

export const stockAdjustSchema = z
  .object({
    product_id: z.string().min(1, 'Product is required'),
    tracking_type: z.enum(['SERIALIZED', 'QUANTITY']).optional(),
    inventory_unit_id: z.string(),
    type: z.enum(['ADJUSTMENT', 'DAMAGED', 'LOST']),
    counted_quantity: z.number({ error: 'Quantity is required' }).min(0, 'Must be 0 or more'),
    reason: z.string().trim().min(1, 'Reason is required')
  })
  .superRefine((value, ctx) => {
    if (value.tracking_type === 'SERIALIZED' && !value.inventory_unit_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['inventory_unit_id'],
        message: 'IMEI is required'
      });
    }
  });

export const receivePaymentSchema = z.object({
  amount: z.number({ error: 'Amount is required' }).positive('Amount must be more than 0')
});

export const purchaseLineSchema = z
  .object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.number({ error: 'Quantity is required' }).positive('Quantity must be more than 0'),
    unit_cost: z.number({ error: 'Unit cost is required' }).min(0, 'Must be 0 or more'),
    imeis_text: z.string(),
    imei2_text: z.string(),
    condition: z.enum(['NEW', 'USED']),
    tracking_type: z.enum(['SERIALIZED', 'QUANTITY']).optional()
  })
  .superRefine((line, ctx) => {
    if (line.tracking_type !== 'SERIALIZED') return;
    const imei1 = line.imeis_text
      .split(/[\n,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (imei1.length !== line.quantity) {
      ctx.addIssue({
        code: 'custom',
        path: ['imeis_text'],
        message: `IMEI1 count must equal quantity (${line.quantity})`
      });
    }
    const imei2 = line.imei2_text
      .split(/[\n,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (imei2.length > 0 && imei2.length !== line.quantity) {
      ctx.addIssue({
        code: 'custom',
        path: ['imei2_text'],
        message: `IMEI2 count must equal quantity (${line.quantity})`
      });
    }
  });

export const purchaseFormSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  supplier_invoice_ref: z.string(),
  is_opening_stock: z.boolean(),
  paid_now: z.number({ error: 'Paid now is required' }).min(0, 'Must be 0 or more'),
  lines: z.array(purchaseLineSchema).min(1, 'Add at least one item')
});

export const saleLineSchema = z
  .object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.number({ error: 'Quantity is required' }).positive('Quantity must be more than 0'),
    unit_price: z.number({ error: 'Unit price is required' }).min(0, 'Must be 0 or more'),
    inventory_unit_id: z.string(),
    tracking_type: z.enum(['SERIALIZED', 'QUANTITY']).optional()
  })
  .superRefine((line, ctx) => {
    if (line.tracking_type === 'SERIALIZED' && !line.inventory_unit_id.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['inventory_unit_id'],
        message: 'IMEI is required'
      });
    }
  });

export const saleFormSchema = z
  .object({
    customer_id: z.string(),
    discount: z.number({ error: 'Discount is required' }).min(0, 'Must be 0 or more'),
    paid_now: z.number({ error: 'Paid now is required' }).min(0, 'Must be 0 or more'),
    method: z.enum(['CASH', 'BANK', 'MOBILE_WALLET']),
    lines: z.array(saleLineSchema).min(1, 'Add at least one item')
  })
  .superRefine((value, ctx) => {
    const hasPhone = value.lines.some((l) => l.tracking_type === 'SERIALIZED');
    const isWalkIn = !value.customer_id || value.customer_id === '__walkin__';
    if (hasPhone && isWalkIn) {
      ctx.addIssue({
        code: 'custom',
        path: ['customer_id'],
        message: 'Customer is required for phones'
      });
    }
    const subtotal = value.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);
    const total = Math.max(0, subtotal - value.discount);
    const unpaid = Math.max(0, total - value.paid_now);
    if (unpaid > 0 && isWalkIn) {
      ctx.addIssue({
        code: 'custom',
        path: ['customer_id'],
        message: 'Customer is required for Udhar'
      });
    }
  });
