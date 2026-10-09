'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useAppForm } from '@/lib/form';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { createUserMutation, updateUserMutation } from '../api/mutations';
import type { User } from '../api/types';
import { toast } from 'sonner';
import { userSchema, type UserFormValues } from '../schemas/user';
import { ROLE_OPTIONS } from './users-table/options';
import { useT } from '@/i18n/use-t';

interface UserFormSheetProps {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormSheet({ user, open, onOpenChange }: UserFormSheetProps) {
  const t = useT();
  const isEdit = !!user;

  const STATUS_OPTIONS = [
    { value: 'Active', label: t('status.active') },
    { value: 'Inactive', label: t('status.inactive') },
    { value: 'Invited', label: t('status.invited') }
  ];

  const createMutation = useMutation({
    ...createUserMutation,
    onSuccess: () => {
      toast.success(t('users.created'));
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast.error(t('users.createFailed'))
  });

  const updateMutation = useMutation({
    ...updateUserMutation,
    onSuccess: () => {
      toast.success(t('users.updated'));
      onOpenChange(false);
    },
    onError: () => toast.error(t('users.updateFailed'))
  });

  const form = useAppForm({
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      role: user?.role ?? '',
      status: user?.status ?? 'Active'
    } as UserFormValues,
    validators: {
      onSubmit: userSchema(t)
    },
    onSubmit: async ({ value }) => {
      if (isEdit && user) {
        await updateMutation.mutateAsync({ id: user.id, values: value });
      } else {
        await createMutation.mutateAsync(value);
      }
    }
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? t('users.editTitle') : t('users.addTitle')}</SheetTitle>
          <SheetDescription>
            {isEdit ? t('users.editDescription') : t('users.addDescription')}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-auto'>
          <form
            id='user-form-sheet'
            className='space-y-4 p-4 md:p-4'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className='grid grid-cols-2 gap-4'>
                <form.AppField
                  name='first_name'
                  children={(field) => (
                    <field.TextField
                      label={t('users.firstName')}
                      required
                      placeholder={t('users.firstNamePlaceholder')}
                    />
                  )}
                />
                <form.AppField
                  name='last_name'
                  children={(field) => (
                    <field.TextField
                      label={t('users.lastName')}
                      required
                      placeholder={t('users.lastNamePlaceholder')}
                    />
                  )}
                />
              </div>

              <form.AppField
                name='email'
                children={(field) => (
                  <field.TextField
                    label={t('users.email')}
                    required
                    type='email'
                    placeholder={t('users.emailPlaceholder')}
                    startIcon={Icons.mail}
                  />
                )}
              />

              <form.AppField
                name='phone'
                children={(field) => (
                  <field.TextField
                    label={t('users.phone')}
                    required
                    type='tel'
                    inputMode='numeric'
                    placeholder={t('users.phonePlaceholder')}
                    startIcon={Icons.phone}
                  />
                )}
              />

              <form.AppField
                name='role'
                children={(field) => (
                  <field.SelectField
                    label={t('users.role')}
                    required
                    options={ROLE_OPTIONS((key) => t(key))}
                    placeholder={t('users.selectRole')}
                  />
                )}
              />

              <form.AppField
                name='status'
                children={(field) => (
                  <field.SelectField
                    label={t('users.status')}
                    required
                    options={STATUS_OPTIONS}
                    placeholder={t('users.selectStatus')}
                  />
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <SheetFooter>
          <Button
            type='button'
            variant='outline'
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <LoadingButton loading={isPending} type='submit' form='user-form-sheet'>
            {isEdit ? t('users.update') : t('users.create')}
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UserFormSheetTrigger() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='me-2 h-4 w-4' /> {t('users.create')}
      </Button>
      <UserFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
