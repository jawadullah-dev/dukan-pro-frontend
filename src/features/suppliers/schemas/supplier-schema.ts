import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createSupplierFormSchema = (t: Translator) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, t('validation.nameRequired'))
      .max(150, t('validation.nameTooLong')),
    phone: z.string().trim().max(30),
    address: z.string().trim().max(300),
    notes: z.string().trim().max(1000),
    opening_balance: z
      .number({ error: t('validation.openingBalanceRequired') })
      .min(0, t('validation.valueNonNegative'))
  });

type SupplierFormValues = z.infer<ReturnType<typeof createSupplierFormSchema>>;
