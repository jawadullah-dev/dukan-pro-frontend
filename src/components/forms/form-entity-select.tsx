'use client';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import type { ListFilters, Paginated } from '@/lib/dukaan';
import { InfiniteEntitySelect } from './infinite-entity-select';
import type { NamedEntity, FormEntitySelectProps } from '@/types';
export type { FormEntitySelectProps };

export function FormEntitySelect<T extends NamedEntity>({
  label,
  required,
  value,
  onValueChange,
  onBlur,
  isInvalid,
  errors,
  name,
  ...selectProps
}: FormEntitySelectProps<T>) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={name}>
        {label}
        {required ? ' *' : null}
      </FieldLabel>
      <div onBlur={onBlur}>
        <InfiniteEntitySelect
          value={value}
          onValueChange={onValueChange}
          className='w-full'
          {...selectProps}
        />
      </div>
      {isInvalid ? <FieldError id={`${name}-error`} errors={errors} /> : null}
    </Field>
  );
}
