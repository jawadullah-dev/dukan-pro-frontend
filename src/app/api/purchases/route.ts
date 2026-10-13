import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';
import type { PurchaseDTO } from '@/lib/api/types';

interface PurchaseListPayload {
  items?: PurchaseDTO[];
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const sortBy = request.nextUrl.searchParams.get('sortBy');
  const sortOrder = request.nextUrl.searchParams.get('sortOrder');

  return proxyToBackend(request, '/purchases', {
    allowedParams: [
      'page',
      'pageSize',
      'search',
      'supplierId',
      'status',
      'isOpeningStock',
      'from',
      'to',
      'sortBy',
      'sortOrder'
    ],
    transformResponse: (payload: unknown) => {
      const data = payload as PurchaseListPayload | null;
      if (!data || !Array.isArray(data.items)) return payload;
      let items = [...data.items];
      if (sortBy === 'status') {
        items.sort((a: PurchaseDTO, b: PurchaseDTO) => {
          const sA = (a.status || '').toLowerCase();
          const sB = (b.status || '').toLowerCase();
          return sortOrder === 'desc' ? sB.localeCompare(sA) : sA.localeCompare(sB);
        });
      }
      return { ...data, items };
    }
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/purchases');
}
