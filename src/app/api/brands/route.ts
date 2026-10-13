import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/brands', {
    allowedParams: ['page', 'pageSize', 'search']
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/brands');
}
