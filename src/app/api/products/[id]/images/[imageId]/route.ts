import { NextRequest } from 'next/server';
import { proxyToBackend, type RouteProductImageContext } from '@/lib/api/proxy';

export async function DELETE(request: NextRequest, { params }: RouteProductImageContext) {
  const { id, imageId } = await params;
  return proxyToBackend(request, `/products/${id}/images/${imageId}`);
}
