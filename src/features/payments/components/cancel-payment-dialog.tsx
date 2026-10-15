'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BaseCancelDialog } from '@/components/common/base-cancel-dialog';
import { formatPkr } from '@/lib/dukaan/numbers';
import { OverdraftAlert } from '@/components/common/overdraft-alert';
import { useT } from '@/i18n/use-t';
import type { CancelImpactItem, OverdraftPrompt } from '@/types';
import type { CancelPaymentDialogProps } from '@/types/payment';
import { paymentCancelImpactQueryOptions, paymentKeys } from '../api/queries';
import { cancelPaymentMutation } from '../api/mutations';

const PRESET_REASONS = [
  'Duplicate payment entry',
  'Incorrect amount entered',
  'Customer requested cancellation'
];

export function CancelPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess
}: CancelPaymentDialogProps) {
  const t = useT();
  const qc = useQueryClient();
  const [reason, setReason] = useState('');
  const [confirmOverdraft, setConfirmOverdraft] = useState(false);
  const [overdraftPrompt, setOverdraftPrompt] = useState<OverdraftPrompt | null>(null);

  const { data: impact, isLoading: impactLoading } = useQuery({
    ...paymentCancelImpactQueryOptions(payment.id),
    enabled: open && payment.status === 'ACTIVE'
  });

  const cancel = useMutation({
    ...cancelPaymentMutation,
    onSuccess: (res) => {
      if (res && 'confirmOverdraft' in res && res.confirmOverdraft) {
        setOverdraftPrompt({
          shortfall: res.shortfall,
          message: res.message
        });
        setConfirmOverdraft(true);
        toast.warning(res.message || t('payments.overdraftConfirmationRequired'));
        return;
      }

      toast.success(t('payments.cancelSuccess'));
      void qc.invalidateQueries({ queryKey: paymentKeys.all });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || t('payments.cancelFailed'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error(t('payments.reasonRequired'));
      return;
    }

    if ((impact?.willCauseOverdraft || !!overdraftPrompt) && !confirmOverdraft) {
      toast.error(t('payments.confirmOverdraftRequired'));
      return;
    }

    cancel.mutate({
      id: payment.id,
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
        label: t('payments.currentDrawerCash'),
        value: formatPkr(impact.currentCash)
      },
      {
        label: t('payments.cashReturnedOut'),
        value: `-${formatPkr(impact.cashReversedAmount)}`,
        destructive: true
      },
      {
        label: t('payments.drawerCashAfter'),
        value: formatPkr(impact.cashAfter),
        highlight: true,
        destructive: impact.cashAfter < 0
      }
    );

    if (impact.customerUdharAfter != null) {
      impactItems.push({
        label: t('payments.customerUdharAfter'),
        value: formatPkr(impact.customerUdharAfter),
        highlight: true
      });
    }
  }

  const overdraftSection = (
    <>
      {impact?.willCauseOverdraft && (
        <OverdraftAlert
          checked={confirmOverdraft}
          onCheckedChange={setConfirmOverdraft}
          title={t('payments.drawerOverdraftWarning')}
          description={t('payments.drawerOverdraftDesc', { amount: formatPkr(impact.cashAfter) })}
          confirmLabel={t('payments.confirmNegativeCash')}
          id='confirm-overdraft'
        />
      )}
      {overdraftPrompt && !impact?.willCauseOverdraft && (
        <OverdraftAlert
          checked={confirmOverdraft}
          onCheckedChange={setConfirmOverdraft}
          title={t('payments.drawerOverdraftWarning')}
          description={overdraftPrompt.message}
          confirmLabel={t('payments.confirmNegativeCash')}
          id='confirm-overdraft-prompt'
        />
      )}
    </>
  );

  return (
    <BaseCancelDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('payments.cancelTitle')}
      description={t('payments.cancelDesc', {
        amount: formatPkr(payment.amount),
        customer: payment.customerName || t('payments.defaultCustomer')
      })}
      isBlocked={payment.status === 'CANCELLED' || impact?.blocked}
      blockedTitle={t('payments.cancellationBlocked')}
      blockedReason={impact?.blockedReason || t('payments.defaultBlockedReason')}
      closeLabel={t('common.close')}
      isLoadingImpact={impactLoading}
      loadingImpactText={t('payments.calculatingImpact')}
      impactItems={impactItems}
      overdraftAlert={overdraftSection}
      presetReasons={PRESET_REASONS}
      reason={reason}
      onReasonChange={setReason}
      reasonLabel={t('payments.reasonLabel')}
      reasonPlaceholder={t('payments.reasonPlaceholder')}
      reasonId='cancel-reason'
      reasonCharactersCountText={t('payments.charactersCount', { count: reason.length })}
      quickSelectReasonText={t('payments.quickSelectReason')}
      onSubmit={handleSubmit}
      isSubmitting={cancel.isPending}
      cancelButtonText={t('common.close')}
      submitButtonText={t('payments.confirmCancel')}
    />
  );
}
