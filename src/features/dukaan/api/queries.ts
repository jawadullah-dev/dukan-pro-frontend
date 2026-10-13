import { queryOptions } from '@tanstack/react-query';
import { dukaan } from '@/lib/dukaan';
import type { ListFilters } from '@/lib/dukaan';

export const dukaanKeys = {
  all: ['dukaan'] as const,
  session: () => [...dukaanKeys.all, 'session'] as const,
  dashboard: () => [...dukaanKeys.all, 'dashboard'] as const,
  categories: (f?: ListFilters) => [...dukaanKeys.all, 'categories', f] as const,
  brands: (f?: ListFilters) => [...dukaanKeys.all, 'brands', f] as const,
  products: (f?: ListFilters) => [...dukaanKeys.all, 'products', f] as const,
  product: (id: string) => [...dukaanKeys.all, 'product', id] as const,
  suppliers: (f?: ListFilters) => [...dukaanKeys.all, 'suppliers', f] as const,
  customers: (f?: ListFilters) => [...dukaanKeys.all, 'customers', f] as const,
  customer: (id: string) => [...dukaanKeys.all, 'customer', id] as const,
  purchases: (f?: ListFilters) => [...dukaanKeys.all, 'purchases', f] as const,
  purchase: (id: string) => [...dukaanKeys.all, 'purchase', id] as const,
  stock: (f?: ListFilters) => [...dukaanKeys.all, 'stock', f] as const,
  units: (productId?: string) => [...dukaanKeys.all, 'units', productId] as const,
  sales: (f?: ListFilters) => [...dukaanKeys.all, 'sales', f] as const,
  sale: (id: string) => [...dukaanKeys.all, 'sale', id] as const,
  supplierPayments: (f?: ListFilters) => [...dukaanKeys.all, 'supplierPayments', f] as const,
  expenses: (f?: ListFilters) => [...dukaanKeys.all, 'expenses', f] as const,
  expenseCategories: (f?: ListFilters) => [...dukaanKeys.all, 'expenseCategories', f] as const,
  cash: (f?: ListFilters) => [...dukaanKeys.all, 'cash', f] as const,
  inventoryMovements: (f?: ListFilters) => [...dukaanKeys.all, 'inventoryMovements', f] as const,
  payments: (f?: ListFilters) => [...dukaanKeys.all, 'payments', f] as const
};

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: dukaanKeys.dashboard(),
    queryFn: () => dukaan.getDashboardKpis()
  });

export const customerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dukaanKeys.customer(id),
    queryFn: () => dukaan.getCustomer(id)
  });

export const unitsQueryOptions = (productId?: string) =>
  queryOptions({
    queryKey: dukaanKeys.units(productId),
    queryFn: () => dukaan.listInStockUnits(productId)
  });

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: dukaanKeys.session(),
    queryFn: () => dukaan.getSessionInfo()
  });
