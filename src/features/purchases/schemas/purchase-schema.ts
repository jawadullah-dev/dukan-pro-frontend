import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createPurchaseFormSchema = (t: Translator) =>
  z.object({
    supplier_id: z.string().min(1, t('validation.supplierRequired')),
    supplier_invoice_ref: z.string(),
    is_opening_stock: z.boolean(),
    paid_now: z.number().min(0, t('validation.valueNonNegative')),
    lines: z
      .array(
        z.object({
          product_id: z.string().min(1, t('validation.productRequired')),
          quantity: z.number().int().positive(t('validation.quantityPositive')),
          unit_cost: z.number().min(0, t('validation.valueNonNegative')),
          imeis_text: z.string(),
          imei2_text: z.string(),
          condition: z.enum(['NEW', 'USED'])
        })
      )
      .min(1, t('validation.lineItemsMinOne'))
  });
