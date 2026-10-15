'use client';

import { BaseCashInflowDialog } from './base-cash-inflow-dialog';
import { createOpeningCash } from '../api/service';
import type { OpeningCashDialogProps } from '@/types/cash';
import { useT } from '@/i18n/use-t';

export function OpeningCashDialog({ open, onOpenChange }: OpeningCashDialogProps) {
  const t = useT();

  return (
    <BaseCashInflowDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('dukaan.cash.recordOpeningTitle')}
      description={t('dukaan.cash.recordOpeningDesc')}
      amountLabel={t('dukaan.cash.openingAmount')}
      dateLabel={t('dukaan.cash.startDate')}
      notesPlaceholder={t('dukaan.cash.openingPlaceholder')}
      successMessage={t('dukaan.cash.openingSuccess')}
      failedMessage={t('dukaan.cash.openingFailed')}
      idPrefix='opening'
      mutateFn={createOpeningCash}
    />
  );
}
