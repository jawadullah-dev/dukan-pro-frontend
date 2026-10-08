import * as z from 'zod';

export const userSchema = (t: (key: string) => string) =>
  z.object({
    first_name: z.string().min(2, t('schemaZod.firstNameMin2')),
    last_name: z.string().min(2, t('schemaZod.lastNameMin2')),
    email: z.string().email(t('schemaZod.validEmail')),
    phone: z.string().min(1, t('schemaZod.phoneRequired')),
    role: z.string().min(1, t('schemaZod.roleRequired')),
    status: z.string().min(1, t('schemaZod.statusRequired'))
  });

export type UserFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
};
