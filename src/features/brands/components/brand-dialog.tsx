'use client';

import { useT } from '@/i18n/use-t';
import { SimpleEntityDialog } from '@/components/common/simple-entity-dialog';
import type { BrandDialogProps } from '@/types';
import { brandKeys } from '../api/queries';
import { createBrand, updateBrand } from '../api/service';
import { createBrandFormSchema } from '../schemas/brand-schema';

export function BrandDialog({ open, onOpenChange, brand }: BrandDialogProps) {
  const t = useT();

  return (
    <SimpleEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      entity={brand}
      titleAdd={t('dukaan.brand.addTitle')}
      titleEdit={t('dukaan.brand.editTitle')}
      descriptionAdd={t('dukaan.brand.addDescription')}
      descriptionEdit={t('dukaan.brand.editDescription')}
      nameLabel={t('dukaan.party.name')}
      namePlaceholder={t('dukaan.brand.namePlaceholder')}
      successCreated={t('dukaan.brand.created')}
      successUpdated={t('dukaan.brand.updated')}
      onSave={(id, name) => (id ? updateBrand(id, name) : createBrand(name))}
      invalidateQueryKey={brandKeys.all}
      schema={createBrandFormSchema(t)}
    />
  );
}
