'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ListFilters, Paginated } from '@/lib/dukaan';
import { useT } from '@/i18n/use-t';

const PAGE_SIZE = 20;
const EMPTY_EXTRA_ITEMS: NamedEntity[] = [];
const LIST_ID = 'infinite-entity-select-list';

export interface NamedEntity {
  id: string;
  name: string;
  is_active?: boolean;
}

interface InfiniteEntitySelectProps<T extends NamedEntity> {
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
  /** Always shown at the top of the list (e.g. Walk-in). */
  extraItems?: NamedEntity[];
}

export function InfiniteEntitySelect<T extends NamedEntity>({
  value,
  onValueChange,
  queryKey,
  fetchPage,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  selectedLabel,
  activeOnly = true,
  disabled,
  className,
  extraItems = EMPTY_EXTRA_ITEMS
}: InfiniteEntitySelectProps<T>) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [labelCache, setLabelCache] = React.useState<Record<string, string>>({});

  const effPlaceholder = placeholder ?? t('common.select');
  const effSearchPlaceholder = searchPlaceholder ?? t('nav.searchPlaceholder');
  const effEmptyMessage = emptyMessage ?? t('table.noResults');

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: [...queryKey, 'infinite-select', debouncedSearch, activeOnly],
    queryFn: async ({ pageParam }) => {
      const result = await fetchPage({
        page: pageParam,
        limit: PAGE_SIZE,
        ...(debouncedSearch ? { search: debouncedSearch } : {})
      });
      const items = activeOnly
        ? result.items.filter((item) => item.is_active !== false)
        : result.items;
      return { ...result, items };
    },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const loaded = last.page * last.limit;
      return loaded < last.total ? last.page + 1 : undefined;
    },
    enabled: open
  });

  const items = React.useMemo(() => {
    const loaded = query.data?.pages.flatMap((page) => page.items) ?? [];
    const q = debouncedSearch.toLowerCase();
    const extras = (
      q ? extraItems.filter((item) => item.name.toLowerCase().includes(q)) : extraItems
    ) as T[];
    const seen = new Set(extras.map((item) => item.id));
    return [...extras, ...loaded.filter((item) => !seen.has(item.id))];
  }, [query.data, extraItems, debouncedSearch]);

  const displayLabel = value
    ? (selectedLabel ??
      labelCache[value] ??
      items.find((item) => item.id === value)?.name ??
      t('common.selected'))
    : effPlaceholder;

  const onListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (nearBottom && query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch('');
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='outline'
            role='combobox'
            disabled={disabled}
            aria-expanded={open}
            aria-controls={LIST_ID}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              className
            )}
          />
        }
      >
        <span className='truncate'>{displayLabel}</span>
        <Icons.chevronsUpDown className='ms-2 size-4 shrink-0 opacity-50' />
      </PopoverTrigger>
      <PopoverContent className='w-(--anchor-width) p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={effSearchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList id={LIST_ID} className='pt-1' onScroll={onListScroll}>
            <CommandEmpty>{query.isLoading ? t('common.loading') : effEmptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  keywords={[item.name]}
                  data-checked={value === item.id || undefined}
                  onSelect={() => {
                    const next = value === item.id ? '' : item.id;
                    onValueChange(next, next ? item : null);
                    if (next) {
                      setLabelCache((prev) =>
                        prev[item.id] === item.name ? prev : { ...prev, [item.id]: item.name }
                      );
                    }
                    setOpen(false);
                  }}
                >
                  <Icons.check
                    className={cn('me-2 size-4', value === item.id ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className='truncate'>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {query.isFetchingNextPage ? (
              <div className='text-muted-foreground py-2 text-center text-xs'>
                {t('table.loadMore')}
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
