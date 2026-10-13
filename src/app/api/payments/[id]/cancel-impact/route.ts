import { NextRequest } from 'next/server';
import { proxyToBackend, isCancelledStatusError, type RouteIdContext } from '@/lib/api/proxy';

export async function GET(request: NextRequest, { params }: RouteIdContext) {
  const { id } = await params;
  return proxyToBackend(request, `/payments/${id}/cancel-impact`, {
    transformError: (errorBody: unknown, status: number) => {
      if (isCancelledStatusError(errorBody, status)) {
        return {
          handled: true,
          status: 200,
          data: {
            recordType: 'PAYMENT',
            recordId: id,
            recordNo: null,
            currentCash: 0,
            cashReversedAmount: 0,
            cashReversedDirection: 'OUT',
            cashAfter: 0,
            willCauseOverdraft: false,
            customerUdharAfter: null,
            supplierPayableAfter: null,
            stockItems: [],
            blocked: true,
            blockedReason:
              'Payment is already in CANCELLED status and cannot be edited or cancelled again.'
          }
        };
      }
      return undefined;
    }
  });
}
