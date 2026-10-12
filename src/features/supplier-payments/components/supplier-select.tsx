'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { SupplierDTO } from '@/types/supplier-payment';
import type { PaginatedResponse } from '@/lib/api/types';

interface SupplierSelectComboboxProps {
  value: string;
  onSelectSupplier: (supplier: SupplierDTO | null) => void;
  selectedSupplier?: SupplierDTO | null;
  placeholder?: string;
  disabled?: boolean;
}

export function SupplierSelectCombobox({
  value,
  onSelectSupplier,
  selectedSupplier,
  placeholder = 'Select a supplier...',
  disabled
}: SupplierSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [localSupplier, setLocalSupplier] = React.useState<SupplierDTO | null>(
    selectedSupplier ?? null
  );

  React.useEffect(() => {
    if (selectedSupplier) {
      setLocalSupplier(selectedSupplier);
    }
  }, [selectedSupplier]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery<PaginatedResponse<SupplierDTO>>({
    queryKey: ['suppliers', 'combobox-list', debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('pageSize', '50');
      params.set('isActive', 'true');
      params.set('sortBy', 'name');
      params.set('sortOrder', 'asc');
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      const res = await fetch(`/api/suppliers?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load suppliers');
      }
      return (await res.json()) as PaginatedResponse<SupplierDTO>;
    },
    enabled: open
  });

  const suppliers = data?.items ?? [];
  const currentSupplier = localSupplier || suppliers.find((s) => s.id === value) || null;

  const handleSelect = (supplier: SupplierDTO) => {
    setLocalSupplier(supplier);
    onSelectSupplier(supplier);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalSupplier(null);
    onSelectSupplier(null);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setSearch('');
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'h-10 w-full justify-between rounded-lg border-input bg-background px-3 py-2 text-start font-normal shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground',
              'text-sm font-normal text-foreground'
            )}
          />
        }
      >
        <span className='flex min-w-0 flex-1 items-center gap-2'>
          <Icons.user className='size-4 shrink-0 text-muted-foreground' />
          {currentSupplier ? (
            <span className='truncate font-medium text-foreground'>{currentSupplier.name}</span>
          ) : (
            <span className='truncate text-sm font-normal text-foreground'>{placeholder}</span>
          )}
        </span>
        <span className='flex shrink-0 items-center gap-1.5'>
          {currentSupplier && !disabled && (
            <span
              role='button'
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocalSupplier(null);
                  onSelectSupplier(null);
                }
              }}
              className='cursor-pointer rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground'
              title='Clear selection'
            >
              <Icons.close className='size-3.5' />
            </span>
          )}
          <Icons.chevronDown className='size-4 shrink-0 text-muted-foreground opacity-70' />
        </span>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className='z-50 w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0 shadow-lg'
      >
        <div className='p-2 pb-1.5'>
          <div className='relative flex items-center'>
            <Icons.search className='pointer-events-none absolute left-2.5 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search supplier by name or phone...'
              className='h-9 pl-8 pr-8 text-sm font-normal text-foreground'
              autoFocus
            />
            {search && (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute right-2.5 text-muted-foreground hover:text-foreground'
              >
                <Icons.close className='size-3.5' />
              </button>
            )}
          </div>
        </div>

        <div className='max-h-60 overflow-y-auto p-1 text-sm'>
          {isLoading && suppliers.length === 0 ? (
            <div className='flex items-center justify-center gap-2 py-6 text-sm font-normal text-muted-foreground'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span>Loading suppliers...</span>
            </div>
          ) : suppliers.length === 0 ? (
            <div className='py-6 text-center text-sm font-normal text-muted-foreground'>
              No active suppliers found
            </div>
          ) : (
            suppliers.map((supplier) => {
              const isSelected = (currentSupplier?.id ?? value) === supplier.id;
              return (
                <div
                  key={supplier.id}
                  onClick={() => handleSelect(supplier)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <span className='truncate text-sm font-medium'>{supplier.name}</span>
                    {supplier.phone && (
                      <span className='text-xs text-muted-foreground'>{supplier.phone}</span>
                    )}
                  </div>
                  {isSelected && <Icons.check className='size-4 shrink-0 text-primary' />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
