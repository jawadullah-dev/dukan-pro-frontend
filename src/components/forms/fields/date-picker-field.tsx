'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useFieldContext, useFieldInvalid } from '@/lib/form-context';
import { useT } from '@/i18n/use-t';
import type { DatePickerFieldProps, DateRangePickerFieldProps } from '@/types';

export function DatePickerField({
  label,
  description,
  required,
  placeholder,
  disabledDates
}: DatePickerFieldProps) {
  const field = useFieldContext<Date | undefined>();
  const isInvalid = useFieldInvalid();
  const t = useT();
  const defaultPlaceholder = placeholder ?? t('common.pickDate');

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {required && ' *'}
      </FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={field.name}
              variant='outline'
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `${field.name}-error` : undefined}
              className={cn(
                'w-full justify-start text-start font-normal',
                !field.state.value && 'text-muted-foreground'
              )}
            />
          }
        >
          <Icons.calendar className='ms-2 h-4 w-4' />
          {field.state.value ? format(field.state.value, 'PPP') : <span>{defaultPlaceholder}</span>}
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={field.state.value}
            onSelect={(date) => field.handleChange(date)}
            disabled={disabledDates}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </Field>
  );
}

export function DateRangeField({
  label,
  description,
  required,
  placeholder
}: DateRangePickerFieldProps) {
  const field = useFieldContext<DateRange | undefined>();
  const isInvalid = useFieldInvalid();
  const range = field.state.value;
  const t = useT();
  const defaultPlaceholder = placeholder ?? t('common.pickDateRange');

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {required && ' *'}
      </FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={field.name}
              variant='outline'
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `${field.name}-error` : undefined}
              className={cn(
                'w-full justify-start text-start font-normal',
                !range?.from && 'text-muted-foreground'
              )}
            />
          }
        >
          <Icons.calendar className='ms-2 h-4 w-4' />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, 'LLL dd, y')} - {format(range.to, 'LLL dd, y')}
              </>
            ) : (
              format(range.from, 'LLL dd, y')
            )
          ) : (
            <span>{defaultPlaceholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='range'
            selected={range}
            onSelect={field.handleChange}
            numberOfMonths={2}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </Field>
  );
}
