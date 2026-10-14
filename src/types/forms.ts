import type * as React from 'react';
import type { DropzoneProps } from 'react-dropzone';
import type { Input } from '@/components/ui/input';
import type { BaseFieldProps } from '@/lib/form-context';
import type { ListFilters, Paginated } from '@/lib/dukaan';

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
