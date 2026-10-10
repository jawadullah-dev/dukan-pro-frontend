import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

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
