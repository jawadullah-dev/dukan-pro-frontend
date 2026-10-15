'use client';

import { useT } from '@/i18n/use-t';
import { BasePartyDialog } from '@/components/common/base-party-dialog';
import { supplierKeys } from '../api/queries';
import { createSupplier, updateSupplier } from '../api/service';
import { createSupplierFormSchema } from '../schemas/supplier-schema';
import type { SupplierDialogProps } from '@/types/suppliers';

export function SupplierDialog({ open, onOpenChange, supplier }: SupplierDialogProps) {
  const t = useT();

  return (
    <BasePartyDialog
      open={open}
      onOpenChange={onOpenChange}
      party={supplier}
      titleAdd={t('dukaan.supplier.addTitle')}
      titleEdit={t('dukaan.supplier.editTitle')}
      descriptionAdd={t('dukaan.supplier.addDescription')}
      descriptionEdit={t('dukaan.supplier.editDescription')}
      openingBalanceLabel={t('dukaan.party.supplierOpeningBalance')}
      namePlaceholder={t('dukaan.supplier.namePlaceholder')}
      successCreated={t('dukaan.supplier.created')}
      successUpdated={t('dukaan.supplier.updated')}
      primaryButtonMode={supplier ? 'edit' : 'add'}
      onSave={(payload, id) => (id ? updateSupplier(id, payload) : createSupplier(payload))}
      invalidateQueryKey={supplierKeys.all}
      schema={createSupplierFormSchema(t)}
    />
  );
}
