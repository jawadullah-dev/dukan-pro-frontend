import * as z from 'zod';

const MAX_FILE_SIZE = 5_000_000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const productSchema = (
  t: (key: string, values?: Record<string, string | number>) => string
) =>
  z.object({
    image: z
      .any()
      .refine((files) => files?.length == 1, t('validation.imageRequired'))
      .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, t('validation.maxFileSize5Mb'))
      .refine(
        (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        t('validation.acceptedFileTypes', { types: '.jpg, .jpeg, .png, .webp' })
      ),
    name: z.string().min(2, t('productSchemaZod.nameMin2')),
    category: z.string().min(1, t('productSchemaZod.categoryRequired')),
    price: z.number({ error: t('productSchemaZod.priceRequired') }),
    description: z.string().min(10, t('productSchemaZod.descriptionMin10'))
  });

export type ProductFormValues = {
  image: File[] | undefined;
  name: string;
  category: string;
  price: number | undefined;
  description: string;
};
