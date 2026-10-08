import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createNameOnlySchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired'))
  });

export const createReasonSchema = (t: Translator) =>
  z.object({
    reason: z.string().trim().min(1, t('validation.reasonRequired'))
  });

export const createProductFormSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired')),
    category_id: z.string().min(1, t('validation.categoryRequired')),
    brand_id: z.string().min(1, t('validation.brandRequired')),
    tracking_type: z.enum(['SERIALIZED', 'QUANTITY']),
    default_purchase_price: z
      .number({ error: t('validation.purchasePriceRequired') })
      .min(0, t('validation.valueNonNegative')),
    default_selling_price: z
      .number({ error: t('validation.sellingPriceRequired') })
      .min(0, t('validation.valueNonNegative')),
    low_stock_threshold: z
      .number({ error: t('validation.lowStockThresholdRequired') })
      .min(0, t('validation.valueNonNegative')),
    model: z.string(),
    color: z.string(),
    ram: z.string(),
    storage: z.string(),
    sku: z.string(),
    barcode: z.string(),
    description: z.string()
  });

export type ProductFormValues = z.infer<ReturnType<typeof createProductFormSchema>>;

export const createPartyFormSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired')),
    phone: z.string().trim().min(1, t('validation.phoneRequired')),
    address: z.string(),
    notes: z.string(),
    opening_balance: z
      .number({ error: t('validation.openingBalanceRequired') })
      .min(0, t('validation.valueNonNegative'))
  });

export type PartyFormValues = z.infer<ReturnType<typeof createPartyFormSchema>>;

export const createReceivePaymentSchema = (t: Translator) =>
  z.object({
    amount: z
      .number({ error: t('validation.amountRequired') })
      .positive(t('validation.amountPositive'))
  });

export const createExpenseFormSchema = (t: Translator) =>
  z.object({
    category_id: z.string().min(1, t('validation.categoryRequired')),
    amount: z
      .number({ error: t('validation.amountRequired') })
      .positive(t('validation.amountPositive')),
    expense_date: z.string().min(1, t('validation.dateRequired')),
    description: z.string()
  });

export const createSupplierPaymentFormSchema = (t: Translator) =>
  z.object({
    supplier_id: z.string().min(1, t('validation.supplierRequired')),
    purchase_id: z.string(),
    amount: z
      .number({ error: t('validation.amountRequired') })
      .positive(t('validation.amountPositive')),
    payment_date: z.string().min(1, t('validation.dateRequired')),
    notes: z.string()
  });

export const createStockAdjustSchema = (t: Translator) =>
  z
    .object({
      product_id: z.string().min(1, t('validation.productRequired')),
      tracking_type: z.enum(['SERIALIZED', 'QUANTITY']).optional(),
      inventory_unit_id: z.string(),
      type: z.enum(['ADJUSTMENT', 'DAMAGED', 'LOST']),
      counted_quantity: z
        .number({ error: t('validation.quantityRequired') })
        .min(0, t('validation.valueNonNegative')),
      reason: z.string().trim().min(1, t('validation.reasonRequired'))
    })
    .superRefine((value, ctx) => {
      if (value.tracking_type === 'SERIALIZED' && !value.inventory_unit_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['inventory_unit_id'],
          message: t('validation.imeiRequired')
        });
      }
    });

export const createPurchaseFormSchema = (t: Translator) =>
  z.object({
    supplier_id: z.string().min(1, t('validation.supplierRequired')),
    supplier_invoice_ref: z.string(),
    is_opening_stock: z.boolean(),
    paid_now: z
      .number({ error: t('validation.paidNowRequired') })
      .min(0, t('validation.valueNonNegative')),
    lines: z
      .array(
        z
          .object({
            product_id: z.string().min(1, t('validation.productRequired')),
            quantity: z
              .number({ error: t('validation.quantityRequired') })
              .positive(t('validation.quantityPositive')),
            unit_cost: z
              .number({ error: t('validation.unitCostRequired') })
              .min(0, t('validation.valueNonNegative')),
            imeis_text: z.string(),
            imei2_text: z.string(),
            condition: z.enum(['NEW', 'USED']),
            tracking_type: z.enum(['SERIALIZED', 'QUANTITY']).optional()
          })
          .superRefine((line, ctx) => {
            if (line.tracking_type !== 'SERIALIZED') return;
            const imei1 = line.imeis_text
              .split(/[\n,]+/)
              .map((value) => value.trim())
              .filter(Boolean);
            if (imei1.length !== line.quantity) {
              ctx.addIssue({
                code: 'custom',
                path: ['imeis_text'],
                message: t('validation.imei1CountMismatch', { quantity: line.quantity })
              });
            }
            const imei2 = line.imei2_text
              .split(/[\n,]+/)
              .map((value) => value.trim())
              .filter(Boolean);
            if (imei2.length > 0 && imei2.length !== line.quantity) {
              ctx.addIssue({
                code: 'custom',
                path: ['imei2_text'],
                message: t('validation.imei2CountMismatch', { quantity: line.quantity })
              });
            }
          })
      )
      .min(1, t('validation.addItemRequired'))
  });

export const createSaleFormSchema = (t: Translator) =>
  z
    .object({
      customer_id: z.string(),
      discount: z
        .number({ error: t('validation.discountRequired') })
        .min(0, t('validation.valueNonNegative')),
      paid_now: z
        .number({ error: t('validation.paidNowRequired') })
        .min(0, t('validation.valueNonNegative')),
      method: z.enum(['CASH', 'BANK', 'MOBILE_WALLET']),
      lines: z
        .array(
          z
            .object({
              product_id: z.string().min(1, t('validation.productRequired')),
              quantity: z
                .number({ error: t('validation.quantityRequired') })
                .positive(t('validation.quantityPositive')),
              unit_price: z
                .number({ error: t('validation.unitPriceRequired') })
                .min(0, t('validation.valueNonNegative')),
              inventory_unit_id: z.string(),
              tracking_type: z.enum(['SERIALIZED', 'QUANTITY']).optional()
            })
            .superRefine((line, ctx) => {
              if (line.tracking_type === 'SERIALIZED' && !line.inventory_unit_id.trim()) {
                ctx.addIssue({
                  code: 'custom',
                  path: ['inventory_unit_id'],
                  message: t('validation.imeiRequired')
                });
              }
            })
        )
        .min(1, t('validation.addItemRequired'))
    })
    .superRefine((value, ctx) => {
      const hasPhone = value.lines.some((line) => line.tracking_type === 'SERIALIZED');
      const isWalkIn = !value.customer_id || value.customer_id === '__walkin__';
      if (hasPhone && isWalkIn) {
        ctx.addIssue({
          code: 'custom',
          path: ['customer_id'],
          message: t('validation.customerForPhones')
        });
      }
      const subtotal = value.lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
      const total = Math.max(0, subtotal - value.discount);
      const unpaid = Math.max(0, total - value.paid_now);
      if (unpaid > 0 && isWalkIn) {
        ctx.addIssue({
          code: 'custom',
          path: ['customer_id'],
          message: t('validation.customerForUdhar')
        });
      }
    });
