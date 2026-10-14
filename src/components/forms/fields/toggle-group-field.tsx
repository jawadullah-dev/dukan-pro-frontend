'use client';

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { useFieldContext } from '@/lib/form-context';
import type { ToggleGroupFieldProps } from '@/types';

export function ToggleGroupField({ label, description, children }: ToggleGroupFieldProps) {
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
