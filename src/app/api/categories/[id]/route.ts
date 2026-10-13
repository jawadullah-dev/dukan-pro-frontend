import { NextRequest } from 'next/server';
import { proxyToBackend, type RouteIdContext } from '@/lib/api/proxy';

export async function PATCH(request: NextRequest, { params }: RouteIdContext) {
  const { id } = await params;
  return proxyToBackend(request, `/categories/${id}`);
}

export async function DELETE(request: NextRequest, { params }: RouteIdContext) {
  const { id } = await params;
  return proxyToBackend(request, `/categories/${id}`);
}
