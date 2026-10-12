'use client';

import { TablePageBody } from '@/components/layout/table-page-body';
import { SupplierPaymentsTable } from './supplier-payments-table';

export function SupplierPaymentsClient() {
  return (
    <TablePageBody>
      <SupplierPaymentsTable />
    </TablePageBody>
  );
}
