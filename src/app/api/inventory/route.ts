import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy';
import type { InventoryItemDTO, PaginatedListPayload } from '@/lib/api/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const trackingType = searchParams.get('trackingType') ?? searchParams.get('tracking_type');
  const lowStock = searchParams.get('lowStock') ?? searchParams.get('low_stock');

  return proxyToBackend(request, '/reports/inventory', {
    allowedParams: ['page', 'pageSize', 'search', 'sortBy', 'sortOrder'],
    transformResponse: (payload: unknown) => {
      const data = payload as PaginatedListPayload<InventoryItemDTO> | null;
      if (!data || !Array.isArray(data.items)) return payload;
      let items = [...data.items];
      if (trackingType) {
        const types = trackingType.split(',');
        items = items.filter((item: InventoryItemDTO) => types.includes(item.trackingType));
      }
      if (lowStock !== null && lowStock !== undefined && lowStock !== '') {
        const isLow = lowStock === 'true';
        items = items.filter((item: InventoryItemDTO) => item.lowStock === isLow);
      }
      return {
        ...data,
        items,
        total: data.total ?? items.length
      };
    }
  });
}
