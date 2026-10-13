import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  trackingType: z.enum(['QUANTITY', 'SERIALIZED']),
  model: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  storage: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  defaultPurchasePrice: z.coerce.number().min(0).optional(),
  defaultSellingPrice: z.coerce.number().min(0).optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publicDescription: z.string().optional().nullable(),
  contactForPrice: z.boolean().optional(),
  ptaStatus: z.enum(['PTA_APPROVED', 'NON_PTA']).optional().nullable()
});

export const productFormSchema = productSchema;

export type ProductFormValues = z.infer<typeof productSchema>;
