import type * as React from 'react';
import type { DropzoneProps } from 'react-dropzone';
import type { Textarea } from '@/components/ui/textarea';
import type { Input } from '@/components/ui/input';
import type { ListFilters, Paginated } from '@/lib/dukaan';

export interface BaseFieldProps {
  label: string;
  description?: string;
  required?: boolean;
}

export interface FormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupFieldProps extends BaseFieldProps {
  options: FormFieldOption[];
  className?: string;
}

export interface ComboboxFieldProps extends BaseFieldProps {
  options: FormFieldOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export interface DatePickerFieldProps extends BaseFieldProps {
  placeholder?: string;
  disabledDates?: (date: Date) => boolean;
}

export interface DateRangePickerFieldProps extends BaseFieldProps {
  placeholder?: string;
}

export interface FileUploadFieldProps extends BaseFieldProps {
  maxSize?: number;
  maxFiles?: number;
}

export interface RadioGroupFieldProps extends BaseFieldProps {
  options: FormFieldOption[];
}

export interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string;
  options: FormFieldOption[];
}

export interface SliderFieldProps extends Omit<BaseFieldProps, 'required'> {
  min?: number;
  max?: number;
  step?: number;
}

export interface TagsFieldProps extends BaseFieldProps {
  placeholder?: string;
}

export interface TextareaFieldProps
  extends
    BaseFieldProps,
    Omit<React.ComponentProps<typeof Textarea>, 'value' | 'onChange' | 'onBlur'> {
  showCount?: boolean;
}

export interface ToggleGroupFieldProps extends Omit<BaseFieldProps, 'required'> {
  children: React.ReactNode;
}

export interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File[];
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;
  onUpload?: (files: File[]) => Promise<void>;
  progresses?: Record<string, number>;
  accept?: DropzoneProps['accept'];
  maxSize?: DropzoneProps['maxSize'];
  maxFiles?: DropzoneProps['maxFiles'];
  multiple?: boolean;
  disabled?: boolean;
}

export interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
}

export type IconComponent = React.ComponentType<{ className?: string }>;

export type TextFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'onBlur'> & {
    startIcon?: IconComponent;
  };

export interface NamedEntity {
  id: string;
  name: string;
  is_active?: boolean;
}

export interface FormEntitySelectProps<T extends NamedEntity> {
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

export interface InfiniteEntitySelectProps<T extends NamedEntity> {
  value: string;
  onValueChange: (value: string, item: T | null) => void;
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
