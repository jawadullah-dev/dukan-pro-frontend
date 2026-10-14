'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/use-t';
import type { SupplierDTO, SupplierSelectComboboxProps } from '@/types/supplier-payment';
import type { PaginatedResponse } from '@/lib/api/types';
import { listSuppliers } from '@/features/suppliers/api/service';

export function SupplierSelectCombobox({
  value,
  onSelectSupplier,
  selectedSupplier,
  placeholder,
  disabled
}: SupplierSelectComboboxProps) {
  const t = useT();
  const effectivePlaceholder = placeholder || t('common.select');
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
      return listSuppliers({
        page: 1,
        pageSize: 50,
        isActive: true,
        search: debouncedSearch || undefined
      });
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
    setSearch('');
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch('');
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
              'w-full justify-between font-normal h-10 text-sm bg-background text-foreground',
              !currentSupplier && 'text-muted-foreground'
            )}
          />
        }
      >
        <span className='truncate text-start flex-1 text-sm font-normal text-foreground'>
          {currentSupplier ? (
            <span className='flex items-center gap-2'>
              <span className='font-normal text-foreground'>{currentSupplier.name}</span>
              {currentSupplier.phone && (
                <span className='text-xs text-muted-foreground'>({currentSupplier.phone})</span>
              )}
            </span>
          ) : (
            <span>{effectivePlaceholder}</span>
          )}
        </span>

        <span className='flex items-center gap-1.5 ms-2'>
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
              title={t('supplierPayments.clearSelection')}
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
            <Icons.search className='pointer-events-none absolute start-2.5 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('supplierPayments.searchSupplierInputPlaceholder')}
              className='h-9 ps-8 pe-8 text-sm font-normal text-foreground'
              autoFocus
            />
            {search && (
              <button
                type='button'
                onClick={() => setSearch('')}
                className='absolute end-2.5 text-muted-foreground hover:text-foreground'
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
              <span>{t('supplierPayments.loadingSuppliers')}</span>
            </div>
          ) : suppliers.length === 0 ? (
            <div className='py-6 text-center text-sm font-normal text-muted-foreground'>
              {t('supplierPayments.noSuppliersFound')}
            </div>
          ) : (
            suppliers.map((supplier) => {
              const isSelected = (currentSupplier?.id ?? value) === supplier.id;
              return (
                <div
                  key={supplier.id}
                  onClick={() => handleSelect(supplier)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className='flex flex-col'>
                    <span className='font-normal text-foreground'>{supplier.name}</span>
                    {supplier.phone && (
                      <span className='text-xs text-muted-foreground'>{supplier.phone}</span>
                    )}
                  </div>
                  {isSelected && <Icons.check className='size-4 text-primary' />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
