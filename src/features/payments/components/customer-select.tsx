'use client';

import * as React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/use-t';
import { listCustomers } from '@/features/customers/api/service';
import type { CustomerDTO } from '@/lib/api/types';
import type { CustomerSelectComboboxProps } from '@/types/payment';

const PAGE_SIZE = 20;

export function CustomerSelectCombobox({
  value,
  onSelectCustomer,
  selectedCustomer,
  placeholder,
  disabled
}: CustomerSelectComboboxProps) {
  const t = useT();
  const effectivePlaceholder = placeholder || t('common.select');
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [localCustomer, setLocalCustomer] = React.useState<CustomerDTO | null>(
    selectedCustomer ?? null
  );

  React.useEffect(() => {
    if (selectedCustomer) {
      setLocalCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['customers', 'infinite-select', debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      return listCustomers({
        page: pageParam,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc'
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: open
  });

  const allCustomers = React.useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  const currentCustomer = localCustomer || allCustomers.find((c) => c.id === value) || null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const handleSelect = (customer: CustomerDTO) => {
    setLocalCustomer(customer);
    onSelectCustomer(customer);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalCustomer(null);
    onSelectCustomer(null);
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
              'w-full justify-between font-normal h-9 px-3 text-sm bg-background text-foreground'
            )}
          />
        }
      >
        {currentCustomer ? (
          <div className='flex items-center gap-1.5 truncate text-sm'>
            <span className='font-normal text-foreground'>{currentCustomer.name}</span>
            {currentCustomer.phone && (
              <span className='text-muted-foreground'>({currentCustomer.phone})</span>
            )}
          </div>
        ) : (
          <span className='truncate font-normal text-foreground text-sm'>
            {effectivePlaceholder}
          </span>
        )}

        <div className='flex items-center gap-1 ms-2 shrink-0'>
          {currentCustomer && !disabled && (
            <span
              role='button'
              tabIndex={0}
              onClick={handleClear}
              className='hover:bg-muted rounded p-0.5 text-muted-foreground hover:text-foreground'
            >
              <Icons.close className='size-3.5' />
            </span>
          )}
          <Icons.chevronsUpDown className='size-4 opacity-50' />
        </div>
      </PopoverTrigger>

      <PopoverContent
        side='bottom'
        align='start'
        sideOffset={4}
        className='w-(--anchor-width) min-w-[280px] p-0 overflow-hidden shadow-lg border border-border bg-popover z-50'
      >
        <div className='flex items-center border-b px-2.5 py-1.5 gap-2'>
          <Icons.search className='size-4 shrink-0 text-muted-foreground' />
          <Input
            placeholder={t('payments.searchCustomerPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-7 border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground'
            autoFocus
          />
          {search && (
            <button
              type='button'
              onClick={() => setSearch('')}
              className='text-muted-foreground hover:text-foreground'
            >
              <Icons.close className='size-3.5' />
            </button>
          )}
        </div>

        <div
          className='max-h-60 overflow-y-auto p-1 text-xs divide-y divide-border/30'
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className='flex items-center justify-center py-6 text-muted-foreground gap-2'>
              <Icons.spinner className='size-4 animate-spin' />
              <span>{t('payments.loadingCustomers')}</span>
            </div>
          ) : allCustomers.length === 0 ? (
            <div className='py-6 text-center text-muted-foreground'>
              {debouncedSearch ? t('payments.noCustomersFound') : t('payments.noActiveCustomers')}
            </div>
          ) : (
            <>
              {allCustomers.map((customer) => {
                const isSelected = value === customer.id;
                return (
                  <div
                    key={customer.id}
                    role='option'
                    aria-selected={isSelected}
                    onClick={() => handleSelect(customer)}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <div className='flex flex-col min-w-0'>
                      <span className='font-medium text-xs truncate'>{customer.name}</span>
                      {customer.phone && (
                        <span className='text-[11px] text-muted-foreground'>{customer.phone}</span>
                      )}
                    </div>
                    {isSelected && <Icons.check className='size-4 shrink-0 text-primary ms-2' />}
                  </div>
                );
              })}

              {isFetchingNextPage && (
                <div className='flex items-center justify-center py-2 text-[11px] text-muted-foreground gap-1.5'>
                  <Icons.spinner className='size-3.5 animate-spin' />
                  <span>{t('table.loadMore')}</span>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
