'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BaseCancelDialog } from '@/components/common/base-cancel-dialog';
import { formatPkr } from '@/lib/dukaan/numbers';
import { useT } from '@/i18n/use-t';
import type { CancelImpactItem } from '@/types';
import type { CancelSupplierPaymentDialogProps } from '@/types/supplier-payment';
import { supplierPaymentCancelImpactQueryOptions, supplierPaymentKeys } from '../api/queries';
import { cancelSupplierPaymentMutation } from '../api/mutations';

const PRESET_REASONS = [
  'Duplicate payment entry',
  'Paid wrong supplier',
  'Incorrect amount entered',
  'Payment cancelled with supplier agreement'
];

export function CancelSupplierPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess
}: CancelSupplierPaymentDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...supplierPaymentCancelImpactQueryOptions(payment.id),
    enabled: open && payment.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelSupplierPaymentMutation,
    onSuccess: () => {
      toast.success(t('supplierPayments.cancelSuccess'));
      void qc.invalidateQueries({ queryKey: supplierPaymentKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('supplierPayments.cancelFailed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('supplierPayments.reasonRequired'));
      return;
    }

    cancel.mutate({
      id: payment.id,
      input: {
        cancelReason: reason.trim()
      }
    });
  };

  const impactItems: CancelImpactItem[] = [
    {
      label: t('supplierPayments.supplierLabel'),
      value: payment.supplierName || '—'
    },
    {
      label: t('supplierPayments.paymentAmountLabel'),
      value: formatPkr(payment.amount),
      highlight: true
    }
  ];

  if (payment.purchaseNo) {
    impactItems.push({
      label: t('supplierPayments.purchaseBillLabel'),
      value: payment.purchaseNo
    });
  }

  if (impact) {
    impactItems.push(
      {
        label: t('supplierPayments.cashRestoredInflow'),
        value: `+${formatPkr(impact.cashReversedAmount)}`,
        divider: true,
        success: true
      },
      {
        label: t('supplierPayments.projectedDrawerCash'),
        value: formatPkr(impact.cashAfter)
      }
    );

    if (impact.supplierPayableAfter !== null && impact.supplierPayableAfter !== undefined) {
      impactItems.push({
        label: t('supplierPayments.payableAfterCancel'),
        value: formatPkr(impact.supplierPayableAfter),
        highlight: true
      });
    }
  }

  return (
    <BaseCancelDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('supplierPayments.cancelTitle')}
      description={t('supplierPayments.cancelDesc', { amount: formatPkr(payment.amount) })}
      isBlocked={impact?.blocked}
      blockedTitle={t('supplierPayments.cancellationBlocked')}
      blockedReason={impact?.blockedReason || t('supplierPayments.defaultBlockedReason')}
      closeLabel={t('common.close')}
      isLoadingImpact={impactLoading}
      loadingImpactText={t('supplierPayments.calculatingImpact')}
      impactItems={impactItems}
      presetReasons={PRESET_REASONS}
      reason={reason}
      onReasonChange={setReason}
      reasonLabel={t('supplierPayments.reasonLabel')}
      reasonPlaceholder={t('supplierPayments.reasonPlaceholder')}
      reasonId='supplier-cancel-reason'
      reasonCharactersCountText={t('supplierPayments.charactersCount', { count: reason.length })}
      quickSelectReasonText={t('supplierPayments.quickSelectReason')}
      onSubmit={handleSubmit}
      isSubmitting={cancel.isPending}
      cancelButtonText={t('common.keepActive')}
      submitButtonText={t('supplierPayments.confirmCancel')}
    />
  );
}
