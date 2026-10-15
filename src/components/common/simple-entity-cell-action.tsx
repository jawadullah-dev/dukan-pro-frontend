'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useT } from '@/i18n/use-t';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { RowActionsMenu } from '@/components/common/row-actions-menu';
import type { SimpleEntityCellActionProps } from '@/types/common';

export function SimpleEntityCellAction({
  id,
  deleteTitle,
  deleteDescription,
  deleteSuccess,
  onDelete,
  invalidateQueryKey,
  renderDialog
}: SimpleEntityCellActionProps) {
  const t = useT();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => onDelete(id),
    onSuccess: () => {
      toast.success(deleteSuccess);
      setDeleteOpen(false);
      void qc.invalidateQueries({ queryKey: invalidateQueryKey });
    },
    onError: (e: Error) => toast.error(e.message)
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel={t('common.delete')}
      />
      {renderDialog(editOpen, setEditOpen)}
      <RowActionsMenu
        actions={[
          {
            label: t('common.edit'),
            icon: Icons.edit,
            onClick: () => setEditOpen(true)
          },
          {
            label: t('common.delete'),
            icon: Icons.trash,
            variant: 'destructive',
            onClick: () => setDeleteOpen(true)
          }
        ]}
      />
    </>
  );
}
