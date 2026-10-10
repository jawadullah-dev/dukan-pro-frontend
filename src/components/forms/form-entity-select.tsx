'use client';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import type { ListFilters, Paginated } from '@/lib/dukaan';
import { InfiniteEntitySelect, type NamedEntity } from './infinite-entity-select';

interface FormEntitySelectProps<T extends NamedEntity> {
  label: string;
  required?: boolean;
  value: string;
  onValueChange: (value: string, item: T | null) => void;
  onBlur?: () => void;
  isInvalid: boolean;
  errors: Array<{ message?: string } | undefined>;
  name: string;
  queryKey: readonly unknown[];
  fetchPage: (filters: ListFilters) => Promise<Paginated<T>>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  selectedLabel?: string;
  activeOnly?: boolean;
  disabled?: boolean;
  className?: string;
  extraItems?: NamedEntity[];
}

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
