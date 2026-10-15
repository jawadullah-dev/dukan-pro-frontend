'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Icons } from '@/components/icons';
import { useT } from '@/i18n/use-t';
import { useAppForm } from '@/lib/form';
import { fromPaisa, toPaisa } from '@/lib/dukaan/numbers';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import type { BasePartyDialogProps, BasePartyDialogBodyProps, BasePartyFormState } from '@/types';

export function BasePartyDialog({
  open,
  onOpenChange,
  party,
  titleAdd,
  titleEdit,
  descriptionAdd,
  descriptionEdit,
  openingBalanceLabel,
  namePlaceholder,
  successCreated,
  successUpdated,
  primaryButtonMode = 'save',
  onSave,
  invalidateQueryKey,
  schema
}: BasePartyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <BasePartyDialogBody
          key={party?.id ?? 'new'}
          open={open}
          party={party}
          onOpenChange={onOpenChange}
          titleAdd={titleAdd}
          titleEdit={titleEdit}
          descriptionAdd={descriptionAdd}
          descriptionEdit={descriptionEdit}
          openingBalanceLabel={openingBalanceLabel}
          namePlaceholder={namePlaceholder}
          successCreated={successCreated}
          successUpdated={successUpdated}
          primaryButtonMode={primaryButtonMode}
          onSave={onSave}
          invalidateQueryKey={invalidateQueryKey}
          schema={schema}
        />
      ) : null}
    </Dialog>
  );
}

function BasePartyDialogBody({
  party,
  onOpenChange,
  titleAdd,
  titleEdit,
  descriptionAdd,
  descriptionEdit,
  openingBalanceLabel,
  namePlaceholder,
  successCreated,
  successUpdated,
  primaryButtonMode = 'save',
  onSave,
  invalidateQueryKey,
  schema
}: BasePartyDialogBodyProps) {
  const qc = useQueryClient();
  const t = useT();
  const isEdit = Boolean(party);

  const save = useMutation({
    mutationFn: async (value: BasePartyFormState) => {
      const payload = {
        name: value.name.trim(),
        phone: value.phone?.trim() || undefined,
        address: value.address?.trim() || undefined,
        notes: value.notes?.trim() || undefined,
        openingBalance: toPaisa(Number(value.opening_balance || 0)),
        isActive: true
      };

      return onSave(payload, party?.id);
    },
    onSuccess: () => {
      toast.success(isEdit ? successUpdated : successCreated);
      void qc.invalidateQueries({ queryKey: invalidateQueryKey });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const form = useAppForm({
    defaultValues: {
      name: party?.name ?? '',
      phone: party?.phone ?? '',
      address: party?.address ?? '',
      notes: party?.notes ?? '',
      opening_balance: party ? fromPaisa(party.openingBalance) : 0
    },
    validators: schema ? { onSubmit: schema as never } : undefined,
    onSubmit: ({ value }) => {
      save.mutate(value as BasePartyFormState);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <DialogContent className='flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
      <DialogHeader className='shrink-0 px-4 pt-4 pe-12'>
        <DialogTitle>{isEdit ? titleEdit : titleAdd}</DialogTitle>
        <DialogDescription>{isEdit ? descriptionEdit : descriptionAdd}</DialogDescription>
      </DialogHeader>
      <form className='flex min-h-0 flex-1 flex-col' onSubmit={handleSubmit}>
        <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4'>
          <FieldGroup className='gap-4'>
            <form.AppField
              name='name'
              children={(field) => (
                <field.TextField
                  label={t('dukaan.party.name')}
                  required
                  disabled={party?.isSystem}
                  autoFocus={!party?.isSystem}
                  placeholder={namePlaceholder}
                />
              )}
            />
            <form.AppField
              name='phone'
              children={(field) => (
                <field.TextField
                  label={t('dukaan.party.phone')}
                  type='tel'
                  inputMode='numeric'
                  placeholder={t('users.phonePlaceholder')}
                  startIcon={Icons.phone}
                />
              )}
            />
            <form.AppField
              name='address'
              children={(field) => <field.TextField label={t('dukaan.party.address')} />}
            />
            <form.AppField
              name='opening_balance'
              children={(field) => <field.TextField label={openingBalanceLabel} type='number' />}
            />
            <form.AppField
              name='notes'
              children={(field) => <field.TextareaField label={t('dukaan.party.notes')} />}
            />
          </FieldGroup>
        </div>
        <DialogFooter className='mx-0 mb-0 shrink-0 gap-2 sm:gap-2.5'>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={save.isPending} />
          <DialogPrimaryButton mode={primaryButtonMode} loading={save.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
