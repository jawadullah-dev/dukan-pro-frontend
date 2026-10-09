'use client';

import { createFormHookContexts } from '@tanstack/react-form';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export function useFieldInvalid() {
  const field = useFieldContext();
  return field.state.meta.isTouched && !field.state.meta.isValid;
}

export type BaseFieldProps = {
  label: string;
  description?: string;

  required?: boolean;
};
