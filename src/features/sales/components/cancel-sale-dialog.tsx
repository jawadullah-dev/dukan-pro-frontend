'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BaseCancelDialog } from '@/components/common/base-cancel-dialog';
import { OverdraftAlert } from '@/components/common/overdraft-alert';
import { formatPkr } from '@/lib/dukaan/numbers';
import { useT } from '@/i18n/use-t';
import type { CancelImpactItem, OverdraftPrompt } from '@/types';
import type { CancelSaleDialogProps } from '@/types/sales';
import { cancelImpactQueryOptions, saleKeys } from '../api/queries';
import { cancelSaleMutation } from '../api/mutations';

export function CancelSaleDialog({ sale, open, onOpenChange, onSuccess }: CancelSaleDialogProps) {
  const qc = useQueryClient();
  const t = useT();
  const [reason, setReason] = useState('');
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [overdraftPrompt, setOverdraftPrompt] = useState<OverdraftPrompt | null>(null);

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...cancelImpactQueryOptions(sale.id),
    enabled: open && sale.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelSaleMutation,
    onSuccess: (res) => {
      if (res && 'confirmOverdraft' in res && res.confirmOverdraft) {
        setOverdraftPrompt({
          shortfall: res.shortfall,
          message: res.message
        });
        setConfirmOverdraft(true);
        toast.warning(res.message || t('sales.cancelDialog.overdraftRequired'));
        return;
      }

      toast.success(t('sales.cancelDialog.success', { saleNo: sale.saleNo }));
      void qc.invalidateQueries({ queryKey: saleKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('sales.cancelDialog.failed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('sales.cancelDialog.reasonRequired'));
      return;
    }

    cancel.mutate({
      id: sale.id,
      input: {
        cancelReason: reason.trim(),
        confirmOverdraft: confirmOverdraft || !!overdraftPrompt
      }
    });
  };

  const impactItems: CancelImpactItem[] = [];
  if (impact) {
    impactItems.push(
      {
        label: t('sales.cancelDialog.cashReversal'),
        value: `-${formatPkr(impact.cashReversedAmount ?? 0)}`,
        destructive: true
      },
      {
        label: t('sales.cancelDialog.cashAfter'),
        value: formatPkr(impact.cashAfter ?? 0)
      }
    );

    if (impact.customerUdharAfter !== null && impact.customerUdharAfter !== undefined) {
      impactItems.push({
        label: t('sales.cancelDialog.customerUdharAfter'),
        value: formatPkr(impact.customerUdharAfter)
      });
    }
  }

  const overdraftSection = (
    <>
      {impact?.willCauseOverdraft && (
        <OverdraftAlert
          checked={confirmOverdraft}
          onCheckedChange={setConfirmOverdraft}
          title={t('sales.cancelDialog.overdraftWarning')}
          description={t('sales.cancelDialog.overdraftDescription', {
            amount: formatPkr(impact.cashAfter ?? 0)
          })}
          confirmLabel={t('sales.cancelDialog.confirmOverdraft')}
          id='sale-confirm-overdraft'
        />
      )}
      {overdraftPrompt && !impact?.willCauseOverdraft && (
        <OverdraftAlert
          checked={confirmOverdraft}
          onCheckedChange={setConfirmOverdraft}
          title={t('sales.cancelDialog.overdraftWarning')}
          description={overdraftPrompt.message}
          confirmLabel={t('sales.cancelDialog.confirmOverdraft')}
          id='sale-confirm-overdraft-prompt'
        />
      )}
    </>
  );

  return (
    <BaseCancelDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${t('sales.cancelDialog.title')} ${sale.saleNo}`}
      description={t('sales.cancelDialog.description')}
      isBlocked={impact?.blocked}
      blockedTitle={t('sales.cancelDialog.cannotCancel')}
      blockedReason={impact?.blockedReason || t('purchases.cancelDialog.defaultBlockedReason')}
      closeLabel={t('sales.cancelDialog.close')}
      isLoadingImpact={impactLoading}
      loadingImpactText={t('sales.cancelDialog.calculatingImpact')}
      impactItems={impactItems}
      overdraftAlert={overdraftSection}
      reason={reason}
      onReasonChange={setReason}
      reasonLabel={t('sales.cancelDialog.reasonLabel')}
      reasonPlaceholder={t('sales.cancelDialog.reasonPlaceholder')}
      reasonId='saleCancelReason'
      onSubmit={handleSubmit}
      isSubmitting={cancel.isPending}
      cancelButtonText={t('sales.cancelDialog.cancel')}
      submitButtonText={t('sales.cancelDialog.confirm')}
    />
  );
}
