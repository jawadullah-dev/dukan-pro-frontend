'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { EntityCombobox } from '@/components/common/entity-combobox';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { getNextPageParam } from '@/lib/pagination';
import { useT } from '@/i18n/use-t';
import { listCustomers } from '@/features/customers/api/service';
import type { CustomerDTO } from '@/lib/api/types';
import type { CustomerComboboxItem, CustomerSelectComboboxProps } from '@/types/payment';

const PAGE_SIZE = 20;

export function CustomerSelectCombobox({
  value,
  onSelectCustomer,
  selectedCustomer,
  placeholder,
  disabled
}: CustomerSelectComboboxProps) {
  const t = useT();
  const [search, debouncedSearch, setSearch] = useDebouncedSearch();
  const [localCustomer, setLocalCustomer] = useState<CustomerDTO | null>(selectedCustomer ?? null);

  useEffect(() => {
    if (selectedCustomer) {
      setLocalCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  const { data, isLoading } = useInfiniteQuery({
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
    getNextPageParam
  });

  const allCustomers = useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  const currentCustomer = localCustomer || allCustomers.find((c) => c.id === value) || null;

  const items: CustomerComboboxItem[] = allCustomers.map((c) => ({
    id: c.id,
    label: c.name,
    subLabel: c.phone || undefined,
    raw: c
  }));

  const selectedItem: CustomerComboboxItem | null = currentCustomer
    ? {
        id: currentCustomer.id,
        label: currentCustomer.name,
        subLabel: currentCustomer.phone || undefined,
        raw: currentCustomer
      }
    : null;

  const handleSelect = (item: CustomerComboboxItem | null) => {
    const cust = item?.raw ?? null;
    setLocalCustomer(cust);
    onSelectCustomer(cust);
  };

  return (
    <EntityCombobox<CustomerComboboxItem>
      value={value}
      items={items}
      selectedItem={selectedItem}
      onSelect={handleSelect}
      placeholder={placeholder || t('common.select')}
      searchPlaceholder={t('payments.searchCustomerPlaceholder')}
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
      loadingText={t('payments.loadingCustomers')}
      emptyText={t('payments.noCustomersFound')}
      clearSelectionTitle={t('payments.clearCustomer')}
      disabled={disabled}
    />
  );
}
