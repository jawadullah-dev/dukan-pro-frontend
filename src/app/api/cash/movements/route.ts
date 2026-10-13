import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/cash/movements', {
    allowedParams: [
      'page',
      'pageSize',
      'type',
      'direction',
      'search',
      'from',
      'to',
      'sortBy',
      'sortOrder'
    ]
  });
}
