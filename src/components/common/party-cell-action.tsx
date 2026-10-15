'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useT } from '@/i18n/use-t';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import type { PartyCellActionProps } from '@/types/party';

export function PartyCellAction({
  id,
  isActive,
  isSystem = false,
  ledgerHref,
  deactivateTitle,
  deactivateDescription,
  deactivateConfirmLabel,
  deactivateSuccess,
  activateSuccess,
  onDeactivate,
  onActivate,
  invalidateQueryKey,
  renderEditDialog
}: PartyCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const deactivate = useMutation({
    mutationFn: () => onDeactivate(id),
    onSuccess: () => {
      toast.success(deactivateSuccess);
      setDeactivateOpen(false);
      void qc.invalidateQueries({ queryKey: invalidateQueryKey });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const activate = useMutation({
    mutationFn: () => onActivate(id),
    onSuccess: () => {
      toast.success(activateSuccess);
      void qc.invalidateQueries({ queryKey: invalidateQueryKey });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role='presentation'
      data-slot='action-cell'
    >
      <AlertModal
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() => deactivate.mutate()}
        loading={deactivate.isPending}
        title={deactivateTitle}
        description={deactivateDescription}
        confirmLabel={deactivateConfirmLabel ?? t('common.deactivate')}
      />
      {renderEditDialog(editOpen, setEditOpen)}
      <RowActionsMenu
        actions={[
          ...(ledgerHref
            ? [
                {
                  label: t('table.openLedger'),
                  icon: Icons.page,
                  href: ledgerHref
                }
              ]
            : []),
          {
            label: t('common.edit'),
            icon: Icons.edit,
            onClick: () => setEditOpen(true)
          },
          ...(!isSystem && isActive
            ? [
                {
                  label: deactivateConfirmLabel ?? t('common.deactivate'),
                  icon: Icons.trash,
                  className: 'text-amber-600 focus:text-amber-700 dark:text-amber-400',
                  onClick: () => setDeactivateOpen(true)
                }
              ]
            : []),
          ...(!isSystem && !isActive
            ? [
                {
                  label: t('common.activate'),
                  icon: Icons.check,
                  className: 'text-emerald-600 focus:text-emerald-700 dark:text-emerald-400',
                  disabled: activate.isPending,
                  onClick: () => activate.mutate()
                }
              ]
            : [])
        ]}
      />
    </div>
  );
}
