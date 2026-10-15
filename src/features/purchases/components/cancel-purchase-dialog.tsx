'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BaseCancelDialog } from '@/components/common/base-cancel-dialog';
import { formatPkr } from '@/lib/dukaan/numbers';
import { useT } from '@/i18n/use-t';
import type { CancelImpactItem, CancelPurchaseDialogProps } from '@/types';
import { purchaseCancelImpactQueryOptions, purchaseKeys } from '../api/queries';
import { cancelPurchaseMutation } from '../api/mutations';

export function CancelPurchaseDialog({
  purchase,
  open,
  onOpenChange,
  onSuccess
}: CancelPurchaseDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [reason, setReason] = useState('');

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...purchaseCancelImpactQueryOptions(purchase.id),
    enabled: open && purchase.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelPurchaseMutation,
    onSuccess: () => {
      toast.success(t('purchases.cancelDialog.success', { purchaseNo: purchase.purchaseNo }));
      void qc.invalidateQueries({ queryKey: purchaseKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('purchases.cancelDialog.failed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('purchases.cancelDialog.reasonRequired'));
      return;
    }

    cancel.mutate({
      id: purchase.id,
      input: {
        cancelReason: reason.trim()
      }
    });
  };

  const impactItems: CancelImpactItem[] = [
    {
      label: t('purchases.cancelDialog.cashReturned'),
      value: `+${formatPkr(impact?.cashReversedAmount ?? 0)}`,
      success: true
    },
    {
      label: t('purchases.cancelDialog.cashDrawerAfter'),
      value: formatPkr(impact?.cashAfter ?? 0)
    }
  ];

  if (impact?.supplierPayableAfter !== null && impact?.supplierPayableAfter !== undefined) {
    impactItems.push({
      label: t('purchases.cancelDialog.supplierPayableAfter'),
      value: formatPkr(impact.supplierPayableAfter)
    });
  }

  return (
    <BaseCancelDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('purchases.cancelDialog.title', { purchaseNo: purchase.purchaseNo })}
      description={t('purchases.cancelDialog.description')}
      isBlocked={impact?.blocked}
      blockedTitle={t('purchases.cancelDialog.cannotCancel')}
      blockedReason={impact?.blockedReason || t('purchases.cancelDialog.defaultBlockedReason')}
      closeLabel={t('purchases.cancelDialog.close')}
      isLoadingImpact={impactLoading}
      loadingImpactText={t('purchases.cancelDialog.calculatingImpact')}
      impactItems={impactItems}
      reason={reason}
      onReasonChange={setReason}
      reasonLabel={t('purchases.cancelDialog.reasonLabel')}
      reasonPlaceholder={t('purchases.cancelDialog.reasonPlaceholder')}
      reasonId='purchaseCancelReason'
      onSubmit={handleSubmit}
      isSubmitting={cancel.isPending}
      cancelButtonText={t('purchases.cancelDialog.cancel')}
      submitButtonText={t('purchases.cancelDialog.confirm')}
    />
  );
}
