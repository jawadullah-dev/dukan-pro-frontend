'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ACTION_LABELS } from '../constants/ui';

interface DialogCancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/** Outline dismiss control — Cancel text + close icon. */
export function DialogCancelButton({ onClick, disabled }: DialogCancelButtonProps) {
  return (
    <Button type='button' variant='outline' disabled={disabled} onClick={onClick}>
      <Icons.close className='mr-2 h-4 w-4' />
      {ACTION_LABELS.cancel}
    </Button>
  );
}

type DialogPrimaryMode = 'add' | 'edit' | 'save';

interface DialogPrimaryButtonProps {
  mode: DialogPrimaryMode;
  disabled?: boolean;
  /** Shows the shared button spinner while a mutation runs. */
  loading?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  variant?: 'default' | 'destructive';
}

const PRIMARY_ICON = {
  add: Icons.add,
  edit: Icons.edit,
  save: Icons.check
} as const;

/** Primary dialog action — Add / Edit / Save with matching icon. */
export function DialogPrimaryButton({
  mode,
  disabled,
  loading = false,
  type = 'submit',
  onClick,
  variant = 'default'
}: DialogPrimaryButtonProps) {
  const Icon = PRIMARY_ICON[mode];
  return (
    <Button type={type} variant={variant} disabled={disabled} isLoading={loading} onClick={onClick}>
      <Icon className='mr-2 h-4 w-4' />
      {ACTION_LABELS[mode]}
    </Button>
  );
}

interface DialogConfirmButtonProps {
  disabled?: boolean;
  loading?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  label?: string;
}

/** Destructive confirm (cancel payment / expense / etc.). */
export function DialogConfirmButton({
  disabled,
  loading = false,
  type = 'submit',
  onClick,
  label = ACTION_LABELS.confirm
}: DialogConfirmButtonProps) {
  return (
    <Button
      type={type}
      variant='destructive'
      disabled={disabled}
      isLoading={loading}
      onClick={onClick}
    >
      <Icons.trash className='mr-2 h-4 w-4' />
      {label}
    </Button>
  );
}
