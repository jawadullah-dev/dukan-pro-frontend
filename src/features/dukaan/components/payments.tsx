'use client';

import { TablePageBody } from '@/components/layout/table-page-body';
import { PaymentsTable } from './tables/commerce-tables';

export function PaymentsClient() {
  return (
    <TablePageBody>
      <PaymentsTable />
    </TablePageBody>
  );
}
