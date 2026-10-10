import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createBrandFormSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired'))
  });

export type BrandFormValues = z.infer<ReturnType<typeof createBrandFormSchema>>;
