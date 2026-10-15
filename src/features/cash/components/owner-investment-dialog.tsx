'use client';

import { BaseCashInflowDialog } from './base-cash-inflow-dialog';
import { createOwnerInvestment } from '../api/service';
import type { OwnerInvestmentDialogProps } from '@/types/cash';
import { useT } from '@/i18n/use-t';

export function OwnerInvestmentDialog({ open, onOpenChange }: OwnerInvestmentDialogProps) {
  const t = useT();

  return (
    <BaseCashInflowDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('dukaan.cash.recordInvestmentTitle')}
      description={t('dukaan.cash.recordInvestmentDesc')}
      amountLabel={t('dukaan.cash.investmentAmount')}
      dateLabel={t('dukaan.cash.date')}
      notesPlaceholder={t('dukaan.cash.investmentPlaceholder')}
      successMessage={t('dukaan.cash.investmentSuccess')}
      failedMessage={t('dukaan.cash.investmentFailed')}
      idPrefix='investment'
      mutateFn={createOwnerInvestment}
    />
  );
}
