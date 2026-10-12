'use client';

import { TablePageBody } from '@/components/layout/table-page-body';
import { CashTable } from './cash-table';

export function CashLedgerClient() {
  return (
    <TablePageBody>
      <CashTable />
    </TablePageBody>
  );
}
