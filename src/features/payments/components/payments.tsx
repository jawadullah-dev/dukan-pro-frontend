'use client';

import { TablePageBody } from '@/components/layout/table-page-body';
import { PaymentsTable } from './payments-table';

export function PaymentsClient() {
  return (
    <TablePageBody>
      <PaymentsTable />
    </TablePageBody>
  );
}
