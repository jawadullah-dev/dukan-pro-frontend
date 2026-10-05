/**
 * React Query options for dukaan Release 1.
 * Data access lives in `@/lib/dukaan` (operations). When wiring a real API,
 * introduce `service.ts` here and point queryFns at it — UI stays unchanged.
 * Field names match ERD v2 / future Postgres columns; money amounts are paisa.
 */
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

export const categoriesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.categories(filters),
    queryFn: () => dukaan.listCategories(filters)
  });

export const brandsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.brands(filters),
    queryFn: () => dukaan.listBrands(filters)
  });

export const productsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.products(filters),
    queryFn: () => dukaan.listProducts(filters)
  });

export const suppliersQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.suppliers(filters),
    queryFn: () => dukaan.listSuppliers(filters)
  });

export const customersQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.customers(filters),
    queryFn: () => dukaan.listCustomers(filters)
  });

export const customerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dukaanKeys.customer(id),
    queryFn: () => dukaan.getCustomer(id)
  });

export const purchasesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.purchases(filters),
    queryFn: () => dukaan.listPurchases(filters)
  });

export const purchaseQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dukaanKeys.purchase(id),
    queryFn: () => dukaan.getPurchase(id)
  });

export const stockQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.stock(filters),
    queryFn: () => dukaan.listStock(filters)
  });

export const unitsQueryOptions = (productId?: string) =>
  queryOptions({
    queryKey: dukaanKeys.units(productId),
    queryFn: () => dukaan.listInStockUnits(productId)
  });

export const salesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.sales(filters),
    queryFn: () => dukaan.listSales(filters)
  });

export const saleQueryOptions = (id: string) =>
  queryOptions({
    queryKey: dukaanKeys.sale(id),
    queryFn: () => dukaan.getSale(id)
  });

export const supplierPaymentsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.supplierPayments(filters),
    queryFn: () => dukaan.listSupplierPayments(filters)
  });

export const expensesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.expenses(filters),
    queryFn: () => dukaan.listExpenses(filters)
  });

export const expenseCategoriesQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.expenseCategories(filters),
    queryFn: () => dukaan.listExpenseCategories(filters)
  });

export const cashQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.cash(filters),
    queryFn: () => dukaan.listCashMovements(filters)
  });

export const inventoryMovementsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.inventoryMovements(filters),
    queryFn: () => dukaan.listInventoryMovements(filters)
  });

export const paymentsQueryOptions = (filters: ListFilters = {}) =>
  queryOptions({
    queryKey: dukaanKeys.payments(filters),
    queryFn: () => dukaan.listPayments(filters)
  });

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: dukaanKeys.session(),
    queryFn: () => dukaan.getSessionInfo()
  });
