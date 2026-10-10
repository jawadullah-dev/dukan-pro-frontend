import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

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

export type StockAdjustFormValues = z.infer<ReturnType<typeof createStockAdjustSchema>>;
