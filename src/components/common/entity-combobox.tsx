'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { EntityComboboxItem, EntityComboboxProps } from '@/types';

export function EntityCombobox<T extends EntityComboboxItem = EntityComboboxItem>({
  value,
  items,
  selectedItem,
  onSelect,
  placeholder = '',
  searchPlaceholder = '',
  search,
  onSearchChange,
  isLoading,
  loadingText = '',
  emptyText = '',
  clearSelectionTitle = '',
  disabled,
  className,
  renderTriggerLeading,
  onAddNewClick,
  addNewLabel
}: EntityComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const currentItem = selectedItem ?? items.find((item) => item.id === value) ?? null;

  const handleSelect = (item: T) => {
    onSelect(item);
    setOpen(false);
    onSearchChange('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    onSearchChange('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) onSearchChange('');
  };

  const handleAddNew = () => {
    setOpen(false);
    onAddNewClick?.();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
              !currentItem && 'text-muted-foreground',
              className
            )}
          />
        }
      >
        <span className='truncate text-start flex-1 text-sm font-normal text-foreground flex items-center gap-2'>
          {renderTriggerLeading}
          {currentItem ? (
            <span className='flex items-center gap-2 truncate'>
              <span className='font-normal text-foreground truncate'>{currentItem.label}</span>
              {currentItem.subLabel ? (
                <span className='text-xs text-muted-foreground'>({currentItem.subLabel})</span>
              ) : null}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>

        <span className='flex items-center gap-1.5 ms-2'>
          {currentItem && !disabled ? (
            <span
              role='button'
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(null);
                }
              }}
              className='cursor-pointer rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground'
              title={clearSelectionTitle}
            >
              <Icons.close className='size-3.5' />
            </span>
          ) : null}
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className='h-9 ps-8 pe-8 text-sm font-normal text-foreground'
              autoFocus
            />
            {search ? (
              <button
                type='button'
                onClick={() => onSearchChange('')}
                className='absolute end-2.5 text-muted-foreground hover:text-foreground'
              >
                <Icons.close className='size-3.5' />
              </button>
            ) : null}
          </div>
        </div>

        <div className='max-h-60 overflow-y-auto p-1 text-sm'>
          {isLoading && items.length === 0 ? (
            <div className='flex items-center justify-center gap-2 py-6 text-sm font-normal text-muted-foreground'>
              <Icons.spinner className='size-4 animate-spin text-primary' />
              <span>{loadingText}</span>
            </div>
          ) : items.length === 0 ? (
            <div className='py-6 text-center text-sm font-normal text-muted-foreground'>
              {emptyText}
            </div>
          ) : (
            items.map((item) => {
              const isSelected = (currentItem?.id ?? value) === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className='flex flex-col'>
                    <span className='font-normal text-foreground'>{item.label}</span>
                    {item.subLabel ? (
                      <span className='text-xs text-muted-foreground'>{item.subLabel}</span>
                    ) : null}
                  </div>
                  {isSelected && <Icons.check className='size-4 text-primary' />}
                </div>
              );
            })
          )}
        </div>

        {onAddNewClick && addNewLabel ? (
          <div className='border-t border-border/60 p-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleAddNew}
              className='w-full justify-start text-xs font-normal text-primary hover:bg-primary/10'
            >
              <Icons.add className='size-3.5 me-1.5' />
              <span>{addNewLabel}</span>
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
