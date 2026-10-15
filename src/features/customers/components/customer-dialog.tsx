'use client';

import { useT } from '@/i18n/use-t';
import { BasePartyDialog } from '@/components/common/base-party-dialog';
import { customerKeys } from '../api/queries';
import { createCustomer, updateCustomer } from '../api/service';
import { createPartyFormSchema } from '../schemas/customer-schema';
import type { CustomerDialogProps } from '@/types';

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  const t = useT();

  return (
    <BasePartyDialog
      open={open}
      onOpenChange={onOpenChange}
      party={customer}
      titleAdd={t('dukaan.party.customerAddTitle')}
      titleEdit={t('dukaan.party.customerEditTitle')}
      descriptionAdd={t('dukaan.party.customerAddDescription')}
      descriptionEdit={t('dukaan.party.customerEditDescription')}
      openingBalanceLabel={t('dukaan.party.customerOpeningBalance')}
      successCreated={t('dukaan.party.customerAdded')}
      successUpdated={t('dukaan.party.customerUpdated')}
      onSave={(payload, id) => (id ? updateCustomer(id, payload) : createCustomer(payload))}
      invalidateQueryKey={customerKeys.all}
      schema={createPartyFormSchema(t)}
    />
  );
}
