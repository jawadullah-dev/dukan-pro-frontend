'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { EntityCombobox } from '@/components/common/entity-combobox';
import { Icons } from '@/components/icons';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { getNextPageParam } from '@/lib/pagination';
import { useT } from '@/i18n/use-t';
import { listExpenseCategories } from '../api/service';
import type {
  ExpenseCategoryDTO,
  CategorySelectComboboxProps,
  CategoryComboboxItem
} from '@/types/expense';

const PAGE_SIZE = 20;

export function CategorySelectCombobox({
  value,
  onSelectCategory,
  selectedCategory,
  placeholder,
  disabled,
  onAddNewCategoryClick
}: CategorySelectComboboxProps) {
  const t = useT();
  const [search, debouncedSearch, setSearch] = useDebouncedSearch();
  const [localCategory, setLocalCategory] = useState<ExpenseCategoryDTO | null>(
    selectedCategory ?? null
  );

  useEffect(() => {
    if (selectedCategory) {
      setLocalCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const { data, isLoading } = useInfiniteQuery({
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
    getNextPageParam
  });

  const allCategories = useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  const currentCategory = localCategory || allCategories.find((c) => c.id === value) || null;

  const items: CategoryComboboxItem[] = allCategories.map((c) => ({
    id: c.id,
    label: c.name,
    raw: c
  }));

  const selectedItem: CategoryComboboxItem | null = currentCategory
    ? {
        id: currentCategory.id,
        label: currentCategory.name,
        raw: currentCategory
      }
    : null;

  const handleSelect = (item: CategoryComboboxItem | null) => {
    const cat = item?.raw ?? null;
    setLocalCategory(cat);
    onSelectCategory(cat);
  };

  return (
    <EntityCombobox<CategoryComboboxItem>
      value={value}
      items={items}
      selectedItem={selectedItem}
      onSelect={handleSelect}
      placeholder={placeholder || t('common.select')}
      searchPlaceholder={t('expenses.searchCategoryPlaceholder')}
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
      loadingText={t('expenses.loadingCategories')}
      emptyText={t('expenses.noCategoriesFound')}
      clearSelectionTitle={t('expenses.clearCategorySelection')}
      disabled={disabled}
      renderTriggerLeading={<Icons.dashboard className='size-4 shrink-0 text-muted-foreground' />}
      onAddNewClick={onAddNewCategoryClick}
      addNewLabel={t('expenses.addNewCategory')}
    />
  );
}
