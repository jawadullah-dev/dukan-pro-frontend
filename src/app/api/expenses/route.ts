import { NextRequest } from 'next/server';
import { proxyToBackend, type PaginatedListPayload } from '@/lib/api/proxy';
import type { ExpenseDTO } from '@/types/expense';

const EXPENSE_FILTER_PARAMS = [
  'page',
  'pageSize',
  'search',
  'categoryId',
  'status',
  'from',
  'to',
  'sortBy',
  'sortOrder'
];

export async function GET(request: NextRequest) {
  const sortBy = request.nextUrl.searchParams.get('sortBy');
  const sortOrder = request.nextUrl.searchParams.get('sortOrder');

  return proxyToBackend(request, '/expenses', {
    allowedParams: EXPENSE_FILTER_PARAMS,
    transformResponse: (payload: unknown) => {
      const data = payload as PaginatedListPayload<ExpenseDTO> | null;
      if (!data || !Array.isArray(data.items)) return payload;
      let items: ExpenseDTO[] = [...data.items];
      if (sortBy === 'categoryName') {
        items.sort((a, b) => {
          const cA = (a.categoryName || '').toLowerCase();
          const cB = (b.categoryName || '').toLowerCase();
          return sortOrder === 'asc' ? cA.localeCompare(cB) : cB.localeCompare(cA);
        });
      } else if (sortBy === 'description') {
        items.sort((a, b) => {
          const dA = (a.description || '').toLowerCase();
          const dB = (b.description || '').toLowerCase();
          return sortOrder === 'asc' ? dA.localeCompare(dB) : dB.localeCompare(dA);
        });
      } else if (sortBy === 'status') {
        items.sort((a, b) => {
          return sortOrder === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
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
  return proxyToBackend(request, '/expenses');
}
