'use client';

import * as React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { listExpenseCategories } from '../api/service';
import type { ExpenseCategoryDTO } from '@/types/expense';

interface CategorySelectComboboxProps {
  value: string;
  onSelectCategory: (category: ExpenseCategoryDTO | null) => void;
  selectedCategory?: ExpenseCategoryDTO | null;
  placeholder?: string;
  disabled?: boolean;
  onAddNewCategoryClick?: () => void;
}

const PAGE_SIZE = 20;

export function CategorySelectCombobox({
  value,
  onSelectCategory,
  selectedCategory,
  placeholder = 'Select category...',
  disabled,
  onAddNewCategoryClick
}: CategorySelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [localCategory, setLocalCategory] = React.useState<ExpenseCategoryDTO | null>(
    selectedCategory ?? null
  );

  React.useEffect(() => {
    if (selectedCategory) {
      setLocalCategory(selectedCategory);
    }
  }, [selectedCategory]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['expense-categories', 'infinite-select', debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      return listExpenseCategories({
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

  const allCategories = React.useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  const currentCategory = localCategory || allCategories.find((c) => c.id === value) || null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const handleSelect = (cat: ExpenseCategoryDTO) => {
    setLocalCategory(cat);
    onSelectCategory(cat);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalCategory(null);
    onSelectCategory(null);
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
              'h-10 w-full justify-between rounded-lg border-input bg-background px-3 py-2 text-start font-normal shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground',
              'text-sm font-normal text-foreground'
            )}
          />
        }
      >
        <span className='flex min-w-0 flex-1 items-center gap-2'>
          <Icons.dashboard className='size-4 shrink-0 text-muted-foreground' />
          {currentCategory ? (
            <span className='truncate font-medium text-foreground'>{currentCategory.name}</span>
          ) : (
            <span className='truncate text-sm font-normal text-muted-foreground'>
              {placeholder}
            </span>
          )}
        </span>
        <span className='flex shrink-0 items-center gap-1.5'>
          {currentCategory && !disabled && (
            <span
              role='button'
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocalCategory(null);
                  onSelectCategory(null);
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
            <Icons.search className='pointer-events-none absolute start-2.5 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search category...'
              className='h-9 ps-8 pe-8 text-sm font-normal text-foreground w-full'
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

        <div
          onScroll={handleScroll}
          className='max-h-56 overflow-y-auto p-1 text-sm divide-y divide-border/20'
        >
          {isLoading && allCategories.length === 0 ? (
            <div className='flex items-center justify-center gap-2 py-6 text-sm font-normal text-muted-foreground'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span>Loading categories...</span>
            </div>
          ) : allCategories.length === 0 ? (
            <div className='py-6 text-center text-sm font-normal text-muted-foreground'>
              No expense categories found
            </div>
          ) : (
            allCategories.map((cat) => {
              const isSelected = (currentCategory?.id ?? value) === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelect(cat)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <span className='truncate text-sm font-medium'>{cat.name}</span>
                  {isSelected && <Icons.check className='size-4 shrink-0 text-primary' />}
                </div>
              );
            })
          )}

          {isFetchingNextPage && (
            <div className='flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground'>
              <Icons.spinner className='size-3 animate-spin text-primary' />
              <span>Loading more...</span>
            </div>
          )}
        </div>

        {onAddNewCategoryClick && (
          <div className='border-t border-border/60 p-1.5 bg-muted/20'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => {
                setOpen(false);
                onAddNewCategoryClick();
              }}
              className='w-full justify-start text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 gap-1.5'
            >
              <Icons.add className='size-3.5' />
              <span>Add new category</span>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
