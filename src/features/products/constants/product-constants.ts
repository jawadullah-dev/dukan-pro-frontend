import type { TrackingType, PtaStatus } from '@/lib/api/types';

export const productConstantOptions = {
  trackingTypes: [
    { labelKey: 'trackingType.quantity', value: 'QUANTITY' as TrackingType },
    { labelKey: 'trackingType.serialized', value: 'SERIALIZED' as TrackingType }
  ],
  ptaStatuses: [
    { labelKey: 'ptaApproved', value: 'PTA_APPROVED' as PtaStatus },
    { labelKey: 'nonPta', value: 'NON_PTA' as PtaStatus }
  ]
};
