import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';
import type { PaymentDTO, PaginatedListPayload } from '@/lib/api/types';
import type { PaymentCreateBody } from '@/types/payment';

function getPaymentMethod(item: PaymentDTO) {
  const match = item.notes?.match(/\[Method:\s*([^\]]+)\]/i);
  if (match && match[1]) return match[1].toLowerCase();
  return (item.method || 'cash').toLowerCase();
}

export async function GET(request: NextRequest) {
  const sortBy = request.nextUrl.searchParams.get('sortBy');
  const sortOrder = request.nextUrl.searchParams.get('sortOrder');

  return proxyToBackend(request, '/payments', {
    allowedParams: [
      'page',
      'pageSize',
      'search',
      'customerId',
      'saleId',
      'receiptGroupId',
      'status',
      'from',
      'to',
      'sortBy',
      'sortOrder'
    ],
    transformResponse: (payload: unknown) => {
      const data = payload as PaginatedListPayload<PaymentDTO> | null;
      if (!data || !Array.isArray(data.items)) return payload;
      let items = [...data.items];

      if (sortBy === 'customerName') {
        items.sort((a: PaymentDTO, b: PaymentDTO) => {
          const nameA = (a.customerName || 'Walk-in').toLowerCase();
          const nameB = (b.customerName || 'Walk-in').toLowerCase();
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
      } else if (sortBy === 'method') {
        items.sort((a: PaymentDTO, b: PaymentDTO) => {
          const mA = getPaymentMethod(a);
          const mB = getPaymentMethod(b);
          return sortOrder === 'asc' ? mA.localeCompare(mB) : mB.localeCompare(mA);
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
  const body = (await request.json().catch(() => ({}))) as PaymentCreateBody;
  let upstreamNotes = body.notes;
  let upstreamMethod = body.method;

  if (body.method && body.method !== 'CASH') {
    const methodLabels: Record<string, string> = {
      JAZZCASH: 'JazzCash',
      EASYPAISA: 'EasyPaisa',
      BANK: 'Bank Transfer',
      BANK_TRANSFER: 'Bank Transfer'
    };
    const label = methodLabels[body.method] ?? body.method;
    upstreamNotes = upstreamNotes ? `[Method: ${label}] ${upstreamNotes}` : `[Method: ${label}]`;
    upstreamMethod = 'CASH';
  }

  const payload: PaymentCreateBody = {
    ...body,
    method: upstreamMethod,
    ...(upstreamNotes !== undefined ? { notes: upstreamNotes } : {})
  };

  return proxyToBackend(request, '/payments', { body: payload });
}
