import { apiRequest } from '@/lib/api/client';

export async function getSalesReport(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/reports/sales?${searchParams.toString()}`);
}

export async function getProfitReport(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/reports/profit?${searchParams.toString()}`);
}

export async function getCustomerReport(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/reports/customers?${searchParams.toString()}`);
}

export async function getSupplierReport(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/reports/suppliers?${searchParams.toString()}`);
}

export async function getInventoryReport(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/reports/inventory?${searchParams.toString()}`);
}

export async function getBestSellersReport(query: Record<string, any> = {}) {
  const searchParams = new URLSearchParams(query);
  return apiRequest(`/reports/best-sellers?${searchParams.toString()}`);
}
