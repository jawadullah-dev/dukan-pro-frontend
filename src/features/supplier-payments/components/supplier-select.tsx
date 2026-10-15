'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EntityCombobox } from '@/components/common/entity-combobox';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useT } from '@/i18n/use-t';
import type {
  SupplierDTO,
  SupplierSelectComboboxProps,
  SupplierComboboxItem
} from '@/types/supplier-payment';
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
  const [search, debouncedSearch, setSearch] = useDebouncedSearch();
  const [localSupplier, setLocalSupplier] = useState<SupplierDTO | null>(selectedSupplier ?? null);

  useEffect(() => {
    if (selectedSupplier) {
      setLocalSupplier(selectedSupplier);
    }
  }, [selectedSupplier]);

  const { data, isLoading } = useQuery<PaginatedResponse<SupplierDTO>>({
    queryKey: ['suppliers', 'combobox-list', debouncedSearch],
    queryFn: async () => {
      return listSuppliers({
        page: 1,
        pageSize: 50,
        isActive: true,
        search: debouncedSearch || undefined
      });
    }
  });

  const suppliers = data?.items ?? [];
  const currentSupplier = localSupplier || suppliers.find((s) => s.id === value) || null;

  const items: SupplierComboboxItem[] = suppliers.map((s) => ({
    id: s.id,
    label: s.name,
    subLabel: s.phone || undefined,
    raw: s
  }));

  const selectedItem: SupplierComboboxItem | null = currentSupplier
    ? {
        id: currentSupplier.id,
        label: currentSupplier.name,
        subLabel: currentSupplier.phone || undefined,
        raw: currentSupplier
      }
    : null;

  const handleSelect = (item: SupplierComboboxItem | null) => {
    const supp = item?.raw ?? null;
    setLocalSupplier(supp);
    onSelectSupplier(supp);
  };

  return (
    <EntityCombobox<SupplierComboboxItem>
      value={value}
      items={items}
      selectedItem={selectedItem}
      onSelect={handleSelect}
      placeholder={placeholder || t('common.select')}
      searchPlaceholder={t('supplierPayments.searchSupplierInputPlaceholder')}
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
      loadingText={t('supplierPayments.loadingSuppliers')}
      emptyText={t('supplierPayments.noSuppliersFound')}
      clearSelectionTitle={t('supplierPayments.clearSelection')}
      disabled={disabled}
    />
  );
}
