import { getTranslations } from 'next-intl/server';

import { Shell } from '@/components/shell';
import { Heading } from '@/components/ui/heading';
import { ProductDialogWrapper } from '@/features/products/components/product-dialog-wrapper';

export async function generateMetadata() {
  const t = await getTranslations('dukaan.product');
  return { title: t('addTitle') };
}

export default async function NewProductPage() {
  const t = await getTranslations('dukaan.product');
  return (
    <Shell>
      <Heading title={t('addTitle')} description={t('addDescription')} />
      <ProductDialogWrapper />
    </Shell>
  );
}
