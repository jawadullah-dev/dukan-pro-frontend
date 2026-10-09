'use client';

import * as React from 'react';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { useFieldContext, type BaseFieldProps } from '@/lib/form-context';

export function ToggleGroupField({
  label,
  description,
  children
}: Omit<BaseFieldProps, 'required'> & { children: React.ReactNode }) {
  const field = useFieldContext<string[]>();
  const labelId = `${field.name}-label`;

  return (
    <Field>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <ToggleGroup
        multiple
        variant='outline'
        aria-labelledby={labelId}
        value={field.state.value || []}
        onValueChange={(val) => field.handleChange(val)}
      >
        {children}
      </ToggleGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}
