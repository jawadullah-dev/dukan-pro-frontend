'use client';

import * as React from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useFieldContext, useFieldInvalid } from '@/lib/form-context';
import type { TextFieldProps } from '@/types';
export type { TextFieldProps };

export function TextField({
  label,
  description,
  required,
  startIcon: StartIcon,
  className,
  type,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext<string | number | undefined>();
  const t = useTranslations();
  const isInvalid = useFieldInvalid();
  const isValidating = field.state.meta.isValidating;
  const [showPassword, setShowPassword] = React.useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const useGroup = Boolean(StartIcon) || isPassword;

  const sharedInputProps = {
    ...inputProps,
    id: field.name,
    name: field.name,
    value: field.state.value ?? '',
    onBlur: field.handleBlur,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      field.handleChange(
        type === 'number'
          ? e.target.value === ''
            ? undefined
            : Number(e.target.value)
          : e.target.value
      ),
    'aria-invalid': isInvalid,
    'aria-describedby': isInvalid ? `${field.name}-error` : undefined,
    type: inputType
  };

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {required && ' *'}
      </FieldLabel>
      {useGroup ? (
        <InputGroup
          className={cn(
            'h-9! has-[[data-slot=input-group-control]:focus-visible]:ring-0',
            className
          )}
          data-disabled={inputProps.disabled ? true : undefined}
        >
          {StartIcon ? (
            <InputGroupAddon align='inline-start'>
              <StartIcon className='size-4' />
            </InputGroupAddon>
          ) : null}
          <InputGroupInput {...sharedInputProps} />
          {isPassword ? (
            <InputGroupAddon align='inline-end'>
              <InputGroupButton
                size='icon-xs'
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <Icons.eyeOff /> : <Icons.eye />}
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
          {isValidating ? (
            <InputGroupAddon align='inline-end'>
              <Spinner className='size-4' />
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      ) : (
        <div className='relative'>
          <Input className={className} {...sharedInputProps} />
          {isValidating && <Spinner className='absolute top-1/2 end-3 h-4 w-4 -translate-y-1/2' />}
        </div>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </Field>
  );
}
