'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/use-t';
import { ACTION_LABELS } from '@/features/dukaan/constants/ui';

interface DialogCancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DialogCancelButton({ onClick, disabled }: DialogCancelButtonProps) {
  const t = useT();
  return (
    <Button type='button' variant='outline' disabled={disabled} onClick={onClick}>
      <Icons.close className='me-2 h-4 w-4' />
      {t('common.cancel')}
    </Button>
  );
}

type DialogPrimaryMode = 'add' | 'edit' | 'save';

interface DialogPrimaryButtonProps {
  mode: DialogPrimaryMode;
  disabled?: boolean;

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

export function DialogPrimaryButton({
  mode,
  disabled,
  loading = false,
  type = 'submit',
  onClick,
  variant = 'default'
}: DialogPrimaryButtonProps) {
  const t = useT();
  const Icon = PRIMARY_ICON[mode];
  return (
    <Button type={type} variant={variant} disabled={disabled} isLoading={loading} onClick={onClick}>
      <Icon className='me-2 h-4 w-4' />
      {t(`common.${mode}` as const)}
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

export function DialogConfirmButton({
  disabled,
  loading = false,
  type = 'submit',
  onClick,
  label
}: DialogConfirmButtonProps) {
  const t = useT();
  return (
    <Button
      type={type}
      variant='destructive'
      disabled={disabled}
      isLoading={loading}
      onClick={onClick}
    >
      <Icons.trash className='me-2 h-4 w-4' />
      {label ?? t('common.confirm')}
    </Button>
  );
}
