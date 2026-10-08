'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useT } from '@/i18n/use-t';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  confirmLabel,
  cancelLabel
}: AlertModalProps) {
  const t = useT();
  const resolvedTitle = title ?? t('common.areYouSure');
  const resolvedDescription = description ?? t('common.cannotUndo');
  const resolvedConfirm = confirmLabel ?? t('common.continue');
  const resolvedCancel = cancelLabel ?? t('common.cancel');

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <AlertDialogContent size='default'>
        <AlertDialogHeader>
          <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
          <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{resolvedCancel}</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            isLoading={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {resolvedConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
