import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/expense-categories', {
    allowedParams: ['page', 'pageSize', 'search', 'isActive', 'sortBy', 'sortOrder']
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/expense-categories');
}
