import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createSaleFormSchema = (t: Translator) =>
  z.object({
    customer_id: z.string(),
    discount: z.number().min(0, t('validation.valueNonNegative')),
    paid_now: z.number().min(0, t('validation.valueNonNegative')),
    method: z.enum(['CASH', 'BANK', 'MOBILE_WALLET']),
    lines: z
      .array(
        z.object({
          product_id: z.string().min(1, t('validation.productRequired')),
          quantity: z.number().int().positive(t('validation.quantityPositive')),
          unit_price: z.number().min(0, t('validation.valueNonNegative')),
          inventory_unit_id: z.string().optional()
        })
      )
      .min(1, t('validation.lineItemsMinOne'))
  });

export const createReasonSchema = (t: Translator) =>
  z.object({
    reason: z.string().trim().min(1, t('validation.reasonRequired'))
  });

export type SaleFormValues = z.infer<ReturnType<typeof createSaleFormSchema>>;
