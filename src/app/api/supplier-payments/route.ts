import { NextRequest } from 'next/server';
import { proxyToBackend, type PaginatedListPayload } from '@/lib/api/proxy';
import type { SupplierPaymentDTO } from '@/types/supplier-payment';

const SUPPLIER_PAYMENT_FILTER_PARAMS = [
  'page',
  'pageSize',
  'search',
  'supplierId',
  'purchaseId',
  'status',
  'from',
  'to',
  'sortBy',
  'sortOrder'
];

export async function GET(request: NextRequest) {
  const sortBy = request.nextUrl.searchParams.get('sortBy');
  const sortOrder = request.nextUrl.searchParams.get('sortOrder');

  return proxyToBackend(request, '/supplier-payments', {
    allowedParams: SUPPLIER_PAYMENT_FILTER_PARAMS,
    transformResponse: (payload: unknown) => {
      const data = payload as PaginatedListPayload<SupplierPaymentDTO> | null;
      if (!data || !Array.isArray(data.items)) return payload;
      let items: SupplierPaymentDTO[] = [...data.items];

      if (sortBy === 'supplierName') {
        items.sort((a, b) => {
          const nameA = (a.supplierName || '').toLowerCase();
          const nameB = (b.supplierName || '').toLowerCase();
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
      } else if (sortBy === 'purchaseNo') {
        items.sort((a, b) => {
          const pA = (a.purchaseNo || '').toLowerCase();
          const pB = (b.purchaseNo || '').toLowerCase();
          return sortOrder === 'asc' ? pA.localeCompare(pB) : pB.localeCompare(pA);
        });
      }

      return {
        ...data,
        items,
        total: data.total ?? 0,
        page: data.page ?? 1,
        pageSize: data.pageSize ?? 20
      };
    }
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/supplier-payments');
}
