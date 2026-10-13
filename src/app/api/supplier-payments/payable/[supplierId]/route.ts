import { NextRequest } from 'next/server';
import { proxyToBackend, type RouteSupplierIdContext } from '@/lib/api/proxy';

export async function GET(request: NextRequest, { params }: RouteSupplierIdContext) {
  const { supplierId } = await params;
  return proxyToBackend(request, `/supplier-payments/payable/${supplierId}`);
}
