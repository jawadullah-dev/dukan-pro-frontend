import * as z from 'zod';
import type { useTranslations } from 'next-intl';

type Translator = ReturnType<typeof useTranslations>;

export const createExpenseFormSchema = (t: Translator) =>
  z.object({
    category_id: z.string().min(1, t('validation.categoryRequired')),
    amount: z
      .number({ error: t('validation.amountRequired') })
      .positive(t('validation.amountPositive')),
    expense_date: z.string().min(1, t('validation.dateRequired')),
    description: z.string()
  });

export const createExpenseCategoryFormSchema = (t: Translator) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired'))
  });

export type ExpenseFormValues = z.infer<ReturnType<typeof createExpenseFormSchema>>;
export type ExpenseCategoryFormValues = z.infer<ReturnType<typeof createExpenseCategoryFormSchema>>;
