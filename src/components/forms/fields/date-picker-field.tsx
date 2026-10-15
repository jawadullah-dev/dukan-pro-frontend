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
import type { DatePickerFieldProps, DateRangePickerFieldProps, DateFieldShellProps } from '@/types';

function DateFieldShell({
  name,
  label,
  description,
  required,
  isInvalid,
  errors,
  hasValue,
  displayText,
  children
}: DateFieldShellProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && ' *'}
      </FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type='button'
              id={name}
              variant='outline'
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? `${name}-error` : undefined}
              className={cn(
                'w-full justify-start text-start font-normal',
                !hasValue && 'text-muted-foreground'
              )}
            />
          }
        >
          <Icons.calendar className='ms-2 h-4 w-4' />
          {displayText}
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          {children}
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError id={`${name}-error`} errors={errors as never} />}
    </Field>
  );
}

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
    <DateFieldShell
      name={field.name}
      label={label}
      description={description}
      required={required}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
      hasValue={Boolean(field.state.value)}
      displayText={
        field.state.value ? format(field.state.value, 'PPP') : <span>{defaultPlaceholder}</span>
      }
    >
      <Calendar
        mode='single'
        selected={field.state.value}
        onSelect={(date) => field.handleChange(date)}
        disabled={disabledDates}
        autoFocus
      />
    </DateFieldShell>
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

  const displayText = range?.from ? (
    range.to ? (
      <>
        {format(range.from, 'LLL dd, y')} - {format(range.to, 'LLL dd, y')}
      </>
    ) : (
      format(range.from, 'LLL dd, y')
    )
  ) : (
    <span>{defaultPlaceholder}</span>
  );

  return (
    <DateFieldShell
      name={field.name}
      label={label}
      description={description}
      required={required}
      isInvalid={isInvalid}
      errors={field.state.meta.errors}
      hasValue={Boolean(range?.from)}
      displayText={displayText}
    >
      <Calendar
        mode='range'
        selected={range}
        onSelect={field.handleChange}
        numberOfMonths={2}
        autoFocus
      />
    </DateFieldShell>
  );
}
