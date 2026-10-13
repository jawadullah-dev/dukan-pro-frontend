import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createCategoryFormSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired'))
  });

type CategoryFormValues = z.infer<ReturnType<typeof createCategoryFormSchema>>;
