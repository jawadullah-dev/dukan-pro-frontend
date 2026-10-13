import { NextRequest } from 'next/server';
import { proxyToBackend, isCancelledStatusError, type RouteIdContext } from '@/lib/api/proxy';
import type { CancelImpactDTO } from '@/lib/api/types';

export async function GET(request: NextRequest, { params }: RouteIdContext) {
  const { id } = await params;
  return proxyToBackend(request, `/supplier-payments/${id}/cancel-impact`, {
    transformError: (errorBody: unknown, status: number) => {
      if (isCancelledStatusError(errorBody, status)) {
        const fallbackImpact: CancelImpactDTO = {
          recordType: 'SUPPLIER_PAYMENT',
          recordId: id,
          recordNo: null,
          currentCash: 0,
          cashReversedAmount: 0,
          cashReversedDirection: 'IN',
          cashAfter: 0,
          willCauseOverdraft: false,
          customerUdharAfter: null,
          supplierPayableAfter: null,
          stockItems: [],
          blocked: true,
          blockedReason:
            'Supplier payment is already in CANCELLED status and cannot be cancelled again.'
        };
        return {
          handled: true,
          status: 200,
          data: fallbackImpact
        };
      }
      return undefined;
    }
  });
}
