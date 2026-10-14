'use client';

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Slider } from '@/components/ui/slider';
import { useFieldContext } from '@/lib/form-context';
import type { SliderFieldProps } from '@/types';

export function SliderField({
  label,
  description,
  min = 0,
  max = 100,
  step = 1
}: SliderFieldProps) {
  const field = useFieldContext<number>();
  const labelId = `${field.name}-label`;

  return (
    <Field>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <div className='px-1'>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[field.state.value]}
          onValueChange={(v) => field.handleChange(Array.isArray(v) ? v[0] : v)}
          onBlur={field.handleBlur}
          aria-labelledby={labelId}
        />
        <div className='text-muted-foreground mt-1 flex justify-between text-xs tabular-nums'>
          <span>{min}</span>
          <span className='text-foreground font-medium'>{field.state.value}</span>
          <span>{max}</span>
        </div>
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}
