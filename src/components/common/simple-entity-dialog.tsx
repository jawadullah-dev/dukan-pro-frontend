'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { useT } from '@/i18n/use-t';
import { DialogCancelButton, DialogPrimaryButton } from '@/components/common/dialog-actions';
import type { SimpleEntityDialogProps, SimpleEntityDialogBodyProps } from '@/types';

export function SimpleEntityDialog({
  open,
  onOpenChange,
  entity,
  titleAdd,
  titleEdit,
  descriptionAdd,
  descriptionEdit,
  nameLabel,
  namePlaceholder,
  successCreated,
  successUpdated,
  onSave,
  invalidateQueryKey,
  schema
}: SimpleEntityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SimpleEntityDialogBody
          key={entity?.id ?? 'new'}
          open={open}
          entity={entity}
          onOpenChange={onOpenChange}
          titleAdd={titleAdd}
          titleEdit={titleEdit}
          descriptionAdd={descriptionAdd}
          descriptionEdit={descriptionEdit}
          nameLabel={nameLabel}
          namePlaceholder={namePlaceholder}
          successCreated={successCreated}
          successUpdated={successUpdated}
          onSave={onSave}
          invalidateQueryKey={invalidateQueryKey}
          schema={schema}
        />
      ) : null}
    </Dialog>
  );
}

function SimpleEntityDialogBody({
  entity,
  onOpenChange,
  titleAdd,
  titleEdit,
  descriptionAdd,
  descriptionEdit,
  nameLabel,
  namePlaceholder,
  successCreated,
  successUpdated,
  onSave,
  invalidateQueryKey,
  schema
}: SimpleEntityDialogBodyProps) {
  const qc = useQueryClient();
  const isEdit = Boolean(entity);
  const t = useT();

  const save = useMutation({
    mutationFn: async (name: string) => onSave(entity?.id, name),
    onSuccess: () => {
      toast.success(isEdit ? successUpdated : successCreated);
      void qc.invalidateQueries({ queryKey: invalidateQueryKey });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message)
  });

  const resolvedSchema =
    schema ??
    z.object({
      name: z.string().trim().min(1, t('validation.nameRequired'))
    });

  const form = useAppForm({
    defaultValues: { name: entity?.name ?? '' },
    validators: {
      onSubmit: resolvedSchema as never
    },
    onSubmit: ({ value }) => {
      save.mutate(value.name.trim());
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <DialogContent className='sm:max-w-lg'>
      <DialogHeader className='pe-12'>
        <DialogTitle>{isEdit ? titleEdit : titleAdd}</DialogTitle>
        <DialogDescription>{isEdit ? descriptionEdit : descriptionAdd}</DialogDescription>
      </DialogHeader>
      <form className='grid gap-4' onSubmit={handleSubmit}>
        <FieldGroup>
          <form.AppField
            name='name'
            children={(field) => (
              <field.TextField label={nameLabel} required placeholder={namePlaceholder} autoFocus />
            )}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogCancelButton onClick={() => onOpenChange(false)} disabled={save.isPending} />
          <DialogPrimaryButton mode={isEdit ? 'edit' : 'add'} loading={save.isPending} />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
