import { queryOptions } from '@tanstack/react-query';
import {
  getBestSellersReport,
  getCustomerReport,
  getInventoryReport,
  getProfitReport,
  getSalesReport,
  getSupplierReport
} from './service';

export const reportKeys = {
  all: ['reports'] as const,
  sales: (query?: Record<string, any>) => [...reportKeys.all, 'sales', query] as const,
  profit: (query?: Record<string, any>) => [...reportKeys.all, 'profit', query] as const,
  customers: (query?: Record<string, any>) => [...reportKeys.all, 'customers', query] as const,
  suppliers: (query?: Record<string, any>) => [...reportKeys.all, 'suppliers', query] as const,
  inventory: (query?: Record<string, any>) => [...reportKeys.all, 'inventory', query] as const,
  bestSellers: (query?: Record<string, any>) => [...reportKeys.all, 'bestSellers', query] as const
};

export const salesReportQueryOptions = (query: Record<string, any> = {}) =>
  queryOptions({
    queryKey: reportKeys.sales(query),
    queryFn: () => getSalesReport(query)
  });

export const profitReportQueryOptions = (query: Record<string, any> = {}) =>
  queryOptions({
    queryKey: reportKeys.profit(query),
    queryFn: () => getProfitReport(query)
  });

export const customerReportQueryOptions = (query: Record<string, any> = {}) =>
  queryOptions({
    queryKey: reportKeys.customers(query),
    queryFn: () => getCustomerReport(query)
  });

export const supplierReportQueryOptions = (query: Record<string, any> = {}) =>
  queryOptions({
    queryKey: reportKeys.suppliers(query),
    queryFn: () => getSupplierReport(query)
  });

export const inventoryReportQueryOptions = (query: Record<string, any> = {}) =>
  queryOptions({
    queryKey: reportKeys.inventory(query),
    queryFn: () => getInventoryReport(query)
  });

export const bestSellersReportQueryOptions = (query: Record<string, any> = {}) =>
  queryOptions({
    queryKey: reportKeys.bestSellers(query),
    queryFn: () => getBestSellersReport(query)
  });
