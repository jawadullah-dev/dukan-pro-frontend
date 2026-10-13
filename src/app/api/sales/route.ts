import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/sales', {
    allowedParams: [
      'page',
      'pageSize',
      'search',
      'customerId',
      'status',
      'from',
      'to',
      'sortBy',
      'sortOrder'
    ]
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/sales');
}
