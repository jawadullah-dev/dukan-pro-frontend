import { useT } from '@/i18n/use-t';

export const CATEGORY_OPTIONS = (t: (key: string) => string) => [
  { value: 'Electronics', label: t('categories.electronics') },
  { value: 'Furniture', label: t('categories.furniture') },
  { value: 'Clothing', label: t('categories.clothing') },
  { value: 'Toys', label: t('categories.toys') },
  { value: 'Groceries', label: t('categories.groceries') },
  { value: 'Books', label: t('categories.books') },
  { value: 'Jewelry', label: t('categories.jewelry') },
  { value: 'Beauty Products', label: t('categories.beautyProducts') }
];
