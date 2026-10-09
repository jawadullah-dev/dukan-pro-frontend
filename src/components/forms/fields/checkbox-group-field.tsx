'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { useFieldContext, useFieldInvalid, type BaseFieldProps } from '@/lib/form-context';

export function CheckboxGroupField({
  label,
  description,
  required,
  options,
  className
}: BaseFieldProps & {
  options: { value: string; label: string; disabled?: boolean }[];

  className?: string;
}) {
  const field = useFieldContext<string[]>();
  const isInvalid = useFieldInvalid();

  return (
    <FieldSet>
      <FieldLegend variant='label'>
        {label}
        {required && ' *'}
      </FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldGroup data-slot='checkbox-group' className={cn('gap-3', className)}>
        {options.map((opt) => (
          <Field key={opt.value} orientation='horizontal' data-invalid={isInvalid}>
            <Checkbox
              id={`${field.name}-${opt.value}`}
              name={field.name}
              disabled={opt.disabled}
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `${field.name}-error` : undefined}
              checked={field.state.value.includes(opt.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  field.pushValue(opt.value);
                } else {
                  const index = field.state.value.indexOf(opt.value);
                  if (index > -1) {
                    field.removeValue(index);
                  }
                }
              }}
            />
            <FieldLabel htmlFor={`${field.name}-${opt.value}`} className='font-normal'>
              {opt.label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </FieldSet>
  );
}
