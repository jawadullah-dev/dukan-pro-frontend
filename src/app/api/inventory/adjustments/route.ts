import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/inventory/adjustments', {
    allowedParams: [
      'page',
      'pageSize',
      'search',
      'productId',
      'type',
      'from',
      'to',
      'sortBy',
      'sortOrder'
    ]
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/inventory/adjustments');
}
