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
import { useT, translateMaybe } from '@/i18n/use-t';
import type { AlertModalProps } from '@/types';
export type { AlertModalProps };

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  confirmLabel,
  cancelLabel,
  closeOnOutsideClick = true
}: AlertModalProps) {
  const t = useT();
  const resolvedTitle = translateMaybe(title ?? 'common.areYouSure', t);
  const resolvedDescription = translateMaybe(description ?? 'common.cannotUndo', t);
  const resolvedConfirm = translateMaybe(confirmLabel ?? 'common.continue', t);
  const resolvedCancel = translateMaybe(cancelLabel ?? 'common.cancel', t);

  const handleOutsideClick = () => {
    if (closeOnOutsideClick && !loading) {
      onClose();
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <AlertDialogContent size='default' onOverlayClick={handleOutsideClick}>
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
