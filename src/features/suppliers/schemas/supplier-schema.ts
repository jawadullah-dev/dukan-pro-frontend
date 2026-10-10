import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createSupplierFormSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired')),
    phone: z.string().trim().min(1, t('validation.phoneRequired')),
    address: z.string(),
    notes: z.string(),
    opening_balance: z
      .number({ error: t('validation.openingBalanceRequired') })
      .min(0, t('validation.valueNonNegative'))
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

export type SupplierFormValues = z.infer<ReturnType<typeof createSupplierFormSchema>>;
export type SupplierPaymentFormValues = z.infer<ReturnType<typeof createSupplierPaymentFormSchema>>;
