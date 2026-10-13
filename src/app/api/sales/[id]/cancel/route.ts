import { NextRequest } from 'next/server';
import { proxyToBackend, type RouteIdContext } from '@/lib/api/proxy';

export async function POST(request: NextRequest, { params }: RouteIdContext) {
  const { id } = await params;
  return proxyToBackend(request, `/sales/${id}/cancel`);
}
